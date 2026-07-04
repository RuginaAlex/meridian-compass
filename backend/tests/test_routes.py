from datetime import date


def _create_employee_payload(**overrides):
    payload = {
        "first_name": "Nina",
        "last_name": "Costa",
        "email": "nina.costa@meridian.com",
        "job_title": "Marketing Specialist",
        "department": "Marketing",
        "start_date": date.today().isoformat(),
    }
    payload.update(overrides)
    return payload


class TestEmployeeRoutes:
    def test_get_missing_employee_returns_404(self, client):
        response = client.get("/api/employees/9999")
        assert response.status_code == 404
        assert "error" in response.get_json()

    def test_create_employee_generates_onboarding_plan(self, client, sample_templates):
        response = client.post("/api/employees", json=_create_employee_payload())
        assert response.status_code == 201
        employee_id = response.get_json()["id"]

        tasks = client.get(f"/api/tasks/employee/{employee_id}").get_json()
        assert len(tasks) == len(sample_templates)

    def test_create_employee_rejects_missing_fields(self, client):
        response = client.post("/api/employees", json={"first_name": "Incomplete"})
        assert response.status_code == 400
        assert "error" in response.get_json()

    def test_create_employee_rejects_invalid_department(self, client):
        response = client.post(
            "/api/employees", json=_create_employee_payload(department="Not A Real Department")
        )
        assert response.status_code == 400

    def test_create_employee_rejects_bad_date_format(self, client):
        response = client.post(
            "/api/employees", json=_create_employee_payload(start_date="30-06-2026")
        )
        assert response.status_code == 400

    def test_create_employee_rejects_duplicate_email(self, client, sample_templates):
        payload = _create_employee_payload()
        first = client.post("/api/employees", json=payload)
        assert first.status_code == 201

        second = client.post("/api/employees", json=payload)
        assert second.status_code == 400


class TestTaskRoutes:
    def _create_employee_with_tasks(self, client):
        response = client.post("/api/employees", json=_create_employee_payload())
        employee_id = response.get_json()["id"]
        tasks = client.get(f"/api/tasks/employee/{employee_id}").get_json()
        return employee_id, tasks

    def test_complete_task_updates_status_and_employee_progress(self, client, sample_templates):
        employee_id, tasks = self._create_employee_with_tasks(client)
        task_id = tasks[0]["id"]

        response = client.post(f"/api/tasks/{task_id}/complete")
        assert response.status_code == 200
        assert response.get_json()["status"] == "Completed"

        employee = client.get(f"/api/employees/{employee_id}").get_json()
        assert employee["progress"] == round(1 / len(tasks) * 100)

    def test_complete_missing_task_returns_404(self, client):
        response = client.post("/api/tasks/9999/complete")
        assert response.status_code == 404

    def test_block_task_with_invalid_reason_returns_400(self, client, sample_templates):
        employee_id, tasks = self._create_employee_with_tasks(client)
        task_id = tasks[0]["id"]

        response = client.post(
            f"/api/tasks/{task_id}/block",
            json={"reason": "Not a real reason", "message": "..."},
        )
        assert response.status_code == 400

    def test_block_then_resolve_full_flow(self, client, sample_templates):
        # This is the app's core feature end to end: report a blocker as
        # the employee, then resolve it as HR, and confirm the task comes
        # back to life afterwards.
        employee_id, tasks = self._create_employee_with_tasks(client)
        task_id = tasks[0]["id"]

        block_response = client.post(
            f"/api/tasks/{task_id}/block",
            json={"reason": "I do not have access", "message": "No GitHub access yet."},
        )
        assert block_response.status_code == 201
        blocker_id = block_response.get_json()["blocker"]["id"]

        resolve_response = client.post(f"/api/blockers/{blocker_id}/resolve")
        assert resolve_response.status_code == 200
        assert resolve_response.get_json()["status"] == "Resolved"

        updated_tasks = client.get(f"/api/tasks/employee/{employee_id}").get_json()
        updated_task = next(t for t in updated_tasks if t["id"] == task_id)
        assert updated_task["status"] == "In progress"

    def test_resolving_an_already_resolved_blocker_returns_400(self, client, sample_templates):
        employee_id, tasks = self._create_employee_with_tasks(client)
        task_id = tasks[0]["id"]

        block_response = client.post(
            f"/api/tasks/{task_id}/block",
            json={"reason": "Other", "message": None},
        )
        blocker_id = block_response.get_json()["blocker"]["id"]

        client.post(f"/api/blockers/{blocker_id}/resolve")
        second_attempt = client.post(f"/api/blockers/{blocker_id}/resolve")

        assert second_attempt.status_code == 400


class TestBlockerRoutes:
    def test_list_blockers_for_employee(self, client, sample_templates):
        response = client.post("/api/employees", json=_create_employee_payload())
        employee_id = response.get_json()["id"]
        tasks = client.get(f"/api/tasks/employee/{employee_id}").get_json()

        client.post(
            f"/api/tasks/{tasks[0]['id']}/block",
            json={"reason": "I need more information", "message": "Not sure what this means."},
        )

        blockers = client.get(f"/api/blockers/employee/{employee_id}").get_json()
        assert len(blockers) == 1
        assert blockers[0]["reason"] == "I need more information"
        assert blockers[0]["message"] == "Not sure what this means."

    def test_list_blockers_for_missing_employee_returns_404(self, client):
        response = client.get("/api/blockers/employee/9999")
        assert response.status_code == 404


class TestHrDashboard:
    def test_dashboard_flags_employee_with_blocked_task(self, client, sample_templates):
        response = client.post("/api/employees", json=_create_employee_payload())
        employee_id = response.get_json()["id"]
        tasks = client.get(f"/api/tasks/employee/{employee_id}").get_json()

        client.post(
            f"/api/tasks/{tasks[0]['id']}/block",
            json={"reason": "Technical issue", "message": None},
        )

        dashboard = client.get("/api/hr/dashboard").get_json()
        blocked_employee_ids = [
            row["employee"]["id"] for row in dashboard["needs_attention"]["blocked"]
        ]
        assert employee_id in blocked_employee_ids

    def test_dashboard_flags_employee_missing_buddy(self, client, sample_templates):
        response = client.post("/api/employees", json=_create_employee_payload())
        employee_id = response.get_json()["id"]

        dashboard = client.get("/api/hr/dashboard").get_json()
        missing_buddy_ids = [
            row["employee"]["id"] for row in dashboard["needs_attention"]["missing_buddy"]
        ]
        assert employee_id in missing_buddy_ids

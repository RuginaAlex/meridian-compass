from flask import Flask

from app.extensions import db, cors
from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    cors.init_app(app)

    # Imported here (not at module level) to avoid circular imports:
    # models import `db` from this package, so `app` must finish
    # initializing extensions before models are loaded.
    from app import models  # noqa: F401

    from app.routes.employees import employees_bp
    from app.routes.tasks import tasks_bp
    from app.routes.blockers import blockers_bp
    from app.routes.people import people_bp
    from app.routes.resources import resources_bp
    from app.routes.hr import hr_bp

    app.register_blueprint(employees_bp, url_prefix="/api/employees")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(blockers_bp, url_prefix="/api/blockers")
    app.register_blueprint(people_bp, url_prefix="/api/people")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(hr_bp, url_prefix="/api/hr")

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app

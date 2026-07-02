import enum


class Department(str, enum.Enum):
    ENGINEERING = "Engineering"
    SALES = "Sales"
    MARKETING = "Marketing"
    HR = "HR"
    FINANCE = "Finance"


class PersonType(str, enum.Enum):
    HR = "HR"
    MANAGER = "Manager"
    BUDDY = "Buddy"
    IT = "IT"
    COLLEAGUE = "Colleague"


class OnboardingStatus(str, enum.Enum):
    NOT_STARTED = "Not started"
    IN_PROGRESS = "In progress"
    COMPLETED = "Completed"


class TaskStage(str, enum.Enum):
    BEFORE_FIRST_DAY = "Before the first day"
    FIRST_DAY = "First day"
    FIRST_WEEK = "First week"
    FIRST_MONTH = "First month"


class TaskStatus(str, enum.Enum):
    NOT_STARTED = "Not started"
    IN_PROGRESS = "In progress"
    BLOCKED = "Blocked"
    COMPLETED = "Completed"


class ContactRole(str, enum.Enum):
    """Used only on templates, to say *which kind* of person should be the
    contact for a task. Resolved into an actual Person when the real
    OnboardingTask is generated for an employee.
    """

    HR = "HR"
    MANAGER = "Manager"
    BUDDY = "Buddy"
    IT = "IT"


class BlockerReason(str, enum.Enum):
    NO_ACCESS = "I do not have access"
    DONT_KNOW_WHO = "I do not know who to contact"
    NEED_INFO = "I need more information"
    TECHNICAL = "Technical issue"
    OTHER = "Other"


class BlockerStatus(str, enum.Enum):
    OPEN = "Open"
    RESOLVED = "Resolved"

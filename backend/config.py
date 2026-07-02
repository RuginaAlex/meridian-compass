import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")

os.makedirs(INSTANCE_DIR, exist_ok=True)



class Config:
    """Base configuration used when running the app normally."""

    SECRET_KEY = "dev-secret-key"  # fine for a local demo app, not used for real auth
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(INSTANCE_DIR, "meridian.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class TestConfig(Config):
    """Configuration used by the pytest test suite.

    Uses an in-memory SQLite database so tests never touch the real
    meridian.db file and always start from a clean slate.
    """

    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"

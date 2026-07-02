"""Shared extension instances.

Kept in their own module (instead of inside __init__.py) so that model
files can `from app.extensions import db` without causing circular imports
with the application factory.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()
cors = CORS()

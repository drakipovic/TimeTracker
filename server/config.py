import os
from datetime import timedelta


class Config(object):
    SECRET_KEY = 'secret'
    DEBUG = False
    TESTING = False
    WTF_CSRF_ENABLED = True
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=100)
    JWT_SECRET_KEY = 'jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=10)


class ProductionConfig(Config):
    SECRET_KEY = os.environ.get('time-tracker-secret-key')
    JWT_SECRET_KEY = os.environ.get('jwt-secret-key')


class DevelopmentConfig(Config):
    DEBUG = True
    ENV = 'development'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'

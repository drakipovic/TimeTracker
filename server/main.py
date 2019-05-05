import os
import logging
import datetime
from logging.handlers import RotatingFileHandler

from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

from .config import ProductionConfig, DevelopmentConfig, TestConfig

app = Flask('time-tracker', template_folder="client/public")

if os.environ.get('PROD', None):
    app.config.from_object(ProductionConfig)
else:
    app.config.from_object(TestConfig if os.environ.get(
        'TEST', None) else DevelopmentConfig)

api = Api(app, prefix='/api')
db = SQLAlchemy(app)
jwt = JWTManager(app)

handler = RotatingFileHandler('server.log', maxBytes=10000, backupCount=2)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)

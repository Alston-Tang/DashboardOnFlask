from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
#  MySQL server configuration
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:qwertyuiop@10.62.98.212/video_test'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:qwertyuiop@10.62.98.212/video_test'
#  Flask-SQLAlchemy Instance
db = SQLAlchemy(app)

from app import views
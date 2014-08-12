__author__ = 'tangh4'
from app import db


class Camera(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    ip = db.Column(db.String(15), nullable=False)
    stream_type = db.Column(db.String(15), nullable=False)
    encode_type = db.Column(db.String(15), nullable=False)
    source_url = db.Column(db.String(255), nullable=False)
    width = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(2048))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('cameras', lazy='dynamic'))

    def __init__(self, name=None, location=None, latitude=None, longitude=None,
                 ip=None, stream_type=None, encode_type=None, source_url=None,
                 width=480, height=360, description=None, user_id=None):
        self.name = name
        self.location = location
        self.latitude = latitude
        self.longitude = longitude
        self.ip = ip
        self.stream_type = stream_type
        self.encode_type = encode_type
        self.source_url = source_url
        self.width = width
        self.height = height
        self.description = description
        self.user_id = user_id

    def __repr__(self):
        return '<Camera %r>' % self.id


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)

    def __init__(self):
        pass

    def __repr__(self):
        return '<User %r>' % self.id
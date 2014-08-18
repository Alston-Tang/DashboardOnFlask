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
#    scene_id = db.Column(db.Integer, db.ForeignKey('scene.id'), nullable=False)
#    scene = db.relationship('Scene', backref=db.backref('cameras', lazy='dynamic',cascade="all, delete-orphan"))


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
        return '<Camera %r,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s>' % (self.id, self.name, self.location, self.latitude, self.longitude, self.ip, self.stream_type, self.encode_type, self.source_url, self.width, self.height, self.description, self.user_id)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)

    def __init__(self):
        pass

    def __repr__(self):
        return '<User %r>' % self.id

class Scene(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    description = db.Column(db.String(2048))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('scenes', lazy='dynamic'))
    camera_id = db.Column(db.Integer, db.ForeignKey('camera.id'), nullable=False)
    camera = db.relationship('Camera', backref=db.backref('scenes', lazy='dynamic',cascade="all, delete-orphan"))

    def __init__(self, name=None, location=None, description=None, user_id=None, camera_id=None):
        self.name = name
        self.location = location
        self.description = description
        self.user_id = user_id
        self.camera_id = camera_id

    def __repr__(self):
        return '<Camera %r,%s,%s,%s,%s>' % (self.id, self.name, self.location, self.description, self.user_id)

#class CameraScene(db.Model):
#    camera_id = db.Column(db.Integer, db.ForeignKey('camera.id'), nullable=False)
#    scene_id = db.Column(db.Integer, db.ForeignKey('scene.id'), nullable=False)
#    camerascene = db.relationship('Camera', backref=db.backref('scenes', lazy='dynamic'))

#    def __init__(self,camera_id=None,scene_id=None):
#        self.camera_id = camera_id
#        self.scene_id = scene_id
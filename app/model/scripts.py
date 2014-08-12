__author__ = 'tangh4'
from app import db


def create():
    db.create_all()


def test():
    from models import Camera
    db.session.add(Camera(name="test", location="test", ip="10.62.98.123", stream_type="rtmp", encode_type="h264",
                          source_url="rtmp://10.62.98.123/live/test", user_id=1))
    db.session.commit()


def test2():
    from models import Camera
    cameras = Camera.query.all()
    pass

test2()
#coding=utf-8
__author__ = 'linc17'

from app import db
#from app import models
from models import Camera
#from camera import Camera
class DBCamera():

#    def create():
#        db.create_all()

#    def __init__(self, add_camera, delete_camera, get_allcameras, get_camera):
#        self.add_camera = add_camera
#        self.delete_camera = delete_camera
#        self.get_allcameras = get_allcameras
#        self.get_camera = get_camera

#    def __init__(self, camera):
#     self.camera=camera

    def add_camera(self,camera):
#        Session = sessionmaker()
#        Session.configure(bind=engine)
#        session = Session()
#        c = models.Camera()
        db.session.add(camera)
        db.session.flush()
        db.session.commit()
        #进db
#    def __init__(self):
#        pass
    def delete_camera(self,camera_id):
        c = Camera.query.get(camera_id)
        db.session.delete(c)
        db.session.flush()
        db.session.commit()


#    def edit_camera(selfid):
        #参数

    def get_allcameras(self):
      #show cameras' list
      cameras = Camera.query.all()
      print cameras

    def get_camera(self,camera_id):
        camera = Camera.query.get(camera_id)
        print camera

    #show one camera
if __name__ == "__main__":
#    add_camera(Camera(name="test1", location="test1", ip="10.62.98.321",stream_type="rtmp", encode_type="h264",source_url="rtmp://10.62.98.123/live/test", user_id=1))

    dbc= DBCamera()
#    dbc.add_camera(Camera(name="test1", location="test1", ip="10.62.98.321",
#                          stream_type="rtmp", encode_type="h264",source_url="rtmp://10.62.98.123/live/test", user_id=1))
#    dbc.delete_camera(1)
#    dbc.get_allcameras()
    dbc.get_camera(1)
#  camera1 =db_camera.add_camera( )
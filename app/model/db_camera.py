#coding=utf-8
__author__ = 'linc17'

from app import db
#from app import models
from models import Camera
#from camera import Camera
class DBCamera():

#    def create():
#        db.create_all()


#    def __init__(self, camera):
#     self.camera=camera
#    def __init__(self):
#     pass

    def add_camera(self,camera):
#        Session = sessionmaker()
#        Session.configure(bind=engine)
#        session = Session()
#        c = models.Camera()
        db.session.add(camera)
        db.session.flush()
        db.session.commit()
        print "Added successfully!"

    def delete_camera(self,camera_id):
        c = Camera.query.get(camera_id)
        db.session.delete(c)
        db.session.flush()
        db.session.commit()
        print("Deleted successfully!")


#    def edit_camera(self,camera_id):
        #参数

    def get_allcameras(self):  #show cameras' list
        cameras = Camera.query.all()
        print("The cameras' parameters are:")
        print cameras

    def get_camera(self,camera_id):  #show one camera
        camera = Camera.query.get(camera_id)
        print("The camera's parameters are:")
        print camera


if __name__ == "__main__":##测试
    dbc= DBCamera()
#添加camera样例
#    dbc.add_camera(Camera(name="test1", location="test1", ip="10.62.98.321",
#                          stream_type="rtmp", encode_type="h264",source_url="rtmp://10.62.98.123/live/test", user_id=1))

#删除camera样例
#    dbc.delete_camera(5)

#get所有camera信息
#    dbc.get_allcameras()

#get某个camera信息
    dbc.get_camera(1)


#    add_camera(Camera(name="test1", location="test1", ip="10.62.98.321",stream_type="rtmp", encode_type="h264",source_url="rtmp://10.62.98.123/live/test", user_id=1))
#  camera1 =db_camera.add_camera( )
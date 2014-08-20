#coding=utf-8
_author__ = 'linc17'

from app import db
from models import Scene
class DBScene():
    def create(shelf):
        db.create_all()


    def add_scene(self,scene):
        db.session.add(scene)
        db.session.flush()
        db.session.commit()
        print ("Added successfully!")

    def delete_scene(self,scene_id):
        s = Scene.query.get(scene_id)
        db.session.delete(s)
        db.session.flush()
        db.session.commit()
        print("Deleted successfully!")


#    def edit_scene(self,scene_id,scene):




    def get_allscenes(self):
        scenes = Scene.query.all()
        print("The scenes' parameters are:%s")%scenes


    def get_scene(self,scene_id):
        scene = Scene.query.get(scene_id)
        print("The scene's parameters are:%s")%scene

if __name__ == "__main__":##测试
    dbs= DBScene()
#    dbs.create()
#添加scene样例
    dbs.add_scene(Scene(name="test", location="test", user_id=1, camera_id=2))

#删除scene样例
    dbs.delete_scene(6)

#get所有scene信息
#    dbs.get_allscenes()

#get某个scene信息
#    dbs.get_scene(1)
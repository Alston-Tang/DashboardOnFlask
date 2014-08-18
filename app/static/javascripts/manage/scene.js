/**
 * Created by tangh4 on 2014/8/12.
 */

$(document).ready(function(){
    manage=new SceneManage({'serverUrl':'/scene'});
});


Scene=function(manage,opt){
//Check and set default
    opt=typeof(opt)=='object'?opt:{};
    opt.name=opt.name?opt.name:"None";
    opt.location=opt.location?opt.location:"Unknown";
    opt.desc=opt.desc?opt.desc:"None";
    opt.cameras=typeof (opt.cameras)=='object'?opt.cameras:{};
    opt.apps=typeof(opt.apps)=='object'?opt.apps:{};
    opt.id=opt.id?opt.id:undefined;
//Copy value to Scene
    this.manage=manage;
    this.config={};
    this.config.name=opt.name;
    this.config.location=opt.location;
    this.config.desc=opt.desc;
    this.config.id=opt.id;
    this.cameras=opt.cameras;
    this.apps=opt.apps;
};

Scene.prototype={
    add:function(){
        var cur=this;
        $.ajax(this.manage.serverUrl,{
            data:this.config,
            type:'POST',
            success:function(data){
                data=JSON.parse(data);
                if(data.success && !isNaN(data.id)){
                    cur.config.id=data.id;
                    cur.manage.success.addA.call(cur.manage,cur);
                }
                else{
                    throw "Server:"+data.error;
                }
            }
        })
    },
    remove:function(){

    },
    addCamera:function(){

    },
    removeCamera:function(){

    },
    addApp:function(){

    },
    removeApp:function(){

    }
};

SceneManage=function(opt){
    var cur=this;
//Check existence
    if(!opt.hasOwnProperty('serverUrl')){
        throw "server url is undefined";
    }
//Init value
    this.serverUrl=opt.serverUrl;
    this.scenelist={};
//Create loading panel
    this.settingPanel=new ManagePanel(document.getElementById('scene-area'),document.getElementById('scene-setting'));
    this.loadingPanel=new LoadingPanel();
//Set loading panel
    //noinspection JSUnresolvedFunction
    $(document).ajaxStart(function(){
        cur.loadingPanel.dis();
    });
    //noinspection JSUnresolvedFunction
    $(document).ajaxComplete(function(){
        cur.loadingPanel.hide();
    });
    //Bind button listener
    $('#side-add-scene').click(function(){
        cur.addA();
    });
    //Indicate which scene is displayed in panel, initial is null
    this.display=null;
    //Get scene list from server
    this.getList();
};

SceneManage.prototype={
    getList:function(){
        var cur=this;
        $.ajax(this.serverUrl,{
            type:'GET',
            success:function(data){cur.success.getList.call(cur,data)},
            error:this.error.getList
        });
    },
    addA:function(){
        this.settingPanel.loadSettingPanel('add-scene',undefined,this.addOrChangeHandle,this);
        this.settingPanel.dis();
    },
    addOrChangeHandle:function(formDom){
        var data=$(formDom).serializeArray();
        data=thmTools.serializeToObj(data);
        new Scene(this,data).add();
    },
    removeA:function(){

    },
    addACamera:function(){

    },
    removeACamera:function(){

    },
    addAApp:function(){

    },
    removeAApp:function(){

    }
};

SceneManage.prototype.UI={
    loadA:function(scene){
        // This scene is displayed on panel
        this.display=scene;
        var config=scene.config;
        //Get length of cameras and apps
        config.cameraNum=Object.keys(scene.cameras).length;
        config.appNum=scene.apps.length;
        //Render panel
        $('#home').html(tmpl('home_panel',config));
        $('#cameras').html(tmpl('camera_panel',config));
        $('#apps').html(tmpl('app_panel',config));
        //Render camera panel content
        var content="";
        for (var camera in scene.cameras){
            if(scene.cameras.hasOwnProperty(camera)) {
                content += tmpl("camera_item", scene.cameras[camera]);
            }
        }
        $('#camera-wall').html(content);
        //Render app panel content
        content="";
        for (var i=0; i<scene.apps.length; i++){
            content += tmpl("app_item",scene.apps[i]);
        }
        $('#app-wall').html(content);
    },
    appendA:function(scene){
        var config=scene.config;
        // Render side bar
        var sideBarDoms=thmTools.parseStringToDom(tmpl('side_bar_tmpl',config));
        // Append to existing dom
        thmTools.appendDomList($('#side-bar').children('.main-list')[0],sideBarDoms);
        // Bind dom with scene
        scene.dom={};
        scene.dom.sideBar=sideBarDoms[0];
        scene.dom.sideBar.scene=scene;
        // Set scene switch listener
        $(scene.dom.sideBar).click(function(){
            this.scene.manage.UI.loadA(this.scene);
        });
    },
    deleteA:function(){

    },
    appendACamera:function(){

    },
    deleteACamera:function(){

    },
    appendAApp:function(){

    },
    deleteAApp:function(){

    }
};

SceneManage.prototype.success={
    getList:function(data){
        data=thmTools.checkSuccess(data);
        for( var i=0; i<data.length; i++){
            this.scenelist[data[i].id.toString()]=new Scene(this,data[i]);
        }
        //Load side bar
        for (var scene in this.scenelist){
            if (this.scenelist.hasOwnProperty(scene)){
                this.UI.appendA(this.scenelist[scene]);
            }
        }
        //Render UI
        for (scene in this.scenelist){
            if (this.scenelist.hasOwnProperty(scene)){
                this.UI.loadA(this.scenelist[scene]);
                break;
            }
        }
    },
    addA:function(scene){
        this.scenelist[scene.config.id.toString()]=scene;
        this.UI.appendA(scene);
        this.settingPanel.hide();
    },
    removeA:function(){

    },
    addACamera:function(){

    },
    removeACamera:function(){

    },
    addAApp:function(){

    },
    removeAApp:function(){

    }
};

SceneManage.prototype.error={
    getList:function(data){
        throw "Connection error";
    },
    addA:function(){
        throw "Connection error";
    },
    removeA:function(){
        throw "Connection error";
    },
    addACamera:function(){
        throw "Connection error";
    },
    removeACamera:function(){
        throw "Connection error";
    },
    addAApp:function(){
        throw "Connection error";
    },
    removeAApp:function(){
        throw "Connection error";
    }
};
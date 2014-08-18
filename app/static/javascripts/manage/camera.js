/**
 * Created by tangh4 on 2014/8/5.
 */

var CameraDemo={};


CameraDemo.preview=function(dom,url){
    $f($(dom).attr('id'), {'src':resource_url+"flowPlayer/flowPlayer-3.2.18.swf",
        wmode:'opaque'},{
        clip: {
            url: url,
            live: true,
            provider: 'influxis'
        },
        plugins: {
            controls: null,
            influxis: {
                url: resource_url+"flowPlayer/flowplayer.rtmp-3.2.12-dev.swf",
                netConnectionUrl: 'rtmp://10.62.98.123/live'
            }
        }
    });
};

$(document).ready(function(){
    var temp=document.getElementById('camera1');
    CameraDemo.preview(temp,'rtmp://10.62.98.123/live/test');
    var manage=new CameraManage({'serverUrl':'/test'});
});
//Camera handles add/delete/edit physical camera's configuration
var Camera=function(manage,opt){
    // check existence Todo:validation
    if (!manage){
        throw "Camera should only be created by CameraManage";
    }
    if (!opt.ip){
        throw "IP is undefined";
    }
    if (!opt.name){
        opt.name='Untitled';
    }
    if(!opt.location){
        opt.location='Unknown';
    }
    if(isNaN(opt.latitude)){
        opt.latitude=NaN;
    }
    if(isNaN(opt.longitude)){
        opt.longitude = NaN;
    }
    if(!opt.streamType){
        opt.streamType='rtmp';
        console.log('Undefined stream type. Set to "rtmp"');
    }
    if(!opt.encodingType){
        opt.encodingType='h264';
        console.log('Undefined encoding type. Set to "h264"');
    }
    if(!opt.resolution || isNaN(opt.resolution.width) || isNaN(opt.resolution.height)){
        opt.resolution={width:480,height:360};
    }
    if(!opt.description){
        opt.description='No description';
    }
    //end
    //copy value to this object
    this.manage=manage;
    this.config={};
    this.config.ip=opt.ip;
    this.config.name=opt.name;
    this.config.location=opt.location;
    this.config.latitude=opt.latitude;
    this.config.longitude=opt.longitude;
    this.config.streamType=opt.streamType;
    this.config.encodingType=opt.encodingType;
    this.config.resolution=opt.resolution;
    this.config.description=opt.description;
    //end
};

Camera.prototype.add=function(){
    var cur=this;
    $.ajax(this.manage.serverUrl,{
        type:'POST',
        // Data format JSON {name:{str} ,location:{str},latitude:{float},longitude:{float},ip:{str},streamType:{str},encodingType:{str},
        // resolution:{width:{int},height:{int}},description:{int}}
        data:this.config,
        // Data format JSON {success:some value if server return normally, ip:ip of this camera, error:some value if error}
        success:function(data) {
            data=JSON.parse(data);
            if (data.success && !isNaN(data.id)) {
                cur.config.id=data.id;
                cur.manage.addSuccess(cur, data);
            }
            else{
                throw "Server: error while add new camera";
            }
        },
        error:function(data){
            throw "Client: error while add new camera";
        }
    });
};

Camera.prototype.remove=function(){
    var cur=this;
    $.ajax(this.manage.serverUrl,{
        type:'DELETE',
        //Data format JSON {id:{int}}
        data:this.config.id,
        //Data format JSON {success:some value if server return normally, id:id of this camera, error:some value if error}
        success:function(data){
            data=JSON.parse(data);
            if (data.success) {
                cur.manage.removeSuccess(cur,data);
            }
            else{
                throw "Server: error while delete camera";
            }
        },
        error:function(data){
            throw "Client: error while delete camera";
        }
    });
};

// Get camera's attributes as a object: {id:{int},name:{str},location:{str},latitude:{float},longitude:{float},ip:{str},streamType:{str},encodingType:{str},
// resolution:{width:{int},height:{int}},description:{int}}
Camera.prototype.getConfig=function(){
    var rtVal={};
    for(var item in this){
        if(this.hasOwnProperty(item)){
            rtVal[item]=this[item];
        }
    }
    return rtVal;
};

//Format JSON {id:{int},name:{str},location:{str},latitude:{float},longitude:{float},ip:{str},streamType:{str},encodingType:{str},
// resolution:{width:{int},height:{int}},description:{int}}
Camera.prototype.saveConfig=function(config){
    var cur=this;
    config.id=this.config.id;
    $.ajax(this.manage.serverUrl,{
        type:'PUT',
        //Data format JSON {id:{int}}
        data:config,
        //Data format JSON {success:some value if server return normally, id:id of this camera, error:some value if error}
        success:function(data){
            data=JSON.parse(data);
            if (data.success) {
                cur.config=config;
                cur.manage.editSuccess(cur,data);
            }
            else{
                throw "Server: error while eidt camera";
            }
        },
        error:function(data){
            throw "Client: error while edit camera";
        }
    });
};


//CameraManage handles add/delete/get/ Camera, connect with server and maintain page's display
var CameraManage=function(opt){
    var cur=this;
    //check existence
    if (!opt.hasOwnProperty('serverUrl')){
        throw "server url is undefined";
    }
    //end
    this.serverUrl=opt.serverUrl;
    this.cameralist={};
    //Create extra panel controller
    this.settingPanel=new ManagePanel(document.getElementById('camera-area'),document.getElementById('camera-setting'));
    this.loadingPanel=new LoadingPanel();
    //Set global ajax event listener
    //noinspection JSUnresolvedFunction
    $(document).ajaxStart(function(){
        cur.loadingPanel.dis();
    });
    //noinspection JSUnresolvedFunction
    $(document).ajaxComplete(function(){
        cur.loadingPanel.hide();
    });
    //Bind button listener
    $('#side-add-camera').click(function(){
        cur.addA();
    });
};


CameraManage.prototype.get=function(){
// Request camera list
    $.ajax(this.serverUrl,{success:this.receive,
                             error:this.receiveError});
};

CameraManage.prototype.receive=function(data){
//date format JSON {success:(some value if server return normally),con:[{url:rtmp://....,name:camera1,description:camera1....},{...},{...},...]}
// Receive a lists of cameras from server and refresh cameralist
    data=JSON.parse(data);
    if (!data.success){
        throw "Server:get camera list error"
    }
    for(var i=0; i<data.con.length; i++){
        this.cameralist[data.con[i].id.toString()]=new Camera(this,data.con[i]);
    }
};

CameraManage.prototype.receiveError=function(data){
    throw "Client:get camera lists error";
};

CameraManage.prototype.error=function(data){
//Display error information
};

CameraManage.prototype.display=function(){
    this.clear();
    for(var camera in this.cameralist){
        if(this.cameralist.hasOwnProperty(camera)) {
            this.appendA(this.cameralist[camera]);
        }
    }
};

CameraManage.prototype.deleteA=function(camera){
    $(camera.dom).remove();
};

CameraManage.prototype.changeA=function(camera){
    this.deleteA(camera);
    this.appendA(camera);
};

CameraManage.prototype.appendA=function(camera){
    //Create container
    var dom=document.createElement('div');
    dom.bindCamera=camera;
    //Render html
    $(dom).addClass('col-md-3').
           html(tmpl('camera-panel',camera.config));
    //Set setting handler
    $(dom).find('.btn-primary').click(function(){
        var cur=this;
        while(!cur.bindCamera){
            cur=cur.parentNode;
        }
        cur.bindCamera.manage.editA(cur.bindCamera);
    });
    //Set remove handler
    $(dom).find('.btn-danger').click(function(){
        var cur=this;
        while(!cur.bindCamera){
            cur=cur.parentNode;
        }
        cur.bindCamera.manage.removeA(cur.bindCamera);
    });
    //Add content to page
    camera.dom=dom;
    $('#camera-wall').append(dom);
    //Load camera
    CameraDemo.preview($(dom).find('object'),camera.config.ip);
};

//date format JSON {camera:id of camera}
CameraManage.prototype.removeA=function(camera){
    camera.remove();
};

//data format JSON {success:some value if server return normally, url: url of camera (exists no matter success or error)}
CameraManage.prototype.removeSuccess=function(camera,data){
    var cameraExist=this.cameralist[camera.config.id.toString()];
    if (!cameraExist){
        throw "Client: can't find this camera"
    }
    this.deleteA(cameraExist);
    delete this.cameralist[camera.config.id.toString()];
};

CameraManage.prototype.removeError=function(date){
    throw "Client:delete camera error";
};

CameraManage.prototype.addA=function(){
    this.settingPanel.loadSettingPanel('add-camera',undefined,this.addOrChangeHandle,this);
    this.settingPanel.dis();
};

CameraManage.prototype.editA=function(camera){
    this.settingPanel.loadSettingPanel('edit-camera',camera.config,this.addOrChangeHandle,this);
    this.settingPanel.dis();
};
// Parse config form from html and change/create Camera
CameraManage.prototype.addOrChangeHandle=function(formDom){
    //Convert to [{name:{str},value:{str},{},{}...]
    var data=$(formDom).serializeArray();
    //Convert to {name:value,name:value...}
    data=thmTools.serializeToObj(data);
    //Move width and height in to resolution{}
    data.resolution={};
    data.resolution.width=data.width;
    data.resolution.height=data.height;
    //If id exists then change config else create new Camera
    if(data.id){
        this.cameralist[data.id].saveConfig(data);
    }
    else{
        try {
            new Camera(this,data).add();
        }
        catch (e){
            throw e;
        }
    }
};

CameraManage.prototype.addSuccess=function(camera,data){
    this.cameralist[camera.config.id.toString()]=camera;
    this.appendA(camera);
    this.settingPanel.hide();
};

CameraManage.prototype.editSuccess=function(camera,data){
    this.changeA(camera);
    this.settingPanel.hide();
};

CameraManage.prototype.clear=function(){
// Clear all camera nodes on dashboard
    $('#camera-area').html("");
};
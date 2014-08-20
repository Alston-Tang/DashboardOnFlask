/**
 * Created by Tang on 2014/7/2.
 */
if(!resource_url){
    var resource_url='/static/';
}

DashBoard= {
    DrawList:[],
    TrackList:[],
    VideoList:[],
    AnList:[],
    idPool:{},
    resId:function(id){
        if (this.idPool[id]){
            throw "Same id exists";
        }
        this.idPool[id]=true;
    },
    Chart:function(dom,type,id,opt) {
        if (!dom || !type || !id) {
            throw "A html node and chart type is required.";
        }
        if (!CharSet[type]) {
            throw "Error type";
        }
        this.resId(id);
        var c=new DashBoard.ChartCons(dom,type,id, opt);
        this.DrawList.push(c);
        return c;
    },
    Track:function(dom,id,opt) {
        if (!dom || !id) {
            throw "A html node and a unique id is required.";
        }
        this.resId(id);
        var c=new DashBoard.TrackPicCons(dom,id,opt);
        this.TrackList.push(c);
        return c;
    },
    Video:function(dom,url,id,opt) {
        if (!dom || !id) {
            throw "A html node and a unique id is required.";
        }
        if (!url) {
            throw "url is required";
        }
        this.resId(id);
        var c = new DashBoard.VideoCons(dom, url, id, opt);
        this.VideoList.push(c);
        return c;
    },
    AnomalyDetection:function(dom,url,id,opt){
        if(!dom ||!id){
            throw "A html node and a unique id is required";
        }
        if(!url){
            throw "url is required";
        }
        this.resId(id);
        var c= new DashBoard.AnCons(dom,url,id,opt);
        this.AnList.push(c);
        return c;
    }
};

DashBoard.basePrototype=function(thisClass){
    if (typeof (thisClass.prototype)!='object'){
        thisClass.prototype={};
    }
    thisClass.prototype.urlIs=function(url){
        if(url==undefined){
            return this.url;
        }
        else{
            this.url=url;
            return this;
        }
    };
    thisClass.prototype.intervalIs=function(interval){
        if(interval==undefined){
            return interval;
        }
        else{
            this.interval=interval;
            return this;
        }
    };
};

DashBoard.AnCons=function(dom,url,id,opt){
    if(!dom||!url||!id){
        throw "A html node and video url is required.";
    }
    this.dom=dom;
    this.id=id;
    this.url=url;
    //Detect binding video
    this.bindVideo=opt.bindVideo?opt.bindVideo:null;
    //Image displayed on page
    this.display={};
    //Image to be displayed
    this.loadingList={};
};
DashBoard.AnCons.prototype={
    query:function(start,end){
        var cur=this;
        $.ajax(this.url,{
            type:'GET',
            data:{id:this.id,start:start,end:end},
            crossDomain:true,
            success:function(data){
                cur._querySuccess.call(cur,data)
            },
            error:this._queryError
        })
    },
    // Return JSON format {success:exists if no error,
    //                     error:error information,
    //                     content:[{time: time of Pic,
    //                               img: picture content,
    //                               tsVideo: relative time in a video
    //                               tsCapture: real time
    //                               sourceId: id of source
    //                               fingerPrint: = =
    //                               frameId: id of this frame
    //                               detect:[{information of detection},{},....]},
    //                              {...},
    //                             ]
    //                    }
    //                    detect is in time order
    _querySuccess:function(data){
        data=JSON.parse(data);
        if(!data.success){
            //Error handle
        }
        else {
            var images=[];
            //Insert to loading list
            for(var i=0; i<data.content.length; i++){
                data.content[i].img=this._createImg(data.content[i].img);
                this.loadingList[data.content[i].frameid.toString()]=data.content[i];
            }
        }
    },
    //Display loaded picture in loading list
    displayNow:function(){
        for(var pic in this.loadingList){
            if(this.loadingList.hasOwnProperty(pic)){
                //Picture has loaded
                if(this.loadingList[pic].img.complete){
                    var inf=this.loadingList[pic];
                    //Draw
                    var canvas = this._createCanvas(inf.img);
                    var ctx = canvas.getContext('2d');
                    for (var j = 0; j < inf.detect.length; j++) {
                        this._drawA(canvas, ctx, inf.detect[j]);
                    }
                    this._insertA(inf.frameid,this._assembleContainer(canvas));
                    delete this.loadingList[pic];
                }
            }
        }
    },
    // Transfer response image to a valid img node
    _createImg:function(img){
        var imgDom;
        imgDom = document.createElement('img');
        //TODO transfer image to data to a valid img node
        // Demo code
        $(imgDom).attr('src','/static/resource/demo_pic.png');
        $('#img-loader').append(imgDom);
        //end
        return imgDom
    },
    _createCanvas:function(imgDom){
        var cur=this;
        if (!imgDom.complete){
            //If image is not loaded yet, wait for 1 second and retry
            setTimeout('cur._createCanvas.call(cur,imgDom);',1000);
            return;
        }
        //Else draw img to canvas
        var canvasDom=document.createElement('canvas');
        canvasDom.width=imgDom.naturalWidth;
        canvasDom.height=imgDom.naturalHeight;
        var ctx=canvasDom.getContext('2d');
        ctx.drawImage(imgDom,0,0,canvasDom.width,canvasDom.height);
        return canvasDom;
    },
    _queryError:function(data){
        //Error handle
    },
    _drawA:function(canvasDom,ctx,detection){
        var shape=detection.shape.toLowerCase();
        if(!this._shape[shape]){
            // An unsupported shape
            console.log('Can not draw shape "'+shape+'"');
            return;
        }
        this._shape[shape](ctx,detection.x,detection.y,detection.w,detection.h);
    },
    _shape:{
        rectangle:function(ctx,x,y,w,h){
            ctx.strokeStyle='red';
            ctx.lineWidth=2;
            ctx.strokeRect(x,y,w,h);
        }
    },
    _assembleContainer:function(canvasDom){
        var div=document.createElement('div');
        $(div).attr({'class':'col-md-3'}).css({'margin-bottom':'5px'}).append(canvasDom);
        $(canvasDom).addClass('img-responsive');
        return div;
    },
    _insertA:function(frameId,canvasDom){
        // Same frame already displayed
        if(this.display[frameId.toString()]){
            //TODO replace dom?
        }
        // Not displayed yet
        else{
            this.dom.insertBefore(canvasDom,this.dom.firstChild);
            this.display[frameId.toString()]=canvasDom;
        }
    },
    clear:function(start,end){
        //TODO clear a range of detections
    },
    clearAll:function(){
        this.dom.html();
    },
    enableUpdate:function(){
        var cur=this;
        setInterval(function(){cur._queryControl.call(cur)},this.interval);
        setInterval(function(){cur.displayNow.call(cur)},this.interval);
    },
    _queryControl:function(){
        //If is a video file
        var time=this.bindVideo?this.bindVideo.getTime()*1000:Date.getTime();
        var start=time-5000<0?0:time-5000;
        var end=time;
        if(isNaN(start) || isNaN(end)){
            //Possible reason: video haven't been loaded yet
            return;
        }
        this.query(start,end);
    }
};
DashBoard.basePrototype(DashBoard.AnCons);

DashBoard.VideoCons=function(dom,url,id,opt){
    if(!dom||!url||!id){
        throw "A html node and video url is required.";
    }
    this.dom=dom;
    this.id=id;
    this.url=url;
    opt=opt?opt:{};
    if(opt.live){
        this.live=true;
    }
    //check dom id exists
    if (!$(this.dom).attr('id')){
        $(this.dom).attr('id',this.id);
    }
    //create player
    this.player=this.live?this._livePlayer():this._videoPlayer();
};

DashBoard.ChartCons=function(dom,type,id,opt){
    if(!dom||!type||!id){
        throw "A html node and chart type is required.";
    }
    if(!CharSet[type]){
        throw "Error type";
    }
    this.dom=dom;
    this.titleDom=$(this.dom).children('.title')[0];
    this.contentDom=$(this.dom).children('.content')[0];
    this.type=type;
    this.id=id;
    opt=opt?opt:{};
    this.draw=CharSet[type];

    //Calculate other option
    this.urlAttr=opt.url? opt.url:'chart/'+this.id;
    this.intervalAttr=opt.interval? opt.interval:3000;
};

DashBoard.TrackPicCons=function(dom,id,opt){
    var cur=this;
    if(!dom || !id){
        throw "A html node and a unique id is required"
    }
    this.dom=dom;
    this.id=id;
    opt=opt?opt:{};

    //Calculate other option
    this.urlAttr=opt.url? opt.url:'chart/'+this.id;
    this.intervalAttr=opt.interval? opt.interval:3000;
    //Create cover SVG
    this.svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    this.dom.offsetParent.appendChild(this.svg);
    //Set SVG position and size
    $(this.svg).css({'position':'absolute',
                     'top':this.dom.offsetTop,
                     'left':this.dom.offsetLeft,
                     'width':this.dom.offsetWidth,
                     'height':this.dom.offsetHeight,
                     'z-index':$(this.dom).css('z-index')?$(this.dom).css('z-index')+1:1
                     }).
                attr({'viewBox':"0 0 "+this.dom.naturalWidth+" "+this.dom.naturalHeight,
                      'width':this.dom.naturalWidth,
                      'height':this.dom.naturalHeight
                     });
    //Set callback to auto change canvas size when image's size changed
    $(window).resize(function(){
        $(cur.svg).css({'position':'absolute',
                        'top':cur.dom.offsetTop,
                        'left':cur.dom.offsetLeft,
                        'width':cur.dom.offsetWidth,
                        'height':cur.dom.offsetHeight
                        });
    });
};

DashBoard.DataRange=function(begin,end,data,opt){
    if (begin.constructor && begin.constructor==Date){
        this.begin=begin;
    }
    else this.begin=new Date(begin);
    if (end==undefined){
        this.end=new Date();
    }
    else if (end.constructor && end.constructor==Date){
        this.end=end;
    }
    else{
        this.end=new Date(end);
    }
    this.con=[];
    if (data!=undefined){
        for(var i=0; i<data.length; i++){
            if(data.date && data.value){
                this.insert(data.date,data.value);
            }
        }
    }
};

//Track
DashBoard.TrackPicCons.prototype={
    point:function(top,left,opt){
        var point=document.createElementNS("http://www.w3.org/2000/svg",'circle');

        //Use custom size and color if provided
        opt=opt==undefined?{}:opt;
        var r=isNaN(opt.r)?1:opt.r;
        var strokeColor=opt.hasOwnProperty('strokeColor')?opt.strokeColor:'red';
        var fillColor=opt.hasOwnProperty('fillColor')?opt.fillColor:'red';
        $(point).attr({'cx':left,'cy':top,'r':r,'stroke':strokeColor,'fill':fillColor});
        this.svg.appendChild(point);
        return point;
    },
    line:function(oriTop,oriLeft,dstTop,dstLeft,opt){
        var line=document.createElementNS("http://www.w3.org/2000/svg",'line');

        //Use custom size and color if provided
        opt=opt==undefined?{}:opt;
        var width=isNaN(opt.width)?1:opt.width;
        var strokeColor=opt.hasOwnProperty('strokeColor')?opt.strokeColor:'red';
        $(line).attr({'x1':oriLeft,'y1':oriTop,'x2':dstLeft,'y2':dstTop,'stroke':strokeColor,'stroke-width':width});
        this.svg.appendChild(line);
        return line;
    },
    rect:function(top,left,width,height,opt){
        var rect=document.createElementNS("http://www.w3.org/2000/svg",'rect');

        //Use custom size and color if provided
        opt=opt==undefined?{}:opt;
        var strokeColor=opt.hasOwnProperty('strokeColor')?opt.strokeColor:'red';
        var fillColor=opt.hasOwnProperty('fillColor')?opt.fillColor:'red';
        $(rect).attr({'x':left,'y':top,'width':width,'height':height,'stroke':strokeColor,'fill':fillColor});
        this.svg.appendChild(rect);
        return rect;
    },
    clear:function(selector){
        if(selector){

        }
        else{
            $(this.svg).children().remove();
        }
    },
    //Data parse
    parseType:function(type,data){
        var rv={};
        switch (type){
            case 'Rectangle':
                rv.left=data[1];
                rv.top=data[2];
                rv.width=data[3];
                rv.height=data[4];
                break;
        }
        return rv;
    },

    //Display Control
    drawList:function(list,opt){
        var cur=this;
        if (opt.hasOwnProperty('animation')){
            var animation=opt.animation;
            var speed=isNaN(animation.speed)?500:animation.speed;
            var lastFun=animation.last?animation.last:null;
            var finalFun=animation.final?animation.final:null;
            var currentFun=animation.cur?animation.cur:null;
            var loop=animation.loop;

            var rock=function(n,last){
                var thisElement={'num':n};
                thisElement.dom=cur.draw(list[n]);
                if(currentFun) currentFun(thisElement.dom);
                if(lastFun){
                    lastFun(last);
                }
                if(list[n+1]!=undefined){
                    setTimeout(function(){
                        rock(n+1,thisElement);
                    },speed);
                }
                else{
                    if(finalFun) finalFun();
                    if(loop){
                        rock(1,thisElement);
                    }
                }
            }
        }
        rock(1,null);
    },
    draw:function(g){
        var pattern=this.parseType(g[0],g);
        switch (g[0]){
            case 'Rectangle':
                return this.rect(pattern.top,pattern.left,pattern.width,pattern.height,{'fillColor':'rgba(0,0,0,0)'});
        }
    },
    //Update Control
    disInterval:function(){

    },
    disableUpdate:function(){

    },
    enableUpdate:function(){
        var cur=this;
        if(!this.urlAttr) return false;
        setInterval(function(){
            cur.getUpdate();
        },this.intervalAttr);
        cur.getUpdate();
    },
    getUpdate:function(){
        var cur=this;
        $.ajax(this.urlAttr,{
            success:function(data,textStatus,jqXHR){
                data= JSON.parse(data);
                var handleLast=function(last){
                    if (last) {
                        $(last.dom).css({'stroke':'blue','stroke-width':1});
                    }
                };
                var handleFinal=function(){
                    cur.clear();
                };
                var handleStyle=function(dom){
                    $(dom).css('stroke-width',5);
                };
                cur.drawList(data,{'animation':{'speed':100,'last':handleLast,'final':handleFinal,'cur':handleStyle,'loop':true}});
            }
        })
    }
};
DashBoard.basePrototype(DashBoard.TrackPicCons);

//Chart
DashBoard.ChartCons.prototype={
    enableUpdate:function(){
        var cur=this;
        if(!this.urlAttr) return false;
        setInterval(function(){
            cur.getUpdate();
        },this.intervalAttr);
        cur.getUpdate();
        return this;
    },

    getUpdate:function(){
        var cur=this;
        $.ajax(this.urlAttr,{
            success:function(data,textStatus,jqXHR){
                var opt={};
                opt.jsonData=JSON.parse(data);
                cur.clear();
                cur.draw(cur.contentDom,opt)
            }
        })
    },
    clear: function(){
        $(this.contentDom).html("");
    }
};
DashBoard.basePrototype(DashBoard.ChartCons);

// Video
DashBoard.VideoCons.prototype={
    enableUpdate:function(){
        this.player.play();
    },
    _livePlayer:function(){
        return $f($(this.dom).attr('id'), resource_url+"flowPlayer/flowplayer-3.2.18.swf", {
            clip: {
                autoPlay:false,
                url: this.url,
                live: true,
                provider: 'influxis'
            },
            plugins: {
                controls: {
                    url: resource_url+'flowPlayer/flowplayer.controls-3.2.16.swf'
                },
                influxis: {
                    url: resource_url+"flowPlayer/flowplayer.rtmp-3.2.12-dev.swf",
                    netConnectionUrl: 'rtmp://10.62.98.123/live'
                }
            }
        });
    },
    _videoPlayer:function(){
        return $f($(this.dom).attr('id'), resource_url+"flowPlayer/flowplayer-3.2.18.swf", {
            clip: {
                autoPlay: false,
                url: this.url
            },
            plugins: {
                controls: {
                    url: resource_url+'flowPlayer/flowplayer.controls-3.2.16.swf'
                }
            }
        });
    },
    getTime:function(){
        return this.player.getTime();
    }
};
DashBoard.basePrototype(DashBoard.VideoCons);

$(document).ready(function(){
    if(typeof (elements)=='function'){
        elements();
    }
    else{
        console.log('You have not defined any element on this page. Create function elements=function(){...} before document initialized');
    }
});
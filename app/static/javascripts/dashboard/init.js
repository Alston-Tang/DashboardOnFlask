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
        var c= new DashBoard.AnCons(dom.url,id,opt);
        this.AnList.push(c);
        return c;
    }
};

DashBoard.basePrototype=function(thisClass){
    if (typeof (thisClass.prototype)!='object'){
        thisClass.prototype={};
    }
    thisClass.prototype.url=function(url){
        if(url==undefined){
            return this.url;
        }
        else{
            this.url=url;
            return this;
        }
    };
    thisClass.prototype.interval=function(interval){
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
    //Image displayed on page
    this.display={};
};
DashBoard.AnCons.prototype={
    query:function(start,end){
        $.ajax(this.url,{
            type:'GET',
            data:{id:this.id,start:start,end:end},
            success:this._querySuccess,
            error:this._queryError
        })
    },
    // Return JSON type {success:exists if no error,
    //                   error:error information,
    //                   content:[{time: time of Pic,
    //                             img: picture content,
    //                             tsVideo: relative time in a video
    //                             tsCapture: real time
    //                             sourceId: id of source
    //                             fingerPrint: = =
    //                             frameId: id of this frame
    //                             detect:[{information of detection},{},....]},
    //                            {...},
    //                           ]
    //                  }
    // detect is in time order
    _querySuccess:function(data){
        if(!data.success){
            //Error handle
        }
        else {
            var images=[];
            //Load image
            for (var i=0; i<data.content.length; i++){
                images[i]=this._createImg(data.content[i].img);
            }
            for (i = 0; i < data.content.length; i++) {
                var canvas = this._createCanvas(images[i]);
                var ctx = canvas.getContext('2d');
                for (var j = 0; j < data.content[i].detect.length; j++) {
                    this._drawA(canvas, ctx, data.content[i].detect[j]);
                }
                this._insertA(data.content[i].frameId,canvas);
            }
        }
    },
    // Transfer response image to a valid img node
    _createImg:function(img){
        var imgDom;
        imgDom = document.createElement('img');
        //TODO transfer image to data to a valid img node
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
        var shape=detection.shape;
        if(!this._shape[shape]){
            // An unsupported shape
            Console.log('Can not draw shape "'+shape+'"');
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
}

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
        this.videoPlay();
    },
    videoPlay:function(){
        $f($(this.dom).attr('id'), resource_url+"flowPlayer/flowPlayer-3.2.18.swf", {
            clip: {
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
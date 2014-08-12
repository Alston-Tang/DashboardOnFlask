/**
 * Created by tangh4 on 2014/8/7.
 */
var ManagePanel=function(mainDom,settingDom,opt){
//check exists
    if(!mainDom || !settingDom){
        throw "Client:you have to arrange main panel and setting panel";
    }
//end
//check status at this moment
    if($(mainDom).css('display')=='none' && $(settingDom).css('display')!='none'){
        this.display='setting';
    }
    else if($(mainDom).css('display')!='none' && $(settingDom).css('display')=='none'){
        this.display='main';
    }
    else{
        throw "Client:none or more than 1 panel is displayed";
    }
//end
//get 2 doms' position
    this.offsetLeft=mainDom.offsetLeft?mainDom.offsetLeft:settingDom.offsetLeft;
    this.offsetTop=mainDom.offsetTop?mainDom.offsetTop:settingDom.offsetTop;
    this.offsetWidth=mainDom.offsetWidth?mainDom.offsetWidth:settingDom.offsetWidth;
//end
    this.mainDom=mainDom;
    this.settingDom=settingDom;
};

ManagePanel.prototype.loadSettingPanel=function(tmplId,date,callback,context){
    var cur=this;
    $(this.settingDom).html(tmpl(tmplId,date)).find('#config-form').submit(function(e){
        e.preventDefault();
        callback.call(context,this);
    });
};

ManagePanel.prototype.dis=function(){
    if (this.display=='setting') return;
    $(this.mainDom).addClass('ext-panel');
    $(this.settingDom).css({'position':'absolute','left':this.offsetLeft+this.offsetWidth,'top':this.offsetTop})
                        .animate({'left':this.offsetLeft,'width':this.offsetWidth},{'duration':300,'ease':'linear'});
    $(this.settingDom).addClass("").removeClass('ext-panel');
    this.display='setting';
};

ManagePanel.prototype.hide=function(){
    if(this.display=='main') return;
    $(this.settingDom).addClass('ext-panel');
    $(this.mainDom).css({'position':'absolute','left':this.offsetLeft+this.offsetWidth,'top':this.offsetTop,'z-index':9999})
                        .animate({'left':this.offsetLeft,'width':this.offsetWidth},{'duration':300,'ease':'linear'});
    $(this.mainDom).addClass("").removeClass('ext-panel');
    this.display='main';
};

ManagePanel.prototype.toggle=function(){
    if(this.display=='setting'){
        this.hide();
    }
    else{
        this.dis();
    }
};

LoadingPanel=function(){
    this.dom=document.createElement('div');
    $(this.dom).addClass('loading-panel hide').
                 html('<div><i class="fa fa-refresh fa-5x fa-spin" style="color:rgb(255,255,255)"></i></div>');
    document.body.appendChild(this.dom);
};

LoadingPanel.prototype.dis=function(){
    if($(this.dom).hasClass('hide')){
        $(this.dom).removeClass('hide');
        $(this.dom).addClass('dis');
    }
};

LoadingPanel.prototype.hide=function(){
    if($(this.dom).hasClass('dis')){
        $(this.dom).removeClass('dis');
        $(this.dom).addClass('hide');
    }
};

LoadingPanel.prototype.toggle=function(){

};

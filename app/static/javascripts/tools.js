/**
 * Created by Tang on 2014/6/24.
 */
var thmTools= {
    propertyRequire: function (obj, require) {
        if (!require) return false;
        for (var i = 0; i < require.length; i++) {
            if (!obj.hasOwnProperty(require[i])) return false;
        }
        return true;
    },
    absPos:function(dom){
        var rtVal={left:dom.offsetLeft,top:dom.offsetTop};
        var fVal=dom.offsetParent?thmTools.absPos(dom.offsetParent):{left:0,top:0};
        rtVal.left+=fVal.left;
        rtVal.top+=fVal.top;
        return rtVal;
    },
    relPos: function (dom) {
        var rtVal = {};
        rtVal.left = ($(dom).css('left') && $(dom).css('left') != 'auto') ? parseFloat($(dom).css('left')) : dom.offsetLeft;
        rtVal.right = rtVal.left + dom.offsetWidth;
        rtVal.top = ($(dom).css('top') && $(dom).css('top') != 'auto') ? parseFloat($(dom).css('top')) : dom.offsetTop;
        rtVal.bot = rtVal.top + dom.offsetHeight;
        return rtVal;
    },
    decodeAttr:function(attr){
        var t=attr.split(';');
        var rt={};
        for(var i=0; i< t.length; i++){
            var t2=t[i].split(':');
            rt[t2[0].trim()]=t2[1]?t2[1]:true;
        }
        return rt;
    },
    textToHtml:function(str){
        str=str.replace(/&quot;/g,'"');
        str=str.replace(/&amp;/g,'&');
        str=str.replace(/&lt;/g,'<');
        str=str.replace(/&gt;/g,'>');
        return str;
    },
    serializeToObj:function(ser){
        var rtVal={};
        for(var i=0; i<ser.length; i++){
            if(ser[i].hasOwnProperty('name') && ser[i].hasOwnProperty('value')){
                rtVal[ser[i].name]=ser[i].value;
            }
        }
        return rtVal;
    }
};
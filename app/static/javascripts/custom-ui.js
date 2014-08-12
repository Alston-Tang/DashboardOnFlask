/**
 * Created by tangh4 on 2014/8/5.
 */

//Always call this function first

var initSideBar = function () {
    var sideBar = document.getElementById('side-bar');
    var rootList = document.getElementById('root-list');
    var chartArea = document.getElementById('chart-area');
    var $mainList=$(sideBar).children('.main-list');
    $mainList.find('.ml').click(function() {
        var $subList=$(this).children('ul');
        if ($subList.css('display')=='none'){
            $subList.fadeIn('middle');
        }
        else{
            $subList.fadeOut('fast');
        }
    });
    $mainList.find('.disable-sub').unbind('click');
    $mainList.find('.sub-list').children('li').each(function(){
        $(this).click(function(e){
            e.stopPropagation();
        })
    });
};

$(document).ready(function(){
    initSideBar();
});
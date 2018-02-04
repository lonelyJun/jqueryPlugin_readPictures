(function () {
    var zjj = {};

    //下拉加载更多
    var loadingFlag = 0; //是否在加载
    var pageNum = 2;
    zjj. dragMore=function(url,cb){
        $(window).scroll(function() {
            console.log(loadingFlag);
            if($(window).scrollTop()+$(window).height()+5>$(document).height()&&!loadingFlag)
            {
                console.log(pageNum);
                loadingFlag = 1;
                //以下请求数据，并在加载完成后，设置loadingFlag为0
                $.ajax({
                    url:url+pageNum,
                    type:'get',
                    dataType:'JSON'
                }).done(function(json){
                    pageNum++;                   
                    cb(json);
                    if(json.msg=="last"){//请修正为如果数据拉取完
                        $('.dragMore').hide();
                        loadingFlag = 1;
                    }
                });
            }
        });        
    }   
    

    //标题行数控制器
    zjj.clampAll = function (jQuery, line) {
        for (var i = 0; i < jQuery.length; i++)
            $clamp(jQuery[i], { clamp: line });
    }

    //顶端浮动时的js处理，请配合common.css中的样式
    zjj.fixTop = function(){
        var fixedHeight = $('.fixTop').height();
        $('.fixTopRelative').height(fixedHeight);
        $(window).scroll(function(){
            var scrollTop = $(window).scrollTop();
            if(scrollTop>=1){
                $('.fixTop').css({'position':'fixed','top':'0'});
                $('.fixTopRelative').show();
            }else{
                $('.fixTop').css({'position':'relative'});
                $('.fixTopRelative').hide();
            }
        });          
    }

    //图片查看器
    zjj.picReadModel = function (jQuery, range, type) {
        //通用事件
        // 图片放大缩小控制函数
        var imageZoom = function(jQuery,type){

            var scale=1//保存放大倍数
            var distanceOri = 0;//保存初始距离
            var distance = 0;//保存当前距离
            // var scaleChangeValue = 0.1;
            var timeOri,timeLocal,timeDouble;//保存时间差
            var timeMove = new Date(); //设定touchmove移动事件判定时间差
            var setTimeoutValue = 0.1; //设置间隔事件单位ms
            var setDoubleBetweenTime =200; //设置双击间隔判定最大间隔时间，单位ms
            var preventContinueDouleTouch = true;
            var setMinDistance = 5; //设定最小滑动值
            var scaleMax = 3;   //当倍数超过这个数值不再放大
            var scaleMin = 0.3;  //当倍数不到这个数值不再缩小
            var xOri = 0;   //单击初始位置
            var yOri = 0;   //双击初始位置
            var imgLeft = 0; //保存图像左移位置
            var imgTop = 0.5;  //保存图像上移位置
            var tempX;   //设置暂留X值。用于判断向左或者向右
            var tempY;   //设置暂留Y值。用于判定是向上或向下
            var offsetX=0; //图片放大时的X偏移量
            var offsetY=0; //图片放大时的Y偏移量
            var nOri = 0;//用于记录前一个图片序列号


            // 获取改变量序号
            var getChangeObjEq=function(jQuery){
                var value =  Math.floor(-Number($('.coverAllLayer .picList').css('left').substring(0,$('.coverAllLayer .picList').css('left').length-2))/$('.coverAllLayer').width());
                value = value == -0?0:value;
                return value;
            }

            var getChangeObj=function(jQuery,n){
                return  $('.coverAllLayer .picList')? jQuery.eq(n):jQuery;
            }
            //函数控制css
            var scaleCotrol = function(obj,scale,offsetY,offsetX){
                var changeObjEq = getChangeObjEq(jQuery)
                var changeObj = getChangeObj(obj,changeObjEq);
                changeObj.css({
                    'transform':'translateX('+offsetX+'%) translateY('+(offsetY==0?-50:-offsetY)+'%) scale('+scale+')',
                    '-webkit-transform':'translateX('+offsetX+'%) translateY('+offsetY==0?-50:-offsetY+'%) scale('+scale+')',
                    '-moz-transform':'translateX('+offsetX+'%) translateY('+offsetY==0?-50:-offsetY+'%) scale('+scale+')',
                    '-o-transform':'translateX('+offsetX+'%) translateY('+offsetY==0?-50:-offsetY+'%) scale('+scale+')',
                    '-ms-transform':'translateX('+offsetX+'%) translateY('+offsetY==0?-50:-offsetY+'%) scale('+scale+')'
                });
                //如果当前图片发生变化了
                if(nOri != changeObjEq){
                    scale = 1; 
                    getChangeObj(obj,nOri).css({
                        'transform':'translateX(0%) translateY(-50%) scale('+scale+')',
                        '-webkit-transform':'translateX(0%) translateY(-50%) scale('+scale+')',
                        '-moz-transform':'translateX(0%) translateY(-50%) scale('+scale+')',
                        '-o-transform':'translateX(0%) translateY(-50%) scale('+scale+')',
                        '-ms-transform':'translateX(0%) translateY(-50%) scale('+scale+')'                       
                    });                    
                }
                nOri = changeObjEq;
                return scale;
                // if(offsetY && offsetX){
                //      console.log(offsetY);
                //     changeObj.css({
                //         'transform':'translateX('+offsetX+'%) translateY('+-offsetY+'%) scale('+scale+')',
                //         '-webkit-transform':'translateX('+offsetX+'%) translateY('+-offsetY+'%) scale('+scale+')',
                //         '-moz-transform':'translateX('+offsetX+'%) translateY('+-offsetY+'%) scale('+scale+')',
                //         '-o-transform':'translateX('+offsetX+'%) translateY('+-offsetY+'%) scale('+scale+')',
                //         '-ms-transform':'translateX('+offsetX+'%) translateY('+-offsetY+'%) scale('+scale+')'
                //     //    '-webkit-transform':'translate(50% -50%) scale(1)'
                //     });
                //     // console.log(changeObj.css('transform'));
                // } else if(offsetY && !offsetX){
                //     changeObj.css({
                //         'transform':'translateX(0) translateY('+ -offsetY+'%) scale('+scale+')',
                //         '-webkit-transform':'translateX(0) translateY('+ -offsetY+'%) scale('+scale+')',
                //         '-moz-transform':'translateX(0) translateY('+ -offsetY+'%) scale('+scale+')',
                //         '-o-transform':'translateX(0) translateY('+ -offsetY+'%) scale('+scale+')',
                //         '-ms-transform':'translateX(0) translateY('+ -offsetY+'%) scale('+scale+')'
                //     });
                // } else if(!offsetY && offsetX) {
                //     changeObj.css({
                //         'transform':'translateX('+offsetX+'%) translateY(-50%) scale('+scale+')',
                //         '-webkit-transform':'translateX('+offsetX+'%) translateY(-50%) scale('+scale+')',
                //         '-moz-transform':'translateX('+offsetX+'%) translateY(-50%) scale('+scale+')',
                //         '-o-transform':'translateX('+offsetX+'%) translateY(-50%) scale('+scale+')',
                //         '-ms-transform':'translateX('+offsetX+'%) translateY(-50%) scale('+scale+')'
                //     });
                // } else{
                //     changeObj.css({
                //         'transform':'translateX(0) translateY(-50%) scale('+scale+')',
                //         '-webkit-transform':'translateX(0) translateY(-50%) scale('+scale+')',
                //         '-moz-transform':'translateX(0) translateY(-50%) scale('+scale+')',
                //         '-o-transform':'translateX(0) translateY(-50%) scale('+scale+')',
                //         '-ms-transform':'translateX(0) translateY(-50%) scale('+scale+')'
                //     });
                // }           
            }

            // 函数计算两点距离
            var getDistance=function(ev) {
                var x1=ev.originalEvent.targetTouches[0].pageX;
                var y1=ev.originalEvent.targetTouches[0].pageY;//两根手指缩放肯定需要两根手指，【0】第一根手指的Xy的坐标
    
                var x2=ev.originalEvent.targetTouches[1].pageX;//第二根手指的坐标
                var y2=ev.originalEvent.targetTouches[1].pageY;
    
                var a=x1-x2;//第一根手指的pageX-第二根手指的pageX，这样正好是一个之间三角形 得到两个直角边；
                var b=y1-y2;//同上
                return Math.sqrt(a*a+b*b)//已知两个直角边开平方得出 斜角边
            }

            $('body').on('touchstart',function(ev){
                // 被作用对象确认              
                preventContinueDouleTouch = true;
                timeOri = new Date();
                if(typeof(timeDouble)!='undefined' && typeof(timeDouble)!='null'){
                    if(timeOri.getTime()-timeDouble.getTime()<setDoubleBetweenTime){
                        scale = scale==1?2.5:1;
                        scale =scaleCotrol(jQuery,scale,offsetY,offsetX);
                        if(scale == 1 && jQuery.length == 1){
                            getChangeObj(jQuery,changeObjEq(jQuery)).css('left','0');
                        }else if(scale == 1 && jQuery.length > 1){
                            scale =scaleCotrol(jQuery,scale,offsetY,0);
                        }

                        timeDouble = undefined;
                        preventContinueDouleTouch = false;
                    }
                }
                if(preventContinueDouleTouch)
                    timeDouble=timeOri;
                if(ev.originalEvent.targetTouches.length==2){//判断是否是两根手指 是的话 把两根手指点上去的时候的 斜脚边的初始值 放到 downC里面
                    distanceOri=getDistance(ev);
                }
                else if(ev.originalEvent.targetTouches.length == 1){
                    xOri = ev.originalEvent.targetTouches[0].pageX;
                    yOri = ev.originalEvent.targetTouches[0].pageY;
                }   
            });

            $('body').on('touchmove',function(ev){
                console.log(scale);
                //获取当前时间
                timeLocal = new Date();
                //提前获得移动的点，用于判断下一步动作
                var xLocal = ev.originalEvent.targetTouches[0].pageX;
                var yLocal = ev.originalEvent.targetTouches[0].pageY;
                //如果当前时间比原始时间到达设定的时间差，进入放大缩小设置
                if(ev.originalEvent.targetTouches.length==2&&distanceOri!=0){//判断移动的时候是否是两根手指  && timeLocal.getTime()-timeOri.getTime()>setTimeoutValue
                    var tempDistance = getDistance(ev);
                    if(tempDistance-distanceOri > setMinDistance)
                        scale += 0.1;
                    else if(distanceOri - tempDistance > setMinDistance)
                        scale -= 0.1;
                    distanceOri = tempDistance;
                    timeOri = timeLocal;
                }
                if(scale<=scaleMax && scale>scaleMin){
                    scale =scaleCotrol(jQuery,scale,offsetY,offsetX);
                }else if(scale < scaleMin){
                    scale =scaleCotrol(jQuery,scaleMin,offsetY,offsetX);                                  
                }else if(scale >scaleMax){
                    scale = scaleCotrol(jQuery,scaleMax,offsetY,offsetX);
                    scale=scaleMax;
                }
                //如果是单指移动
                if(ev.originalEvent.targetTouches.length==1 && timeLocal.getTime()-timeMove.getTime()>setTimeoutValue){
                    // 初始化时，tempX，tempY为空，赋值为touchstart时的值。之后没间隔setTimeoutValue进行判定滑动方向
                    if(!tempX) tempX = xOri;
                    if(!tempY) tempY = yOri;
                    if(scale >= 1){
                        var bodyHeight = $('body').height();
                        var xRange = (scale-1)/2;
                        var yRange = 0;
                        var scaleImgHeight = scale*getChangeObj(jQuery,getChangeObjEq(jQuery)).height();
                        if(bodyHeight-scaleImgHeight<0){
                            yRange = (scaleImgHeight/bodyHeight-1)/2;
                        }

                        var xP,yP;
                        if(tempX-xLocal > 0) xP=(0.02); else xP = (-0.02);
                        if(tempY-yLocal > 0) yP=(0.02); else yP = (-0.02);
                        
                        var tempLeft = imgLeft-xP;//(tempX-xLocal)>0?0.01:-0.01;
                        var tempTop = imgTop-yP;//(tempY-yLocal)>0?0.01:-0.01;


                        // 单图模式下，直接禁止滑动的范围超出图片范围
                        imgLeft = tempLeft<=-xRange?-xRange:tempLeft>=xRange?xRange:tempLeft;
                        imgTop = tempTop<0.5-yRange?0.5-yRange:tempTop>0.5+yRange?0.5+yRange:tempTop;

                        offsetX = imgLeft*100;
                        offsetY = imgTop*100;

                        // console.log(xRange);
                        // console.log(offsetX);
                        if(jQuery.length > 1){
                            scale =scaleCotrol(jQuery,scale,offsetY,offsetX);
                        }else{
                           jQuery.css({
                                'left':(100*imgLeft)+'%',
                                'top':(100*imgTop)+'%'
                            });                            
                        }


                        if(imgLeft == -xRange || imgLeft == xRange){
                            var $picListLeft =$('.coverAllLayer .picList').css('left');
                            var picListLeft = Number($picListLeft.substring(0,$picListLeft.length-2))/$('.coverAllLayer').width()*100;
                            var maxPicLeft = -($('.coverAllLayer .picList img').length-1)*100;
                           // console.log(picListLeft);
                            if(xLocal-tempX>0){
                                //向右滑动  
                                if(picListLeft<0){
                                     $('.coverAllLayer .picList').css('left',(picListLeft+2)+'%');                                  
                                }                          
                            }else if(xLocal-tempX<0){
                                // 向左滑动
                                if(picListLeft>=maxPicLeft){                                    
                                    $('.coverAllLayer .picList').css('left',(picListLeft-2)+'%');                                   
                                }
                            }                         
                        }
                    }
                    tempX=xLocal;
                    tempY=yLocal;
                    timeMove = timeDouble;
                }

            });

            $('body').on('touchend',function(){
                if(scale < 1){
                    //禁止缩小
                    scale =scaleCotrol(jQuery,1,offsetY,offsetX);
                    scale = 1;
                }
                var $picListLeft =$('.coverAllLayer .picList').css('left');
                var picListLeft = Math.round(Number($picListLeft.substring(0,$picListLeft.length-2))/$('.coverAllLayer').width())*100;
                if(Math.round(Number($picListLeft.substring(0,$picListLeft.length-2))/$('.coverAllLayer').width())-Math.floor(Number($picListLeft.substring(0,$picListLeft.length-2))/$('.coverAllLayer').width())!=0){
                    scale =scaleCotrol(jQuery,1,offsetY,offsetX);
                }
                $('.coverAllLayer .picList').css('left',picListLeft+'%');
            });
        }

        //单图查看模式
        if (type == 'single') {
            //保存图片数据
            // var imgArr = [];
            // var imgNum = jQuery.find('img').length;
            // for(var i=0;i<imgNum;i++)
            //     imgArr.push(jQuery.find('img').eq(i).attr('src'));

            // 启动条件，点击目标中的某个img
            jQuery.find('img').on('click', function () {
                // var index = $(this).index(range);
                var imageSrc = $(this).attr('src');
                picPreLoad(imageSrc, function () {
                    $('body').css({ 'height': '100%', 'overflow-y': 'hidden' ,'overflow-x' : 'auto'});
                    $('html').css('height', '100%');
                    $('.coverAllLayer').show();
                    $('.wrap').hide();
                    $('img.midImage').attr('src', imageSrc);//imgArr[index]
                    // 开启用户放大模式
                    imageZoom($('img.midImage'),type);
                    //图片缩放
                });
            });


            // 关闭条件，点击目标中的某个img
            // $('.coverAllLayer').on('click', function () {
            //     $('body').css({ 'height': 'auto', 'overflow': 'auto' });
            //     $('html').css('height', 'auto');
            //     $('.coverAllLayer').hide();
            //     $('.wrap').show();
            //     // 关闭用户放大模式 
            //     // $('#view').attr('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;');
            // });
        }else if(type == 'multiple'){
            jQuery.find('img').on('click', function () {
                var index = $(this).index(range);
                var imgs = jQuery.find('img');
                var imgsLength = imgs.length;
                //生成图片序列
                
                $('.coverAllLayer .picList').css('width',100*imgsLength+'%');
                for(var i=0;i<imgsLength;i++){
                    $('.coverAllLayer .picList').append('<img src="'+imgs.eq(i).attr('src')+'">');
                    $('.coverAllLayer .picList img').eq(i).css('width',100/imgsLength+'%');
                }      
   
                $('body').css({ 'height': '100%', 'overflow-y': 'hidden' ,'overflow-x' : 'auto'});
                $('html').css('height', '100%');
                $('.coverAllLayer').show();
                $('.wrap').hide();
                imageZoom($('.coverAllLayer .picList img'),type);

            });          
        }

    }

    //图片预加载
    function picPreLoad(src, cb) {
        var tmpImage = new Image();
        tmpImage.src = src;
        tmpImage.onload = function () {
            cb();
        }
    }

    window.zjj = zjj;
})();
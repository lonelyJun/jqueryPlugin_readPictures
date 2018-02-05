(function($){  
    $.fn.extend({  
        picReadModel:function(options){  
            // var defaults = {color:'blue', size: "30px"};  
            // options = $.extend({},defaults, options); 

            //初始化位置

            //初始化参数
            /*************可设置更改的变量*****************************/
            var const_scaleDoubleCl = 2.5;             //全局静态变量，双击后的
            var const_imgMargin = 5;                 //图片间间隔  
            var const_changeScaleValue = 0.05;        //手势缩放时的变化频率
            var const_swipSpeed = 25;                //越大越不灵敏。建议50~100之间
            var const_scaleMax = 3;
            var const_scaleMin = 0.4;

            var threshold_doubleTime = 230;          //阈值，双击最短判定时间差，单位毫秒
            var threshold_touchmoveTime = 20;         //阈值，移动事件处理判定，单位毫秒


            /********************全局通用*****************************/
            var _self = this;
            var scale = 1;          //全局控制放大倍数

            var _windowWidth =  document.body.clientWidth;    //获取全局宽度
            var _windowHeight =  document.body.clientHeight;  //获取全局高度
            var _imgLength;                                   //图片数量
            var _swipeDistanceX;                              //横向滑动距离
            var _swipePercentY;                               //纵向滑动距离
            var _swipWindowMax;                               //滑动窗口最大值
            var _index;                                       //记录当前位置值，与currentObj绑定
            var _windowPosition;                               

            var currentObj;         //当前操作的对象

            //用于touchstart
            var flag_ContinueClick = false;     //标识位，防止连续点击事件
            var time_Touchstart;               //Date,屏幕点击的时间记录器
            var time_Double;                   //Date,双击时间记录器

            //用于记录touchmove
            var time_Touchmove;                //Date,划屏事件的时间记录器
            var time_TouchmoveOri;             //Date,移动事件间隔暂留记录器
            var point;                         //自定义数组对象，用作点位记录器
            var pointOri;                      //自定义数组对象，用作点位暂留记录器

            //var flag_swipWindow=false;               //用于记录滑动窗口边界是否可运行
            //var flag_swipImage=true;                //用于图片滑动边界是否可运行
            var flag_swip = false; 

            //用于计算方位
            offsetX=0;                         //计算X偏移量
            offsetY=0;                         //计算Y偏移量


            /********************初始化函数*****************************/
            function init(){
                _imgLength = _self.length;
                var windowWidth = _imgLength*_windowWidth+const_imgMargin*(_imgLength-1);
                _self.parent().css('width',windowWidth);
                _self.css({'width':_windowWidth,'margin-right':const_imgMargin});
                _self.eq(_imgLength-1).css('margin-right',0);
                // _self.parent().css('left',-_windowWidth-5);
                _index = 0;            
                currentObj = _imgLength > 1? _self.eq(_index):_self;
 
                _swipWindowMax = _self.parent().width()-_windowWidth;   //提前计算滑动窗口最大值
                _swipeDistanceX= _windowWidth/const_swipSpeed;    //提前计算每次滑动窗口距离
            }

            /********************     函数     *****************************/
            //双击事件
            var doubleClick = function(ev,cb){     
                flag_ContinueClick = false;      //每次进入后，重置连续点击标识位
                time_Touchstart = new Date();  //记录每次点击的时间

                if(ev.originalEvent.targetTouches.length==1  //确定为一个手指点击
                    && typeof(time_Double)!='undefined'){   //双击事件记录器已赋值判定
                        if(time_Touchstart.getTime()-time_Double.getTime()<threshold_doubleTime){//时间差符合阈值要求
                        //以下为双击事件具体操作
                        cb();
                        //以下为收尾工作
                        time_Double = undefined;    //重置双击时间记录器
                        flag_ContinueClick = true;   //开启防连点击  
                    }                   
                }else if(ev.originalEvent.targetTouches.length>1){
                    flag_ContinueClick = true;   //开启防连点击                      
                }                
                if(!flag_ContinueClick)
                    time_Double=time_Touchstart;    //持久化记录上一次点击时间
            }  

            // 样式控制
            var cssChange = function(obj,scale,offsetX,offsetY){
                obj.css({
                    'transform':'translateX('+offsetX+'px) translateY('+(offsetY-50)+'%) scale('+scale+')',
                    '-webkit-transform':'translateX('+offsetX+'px) translateY('+offsetY-50+'%) scale('+scale+')',
                    '-moz-transform':'translateX('+offsetX+'px) translateY('+offsetY-50+'%) scale('+scale+')',
                    '-o-transform':'translateX('+offsetX+'px) translateY('+offsetY-50+'%) scale('+scale+')',
                     '-ms-transform':'translateX('+offsetX+'px) translateY('+offsetY-50+'%) scale('+scale+')'
                });
            }

            // 获取点位 
            var getPoint = function(ev){
                var point=[{'x':0,'y':0},{'x':0,'y':0}];               
                if(ev.originalEvent.targetTouches.length > 1){
                    point[0].x=ev.originalEvent.targetTouches[0].pageX;
                    point[0].y=ev.originalEvent.targetTouches[0].pageY;
                    point[1].x=ev.originalEvent.targetTouches[1].pageX;
                    point[1].y=ev.originalEvent.targetTouches[1].pageY;                    
                    return point;
                }else{
                    point[0].x=ev.originalEvent.targetTouches[0].pageX;
                    point[0].y=ev.originalEvent.targetTouches[0].pageY;
                    point[1].x=0;
                    point[1].y=0;                    
                    return point;                    
                }
            }     
            
            //判断滑动方向
            var getDeriction = function(p1,p2){
                return Math.abs(p1[0].x-p2[0].x)>Math.abs(p1[0].y-p2[0].y)?1:0;
            }

            //判断缩放方向
            var getScaleDeriction = function(p1,p2){
                return getDistance(point)>getDistance(pointOri)?1:0;
            }            

            //计算距离
            var getDistance=function(point) {
                var x1=point[0].x;
                var y1=point[0].y;//两根手指缩放肯定需要两根手指，【0】第一根手指的Xy的坐标
    
                var x2=point[1].x;//第二根手指的坐标
                var y2=point[1].y;
    
                var a=x1-x2;//第一根手指的pageX-第二根手指的pageX，这样正好是一个之间三角形 得到两个直角边；
                var b=y1-y2;//同上
                return Math.sqrt(a*a+b*b)//已知两个直角边开平方得出 斜角边
            }

            //滑动窗口
            var swipWindow = function(dir){
             //   _windowPosition= Number(_self.parent().css('left').replace(/[^-\d\.]/g, ''));
                var temp = _windowPosition;
                _windowPosition -= _swipeDistanceX*(dir?-1:1);
                _windowPosition= _windowPosition>0?0:_windowPosition<-_swipWindowMax?-_swipWindowMax:_windowPosition;   //确定窗口大小在范围内  
                _self.parent().css('left',_windowPosition);
                return temp == _windowPosition? false:true;
                // return windowPosition == 0?1:windowPosition == -_swipWindowMax?-1:0;
            }

            //滑动窗口
            // var swipWindow = function(dir){
            //     _self.parent().css('left',windowPosition);
            // }

            //计算是否可滑动图片
            // var caculateImageX = function(){

               
            // }

            //横向滑动图片 
            var swipImageX = function(obj,dir,range){
                var temp = offsetX;
                offsetX -=  _swipeDistanceX*(dir?-1:1)*scale;
                offsetX= offsetX<-range?-range:offsetX>range?range:offsetX;   //确定图片大小在范围内                 
                cssChange(obj,scale,offsetX,offsetY);   
                return offsetX == temp?false:true;       
            }

           //纵向滑动图片 
           var swipImageY = function(obj,dir,range){
            _swipePercentY = range/20;
            offsetY -=  _swipePercentY*(dir?-1:1);
            offsetY= offsetY<-range?-range:offsetY>range?range:offsetY;   //确定图片大小在范围内  
            cssChange(obj,scale,offsetX,offsetY); 
          //  return offsetX == range?1:offsetX == -range?-1:0;            
        }            

            //判断位置
            var judgeCurObj = function(){
                //判断滑动是否过半，如果过半，则到下一个图
                var windowPosition= Number(_self.parent().css('left').replace(/[^-\d\.]/g, ''));
                var index = -Math.round(windowPosition/(_windowWidth+(_imgLength-1)/_imgLength*const_imgMargin));
                _self.parent().css('left',-(index*(_windowWidth+const_imgMargin)));
                // 如果目标对象变更，还原之前的目标
                if(index != _index){
                    //如果目标变换了，重置放大，偏移参数
                    flag_swip = false;
                    scale = 1;
                    offsetX = 0;
                    offsetY = 0;
                    cssChange(_self.eq(_index),scale,offsetX,offsetY);
                    _index = index; 
                    currentObj = _self.eq(_index);
                }


            }

            /********************     执行函数     *****************************/
            init();

            /*触碰开始监听器*/
            $('body').on('touchstart',function(ev){
                doubleClick(ev,function(){
                    //双击判定完成，请输入需要执行的事件
                    scale = scale == 1?const_scaleDoubleCl:1;
                    cssChange(currentObj,scale,0,0);
                });
            });

            /*划动监听器*/
            $('body').on('touchmove',function(ev){
                time_Touchmove = new Date();
                point = getPoint(ev);    //实时记录点位
                if(time_TouchmoveOri==undefined
                || time_Touchmove.getTime()-time_TouchmoveOri.getTime() > threshold_touchmoveTime){
                    if(ev.originalEvent.targetTouches.length==1 && pointOri != undefined){
                        //划动事件 
                        curWidth = currentObj.width();
                        curHeight = currentObj.height();
                        if(getDeriction(point,pointOri)){
                            _windowPosition= Number(_self.parent().css('left').replace(/[^-\d\.]/g, ''));
                           //左右滑动
                           if(scale <= 1){
                               //滑动窗口
                                swipWindow(point[0].x>pointOri[0].x?1:0);  //true:右滑,false:左滑
                           }else{
                                //优先判别滑动对象或者窗口
                                
                                var offsetRangeX = (scale-1)/2*_windowWidth; //放大后的左右范围
                                if(point[0].x>pointOri[0].x){              //右滑
                                    //判定滑动哪个对象
                                    if(offsetX == offsetRangeX && !flag_swip){
                                        flag_swip =  true;
                                    }     
                                    else if(_windowPosition == -(_windowWidth + const_imgMargin)*_index && flag_swip){
                                        flag_swip = false;
                                    }
                                    //滑动相应对象
                                    if(!flag_swip){
                                        swipImageX(currentObj,1,offsetRangeX);
                                    }
                                        
                                    if(flag_swip){
                                        swipWindow(1);  
                                    }
                                }else{                                     //左滑
                                    if(offsetX == -offsetRangeX
                                    && !flag_swip){
                                        flag_swip =  true;
                                    }     
                                    else if(_windowPosition == -(_windowWidth + const_imgMargin)*_index && flag_swip){
                                        flag_swip = false;
                                    }

                                    if(!flag_swip)
                                        swipImageX(currentObj,0,offsetRangeX);
                                    if(flag_swip){
                                        swipWindow(0);  
                                    }
                                } 
                           }
                        }else{
                           //上下滑动
                           if(currentObj.height()*scale > _windowHeight){
                               var offsetRangeY =(scale-_windowHeight/currentObj.height())/2*100;  //放大后的上下范围
                               swipImageY(currentObj,point[0].y>pointOri[0].y?1:0,offsetRangeY);   // true:下滑，false:上滑            
                           }
                        }

    
                    }else if(ev.originalEvent.targetTouches.length>1 && pointOri != undefined){
                        //缩放事件
                        if(getScaleDeriction(point,pointOri)){
                            //放大
                            scale += const_changeScaleValue;
                            scale = scale > const_scaleMax?const_scaleMax:scale;
                 //           cssChange(currentObj,scale,0,0);
                        }else{
                            //缩小
                            scale -= const_changeScaleValue;
                            scale = scale < const_scaleMin?const_scaleMin:scale;
                            cssChange(currentObj,scale,0,0);
                        }
                        
                    }
                    time_TouchmoveOri = time_Touchmove;
                    pointOri = point; 
                }
           
            });

            /*触碰结束监听器*/
            $('body').on('touchend',function(ev){
                judgeCurObj();
                if(scale<1){
                    cssChange(currentObj,1,0,0);
                    scale=1;
                } 

            });
        }  
    });  
})(window.jQuery);
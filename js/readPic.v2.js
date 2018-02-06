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
            var const_swipSpeed = 50;                //越大越不灵敏。建议50~100之间
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

            // 双击事件初始化
            var hammerBodyDbClick = new Hammer($('body')[0]);

            //拖动事件初始化
            var hammerListPan = new Hammer(_self.parent()[0]);
            hammerListPan.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            hammerListPan.get('pinch').set({ enable: true });
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
            // var doubleClick = function(ev,cb){     
  
            // }   

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

            //显示指定图片
            var showObjPic = function(index){
                _index = index;
                flag_swip = false;
                scale = 1;
                offsetX = 0;
                offsetY = 0;
                cssChange(_self.eq(_index),scale,offsetX,offsetY);                
                currentObj = _self.eq(_index); 
                _self.parent().css('left',-(index*(_windowWidth+const_imgMargin)));             
            }

            /********************     执行函数     *****************************/
            init();

            /*触碰开始监听器*/
            hammerBodyDbClick.on('doubletap', function () {
                scale = scale == 1?const_scaleDoubleCl:1;
                cssChange(currentObj,scale,0,0);
            });

            hammerListPan.on('panleft',function(){            
                _windowPosition= Number(_self.parent().css('left').replace(/[^-\d\.]/g, ''));
                //左右滑动
                if(scale <= 1){
                    //滑动窗口
                     swipWindow(0);  //true:右滑,false:左滑
                }else{
                     //优先判别滑动对象或者窗口                     
                    var offsetRangeX = (scale-1)/2*_windowWidth; //放大后的左右范围
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
            });

            hammerListPan.on('panright',function(){
              
                _windowPosition= Number(_self.parent().css('left').replace(/[^-\d\.]/g, ''));
                //左右滑动
                if(scale <= 1){
                    //滑动窗口
                     swipWindow(1);  //true:右滑,false:左滑
                }else{
                     //优先判别滑动对象或者窗口                     
                    var offsetRangeX = (scale-1)/2*_windowWidth; //放大后的左右范围
                    if(offsetX == offsetRangeX
                    && !flag_swip){
                        flag_swip =  true;
                    }     
                    else if(_windowPosition == -(_windowWidth + const_imgMargin)*_index && flag_swip){
                        flag_swip = false;
                    }

                    if(!flag_swip)
                        swipImageX(currentObj,1,offsetRangeX);
                    if(flag_swip){
                        swipWindow(1);  
                    } 
                }                              
            }); 
            
            hammerListPan.on('panup',function(){  
                console.log('1');             
                if(currentObj.height()*scale > _windowHeight){
                    var offsetRangeY =(scale-_windowHeight/currentObj.height())/2*100;  //放大后的上下范围
                    swipImageY(currentObj,0,offsetRangeY);   // true:下滑，false:上滑            
                }
            });

            hammerListPan.on('pandown',function(){
                if(currentObj.height()*scale > _windowHeight){
                    var offsetRangeY =(scale-_windowHeight/currentObj.height())/2*100;  //放大后的上下范围
                    swipImageY(currentObj,1,offsetRangeY);   // true:下滑，false:上滑            
                }
            });            

            hammerListPan.on('pinchin',function(){
                scale -= const_changeScaleValue;
                scale = scale < const_scaleMin?const_scaleMin:scale;
                cssChange(currentObj,scale,0,0);
            });

            hammerListPan.on('pinchout',function(){
                scale += const_changeScaleValue;
                scale = scale > const_scaleMax?const_scaleMax:scale;
                cssChange(currentObj,scale,0,0);
            });  
            
            hammerBodyDbClick.on('swipleft', function () {
                if(_index != 0){
                    _index--;
                    showObjPic(_index);
                }
            });
            
            hammerBodyDbClick.on('swipleft', function () {
                if(_index != _imgLength-1){
                    _index++;
                    showObjPic(_index);
                }
            });            

            /*触碰结束监听器*/
            $('body').on('touchend',function(ev){
                // 阻止默认事件
                ev.stopPropagation();
                ev.preventDefault(); 
                
                judgeCurObj();
                if(scale<1){
                    cssChange(currentObj,1,0,0);
                    scale=1;
                } 

            });
        }  
    });  
})(window.jQuery);
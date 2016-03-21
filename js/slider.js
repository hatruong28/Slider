/**
 *  @name plugin
 *  @description description
 *  @version 1.0
 *  @options
 *    option
 *  @events
 *    event
 *  @methods
 *    init
 *    publicMethod
 *    destroy
 */
(function($, window, undefined) {
  'use strict';

  var pluginName = 'slider',
  	  privateVar = null,
  	  interval,
  	  isDotClicked = false,
  	  currentSlide = 1, distance = 0,
  	  mouseActions = {
    	hasDown: false,
	    hasUp: false,
	    hasLeft: false,
	    hasEnter: false
	  };

  var getClass = function(className){
    return $('.' + className);
  };

  var setActions = function(hasDown, hasUp, hasLeft, hasEnter){
    return {
      hasDown: hasDown,
      hasUp: hasUp,
      hasLeft: hasLeft,
      hasEnter: hasEnter
    };
  };

  function Slider(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Slider.prototype = {
    init: function() {
      var that = this;
      this.vars = {
        key: 'value'
      };

      this.buildArrows(); 

      this.$slideContainer = getClass(this.options.slideContainerClass);
      this.$slide = getClass(this.options.slideClass);
      this.$arrowNext = getClass(this.options.nextClass);
      this.$arrowPrev = getClass(this.options.prevClass);

      this.buildDots(this.$slide.length);

      this.$dot = getClass(this.options.dotClass);
      this.$activeDot = getClass(this.options.dotActiveClass);

      this.width = this.$slide.width();

      $(this.$slide.last().clone()).prependTo(that.$slideContainer);
      $(this.$slide.first().clone()).appendTo(that.$slideContainer);

      this.startSlider();

      this.$slideContainer.on('mousedown', {that: that}, that.mousedown)
              					  .on('mouseup', {that: that}, that.mouseup)
              					  .on('mouseleave', {that: that}, that.mouseleave)
                				  .on('mouseenter', that.mouseenter);

      this.$dot.click(function(){
        that.toDot(this);
      });
      this.next(this.$arrowNext);
      this.prev(this.$arrowPrev);
    },

    buildArrows: function(){
    	var that = this;
    	var $arrowNext = '<a href="#" class="' + that.options.nextClass
    					 + '"><img src="' + that.options.nextImgSrc + '" /></a>',
    		$arrowPrev = '<a href="#" class="' + that.options.prevClass
    					 + '"><img src="' + that.options.prevImgSrc + '" /></a>';
		that.element.after($arrowNext).after($arrowPrev).nextAll().wrapAll('<div class="slider-nav">');
    },

    buildDots: function(dotQuantity){
    	var that = this,
    		i;
    	for(i = 0; i < dotQuantity; i++){
    		that.$arrowPrev.after($('<li />').addClass(this.options.dotClass).html('&bull;'));
    	}
    	that.$arrowPrev.next().addClass(that.options.dotActiveClass);
    	that.$arrowPrev.nextUntil(that.$arrowNext).wrapAll('<ul class="slider-dots">');
    },

    animate: function(margin, callback){
      this.$slideContainer.animate({'margin-left': margin}, this.options.animationSpeed, callback);
    },

    next: function(element){
      var that = this;
      element.click({margin: '-=' + that.width, isNext: true, that: that}, that.buttonClicked);
      /*
      element.click(function(){
        var $activeDot = that.$activeDot.next();
        if(!$activeDot.length)
          $activeDot = that.$dot.first();
        that.toDot($activeDot);
      });
      */
    },

    prev: function(element){
      var that = this;
      element.click({margin: '+=' + that.width, isNext: false, that: that}, that.buttonClicked);
    },

    toDot: function(element){
      var that = this;
      if(!isDotClicked){
        isDotClicked = true;
        that.$slideContainer.off('mouseup');
        var index = $(element).index(),
        	indexActive = that.$activeDot.index();
        currentSlide = index + 1;
        var margin = -that.width * currentSlide;
        that.animate(margin, function() {
          that.$activeDot.removeClass(that.options.dotActiveClass);
          that.$activeDot = $(element).addClass(that.options.dotActiveClass);
          isDotClicked = false;
          that.$slideContainer.on("mouseup", {that: that}, that.mouseup);
        });
      }
    },

    buttonClicked: function(event) {
      var that = event.data.that;
      that.$slideContainer.off('mouseup');
      that.animate(event.data.margin, function() {
        that.setDefaultMargin(event.data.isNext);
        that.$activeDot.removeClass(that.options.dotActiveClass);
        that.$activeDot = that.$dot.eq(currentSlide - 1).addClass(that.options.dotActiveClass);
        that.$slideContainer.on("mouseup", {that: that}, that.mouseup);
      });
    },

    slideChange: function(e, hasUp){
      var that = this,
      	  pDistance = Math.abs(distance),
      	  marginLeft = (distance > 0) ? (-that.width * (currentSlide + 1))
      	  							  : (-that.width * (currentSlide - 1));
      if(pDistance < 100){
        marginLeft = -that.width * currentSlide;
      }
      that.animate(marginLeft, function(){
        pDistance > 100 && that.setDefaultMargin(distance > 0);
        that.$activeDot.removeClass(that.options.dotActiveClass);
        that.$activeDot = that.$dot.eq(currentSlide - 1).addClass(that.options.dotActiveClass);
        if(hasUp) {
          that.$slideContainer.on("mouseleave", {that: that}, that.mouseleave);
          //that.$slideContainer.trigger('mouseleave');
        }
        else { 
          that.$slideContainer.on("mouseup", {that: that}, that.mouseup);
          that.startSlider();
        }
        //var hasEnter = (mouseActions.hasUp && !mouseActions.hasLeft) ? false : true;
        mouseActions = setActions(false, false, mouseActions.hasLeft, mouseActions.hasEnter);
        /*console.log(mouseActions.hasEnter);
        that.$slideContainer.trigger('mouseleave');*/
      });
    },

    setDefaultMargin: function(isNext) {
      var that = this;
      (currentSlide < 0) ? currentSlide = 1 : ''; 
      if(isNext){
        if (++currentSlide > that.$slide.length) {
          currentSlide = 1;
          that.$slideContainer.css('margin-left', -that.width);
        }
      }
      else {
        if (--currentSlide == 0) {
          currentSlide = that.$slide.length;
          that.$slideContainer.css('margin-left', -that.width * that.$slide.length);
        }
      }
    },

    mousedown: function(e){
      console.log('down');
      e.preventDefault();
      var that = e.data.that;
      if(!mouseActions.hasDown){
        distance = 0;
        mouseActions = setActions(true, false, false, mouseActions.hasEnter);
        var xDefault = e.pageX;
        that.$slideContainer.on('mousemove', function(event){
          distance += xDefault - event.pageX;
          if(xDefault != event.pageX){
            that.$slideContainer.animate({'margin-left': '+=' + (event.pageX - xDefault)}, 0);
            xDefault = event.pageX;
          }
        });
      }
    },

    mouseup: function(e){
      console.log('up');
      var that = e.data.that;
      if(!mouseActions.hasUp && mouseActions.hasDown){
        that.$slideContainer.off("mousemove mouseleave");
        mouseActions.hasUp = true;
        mouseActions.hasDown = false;
        if (distance != 0){
          console.log('up, left:', mouseActions.hasLeft);
          that.slideChange(e, true);          
         //that.$slideContainer.on("mouseleave", {that: that}, that.mouseleave);
        }
        else {
          mouseActions = setActions(false, false, false, mouseActions.hasEnter);
          that.$slideContainer.on("mouseleave", {that: that}, that.mouseleave);
        }
      }
    },

    mouseleave: function(e){
      var that = e.data.that;
      console.log('leave');
      mouseActions.hasEnter = mouseActions.hasEnter ? false : true;
      if(!mouseActions.hasUp && !mouseActions.hasDown){
        console.log(mouseActions);
        console.log('1');
        that.$slideContainer.off("mousemove mouseup");
        that.slideChange(e, false);
      }
     /*else if(mouseActions.hasUp && !mouseActions.hasDown){
        console.log('2');
        mouseActions.hasEnter = false;
        that.$slideContainer.trigger('mouseleave');
      }*/
      else if(!mouseActions.hasEnter){
        console.log('3');
        that.$slideContainer.off("mousemove mouseup");
        that.slideChange(e, false);
      }
      console.log('4');
      mouseActions.hasLeft = true;
    },

    mouseenter: function(){
    	clearInterval(interval);
    	mouseActions.hasEnter = true;
    },

    startSlider: function(){
      var that = this;
      if(that.options.autoPlay){
        interval = setInterval(function() {
      	  mouseActions = setActions(true, true, true, mouseActions.hasEnter);
  		    isDotClicked = true;
          that.$slideContainer.animate(
      	  	{'margin-left': '-=' + that.width},
      	  	that.options.animationSpeed, function() {
        	  	if (++currentSlide == that.$slide.length + 1) {
            	  currentSlide = 1;
            	  that.$slideContainer.css('margin-left', -that.width);
        	  	}
            	that.$activeDot.removeClass(that.options.dotActiveClass);
            	that.$activeDot = that.$dot.eq(currentSlide - 1).addClass(that.options.dotActiveClass);
            	mouseActions = setActions(false, false, false, mouseActions.hasEnter);
            	isDotClicked = false;
          });
        }, that.options.pauseTime);
      }
    },

    destroy: function() {
      // remove events
      // deinitialize
      $.removeData(this.element[0], pluginName);
    }

  };


  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Slider(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };


  $.fn[pluginName].defaults = {
    key: 'value',
    onCallback: null,
    slideClass: 'slide',
    slideContainerClass: 'slides',
    nextClass: 'arrow-next',
    nextImgSrc: 'img/arrow-next.png',
    prevClass: 'arrow-prev',
    prevImgSrc: 'img/arrow-prev.png',
    dotClass: 'dot',
    dotActiveClass: 'active-dot',
    animationSpeed: 1000,
    pauseTime: 2000,
    autoPlay: true
  };

  /*
  $(function() {
    $('[data-' + pluginName + ']').on('customEvent', function() {
      // to do
    });

    $('[data-' + pluginName + ']')[pluginName]({
      key: 'custom'
    });
  });
  */

}(jQuery, window));

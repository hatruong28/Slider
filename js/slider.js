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

  var pluginName = 'slider';
  var privateVar = null;
  var interval;
  var isDotClicked = false;
  var currentSlide = 1;
  var distance = 0;

  var mouseActions = {
    hasDown: false,
    hasUp: false,
    hasLeft: false
  };

  var privateMethod = function(el, options) {};

  var getClass = function(className){
    return $('.' + className);
  };

  var setActions = function(hasDown, hasUp, hasLeft){
    return {
      hasDown: hasDown,
      hasUp: hasUp,
      hasLeft: hasLeft
    };
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this;
      this.vars = {
        key: 'value'
      };

      this.$slideContainer = getClass(this.options.slideContainerClass);
      this.$slide = getClass(this.options.slideClass);
      this.$arrowNext = getClass(this.options.nextClass);
      this.$arrowPrev = getClass(this.options.prevClass);
      this.$dot = getClass(this.options.dotClass);
      this.$activeDot = getClass(this.options.dotActiveClass);

      $(that.$slide.last().clone()).prependTo(that.$slideContainer);
      $(that.$slide.first().clone()).appendTo(that.$slideContainer);

      this.startSlider();

      this.$slideContainer.on('mousedown', {that: that}, that.mousedown);
      this.$slideContainer.on('mouseup', {that: that}, that.mouseup);
      this.$slideContainer.on('mouseleave', {that: that}, that.mouseleave);

      this.$dot.click(function(){
        that.toDot(this);
      });
      this.next(this.$arrowNext);
      this.prev(this.$arrowPrev);
    },
    animate: function(margin, callback){
      this.$slideContainer.animate({'margin-left': margin}, this.options.animationSpeed, callback);
    },
    next: function(element){
      var that = this;
      element.click({margin: '-=720', isNext: true, that: that}, that.buttonClicked);
      /*element.click(function(){
        var $activeDot = that.$activeDot.next();
        if(!$activeDot.length)
          $activeDot = that.$dot.first();
        that.toDot($activeDot);
      });*/
    },
    prev: function(element){
      var that = this;
      element.click({margin: '+=720', isNext: false, that: that}, that.buttonClicked);
    },
    toDot: function(element){
      var that = this;
      if(!isDotClicked){
        isDotClicked = true;
        that.$slideContainer.off('mouseup');
        var index = $(element).index();
        var indexActive = that.$activeDot.index();
        currentSlide = index + 1;
        var margin = -720 * currentSlide;
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
      var that = this;
      var pDistance = Math.abs(distance);
      var marginLeft = (distance > 0) ? (-720 * (currentSlide + 1)) : (-720 * (currentSlide - 1));
      if(pDistance < 100){
        marginLeft = -720 * currentSlide;
      }
      that.animate(marginLeft, function(){
        pDistance > 100 && that.setDefaultMargin(distance > 0);
        mouseActions = setActions(false, false, false);
        that.$activeDot.removeClass(that.options.dotActiveClass);
        that.$activeDot = that.$dot.eq(currentSlide - 1).addClass(that.options.dotActiveClass);
        if(hasUp){
          that.$slideContainer.on("mouseleave", {that: that}, that.mouseleave);
        }
        else {
          that.$slideContainer.on("mouseup", {that: that}, that.mouseup);
        }
      });
    },
    setDefaultMargin: function(isNext) {
      var that = this;
      (currentSlide < 0) ? currentSlide = 1 : ''; 
      if(isNext){
        if (++currentSlide == that.$slide.length + 1) {
          currentSlide = 1;
          that.$slideContainer.css('margin-left', -720);
        }
      }
      else {
        if (--currentSlide == 0) {
          currentSlide = that.$slide.length;
          that.$slideContainer.css('margin-left', -720 * that.$slide.length);
        }
      }
    },
    mousedown: function(e){
      e.preventDefault();
      var that = e.data.that;
      if(!mouseActions.hasDown){
        distance = 0;
        mouseActions = setActions(true, false, false);
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
      var that = e.data.that;
      if(!mouseActions.hasUp && mouseActions.hasDown){
        that.$slideContainer.off("mousemove mouseleave");
        mouseActions.hasUp = true;
        if (distance != 0){
          that.slideChange(e, true);
        }
        else {
          mouseActions = setActions(false, false, false);
          that.$slideContainer.on("mouseleave", {that: that}, that.mouseleave);
        }
      }
    },
    mouseleave: function(e){
      var that = e.data.that;
      if(!mouseActions.hasLeft && mouseActions.hasDown){
        that.$slideContainer.off("mousemove mouseup");
        mouseActions.hasLeft = true;
        that.slideChange(e, false);
      }
    },
    startSlider: function(){
      var that = this;
      if(that.options.autoPlay){
        interval = setInterval(function() {
          that.$slideContainer.animate({'margin-left': '-=720'}, that.options.animationSpeed, function() {
            if (++currentSlide == that.$slide.length + 1) {
              currentSlide = 1;
              that.$slideContainer.css('margin-left', -720);
            }
            that.$activeDot.removeClass(that.options.dotActiveClass);
            that.$activeDot = that.$dot.eq(currentSlide - 1).addClass(that.options.dotActiveClass);
          });
        }, 5000);
      }
    },
    pauseSlider: function(){
      clearInterval(interval);
    },
    publicMethod: function(params) {
      $.isFunction(this.options.onCallback) && this.options.onCallback();
      this.element.trigger('customEvent');
      return this;
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
        $.data(this, pluginName, new Plugin(this, options));
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
    prevClass: 'arrow-prev',
    dotClass: 'dot',
    dotActiveClass: 'active-dot',
    animationSpeed: 3000,
    autoPlay: true
  };

  $(function() {
    $('[data-' + pluginName + ']').on('customEvent', function() {
      // to do
    });

    $('[data-' + pluginName + ']')[pluginName]({
      key: 'custom',
      autoPlay: false
    });
  });

}(jQuery, window));

  'use strict';

$(function() {

    //settings for slider
    var width = 720;
    var animationSpeed = 1000;
    var currentSlide = 1;

    //cache DOM elements
    var $slideContainer = $('.slides');
    var $slides = $('.slide');
    var $dot = $('.dot');
    var firstImg = $('.slide').last().clone();
    var lastImg = $('.slide').first().clone();

    $(firstImg).prependTo($slideContainer);
    $(lastImg).appendTo($slideContainer);

    var interval;

    function animate(margin, callback) {
      $slideContainer.animate({'margin-left': margin}, animationSpeed, callback);
    }

    function setDefaultMargin(isNext) {
      if(isNext){
        if (++currentSlide == $slides.length + 1) {
            currentSlide = 1;
            $slideContainer.css('margin-left', -720);
        }
      }
      else {
        if (--currentSlide == 0) {
            currentSlide = $slides.length;
            $slideContainer.css('margin-left', -720 * $slides.length);
        }
      }
    }

    function sliding(event) {
      $slideContainer.off('mouseup');
      animate(event.data.margin, function() {
        if(event.data.isNext){
          var nextDot = $('.active-dot').next();
          $('.active-dot').removeClass('active-dot');
          if(!nextDot.length)
            nextDot = $dot.first();
          nextDot.addClass('active-dot');
          setDefaultMargin(true);
        }
        else {
          var prevDot = $('.active-dot').prev();
          $('.active-dot').removeClass('active-dot');
          if(!prevDot.length)
            prevDot = $dot.last();
          prevDot.addClass('active-dot');
          setDefaultMargin(false);
        }
        $slideContainer.on("mouseup", mouseUpData, mouseup);
      });
    }

    $('.arrow-next').click({margin: '-=720', isNext: true}, sliding);

    $('.arrow-prev').click({margin: '+=720', isNext: false}, sliding);

    var isDotClicked = false;

    $('.dot').click(function(){
      if(!isDotClicked){
        isDotClicked = true;
        $slideContainer.off('mouseup');
        var that = this;
        var margin = '';
        var index = $(this).index();
        var indexActive = $('.dot.active-dot').index();
        if(index > indexActive){
          margin = '-=' + (720 * Math.abs(indexActive - index));
        }
        else {
          margin = '+=' + (720 * Math.abs(indexActive - index));
        }
        animate(margin, function() {
          $('.active-dot').removeClass('active-dot');
          $(that).addClass('active-dot');
          currentSlide = index;
          setDefaultMargin(true);
          isDotClicked = false;
          $slideContainer.on("mouseup", mouseUpData, mouseup);
        });
      }
    });

    var distance = 0;
    var isMouseDown = false;
    var isMouseLeave = false;
    var isMouseUp = false;
    var marginLeft = +$slideContainer.css('margin-left').replace('px','');
    var moveToRight = false;

    var change = function(e){
      if(Math.abs(distance) > 100){
        if(!moveToRight) {
          marginLeft -= 720;
          marginLeft = Math.abs(+$slideContainer.css('margin-left').replace('px', '') - marginLeft);
          marginLeft = '-=' + marginLeft;
        }
        else {
          marginLeft += 720;
          marginLeft = Math.abs(+$slideContainer.css('margin-left').replace('px', '') - marginLeft);
          marginLeft = '+=' + marginLeft;
        }
      }
      else {
        marginLeft = '+=' + distance;
      }
      animate(marginLeft, function(){
        console.log('no change');
        if(Math.abs(distance) > 100)
          setDefaultMargin(!moveToRight);
        isMouseDown = e.data.isMouseDown;
        isMouseLeave = e.data.isMouseLeave;
        isMouseUp = true;
        e.data.bindEvent;
      });
    };

    var mouseup = function(e){
      $slideContainer.off("mousemove mouseleave");
      change(e);
    };

    var mouseleave = function(e){
      /*$slideContainer.off("mousemove mouseup");
      if(isMouseDown && !isMouseLeave){
        change(e);
      }*/
    };

    function mousedown(e){
      e.preventDefault();
      if(!isMouseDown){
        distance = 0;
        isMouseDown = true;
        isMouseLeave = false;
        isMouseUp = false;
        marginLeft = +($slideContainer.css('margin-left').replace('px',''));
        var xDefaultPos = e.pageX;
        $slideContainer.on('mousemove', function(event){
          distance += xDefaultPos - event.pageX;
          if(xDefaultPos > event.pageX){
            $slideContainer.animate({'margin-left': '-=' + Math.abs(xDefaultPos - event.pageX)}, 0);
            moveToRight = false;
          }
          else {
            $slideContainer.animate({'margin-left': '+=' + Math.abs(xDefaultPos - event.pageX)}, 0);
            moveToRight = true;
          }
          xDefaultPos = event.pageX;   
        });
      }
    }

    var mouseLeaveData = {
      isMouseDown: false, 
      isMouseLeave: true,
      bindEvent: $slideContainer.on('mouseup', mouseUpData, mouseup)
    };

    var mouseUpData = {
      isMouseDown: false,
      isMouseLeave: false,
      bindEvent: $slideContainer.on('mouseleave', mouseLeaveData, mouseleave)
    };

    $slideContainer
      .on('mousedown', mousedown)
      .on('mouseleave', mouseLeaveData, mouseleave)
      .on('mouseup', mouseUpData, mouseup);

    function startSlider() {
        interval = setInterval(sliding, 3000);
    }
    function pauseSlider() {
        clearInterval(interval);
    }

    /*$slideContainer
        .on('mouseenter', pauseSlider)
        .on('mouseleave', startSlider);*/

    //startSlider();

});


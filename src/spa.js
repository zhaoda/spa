// SPA
// ---

;(function($) {
  'use strict';

  var $win = $(window),
      $doc = $(document),
      $body,
      location = window.location,
      history = window.history,
      routes = {},
      pagezIndex = 2000,
      prevPagezIndex = 2001,
      curPagezIndex = 2002,
      // 缓存视图数量，默认0缓存全部
      viewcachecount = 0,
      viewStyle = 'body {position: relative; margin: 0; padding: 0; width: 100%; overflow: hidden;}\
        .spa-fullscreen {position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; visibility: hidden; overflow: hidden; z-index: -1; }\
        .spa-page {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; z-index: 2000; }\
        .spa-page-bg {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; }\
        .spa-page-body {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; }\
        .spa-transition {transition: 0.4s; -webkit-transition: 0.4s; -moz-transition: 0.4s; -o-transition: 0.4s; -ms-transition: 0.4s;}\
        .spa-scroll {overflow: auto; -webkit-overflow-scrolling: touch; -moz-overflow-scrolling: touch; -ms-overflow-scrolling: touch; -o-overflow-scrolling: touch; overflow-scrolling: touch; }\
        .spa-scroll-x {overflow-y: hidden;}\
        .spa-scroll-y {overflow-x: hidden;}\
        .spa-cover {position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; z-index: 5000; }\
        .spa-loader {position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; overflow: hidden; z-index: 5001; }',
      loaderBody = '<div class="spa-loader-animate"><span></span><span></span><span></span></div>',
      loaderStyle = '.spa-loader .spa-loader-animate {position: absolute; left: 50%; top: 50%; margin: -12px 0 0 -65px; }\
        .spa-loader .spa-loader-animate span { display: inline-block; vertical-align: middle; width: 10px; height: 10px; margin: 0 10px; background: black; border-radius: 50px; -webkit-animation: loader 0.9s infinite alternate; animation: loader 0.9s infinite alternate; }\
        .spa-loader .spa-loader-animate span:nth-of-type(2) { -webkit-animation-delay: 0.3s; -moz-animation-delay: 0.3s; }\
        .spa-loader .spa-loader-animate span:nth-of-type(3) { -webkit-animation-delay: 0.6s; -moz-animation-delay: 0.6s; }\
        @-webkit-keyframes loader {\
          0% { width: 10px; height: 10px; opacity: 0.8; -webkit-transform: translateY(0); }\
          100% { width: 24px; height: 24px; opacity: 0.1; -webkit-transform: translateY(-21px); }\
        }\
        @-moz-keyframes loader {\
          0% { width: 10px; height: 10px; opacity: 0.8; -moz-transform: translateY(0); }\
          100% { width: 24px; height: 24px; opacity: 0.1; -moz-transform: translateY(-21px);}}'
      
  
  /*
   * 插入样式
   */
  
  $doc.on('addstyle.spa', function(event, css) {
    $('<style type="text/css">' + css + '</style>').appendTo($('head'))
  })
  
  
  /*
   * 全屏模式
   */
  
  $win.on('adjustfullscreen.spa resize orientationchange', function(event) {
    var $currentTarget = $(event.currentTarget),
        requestID = $currentTarget.data('adjustfullscreenRequestID')
        
    function adjust() {
      var $fullscreen = $currentTarget.data('$fullscreen'),
          winHeight = Math.max($win.height(), window.innerHeight),
          winWidth = Math.max($win.width(), window.innerWidth)
          
      if(!$fullscreen) {
        $fullscreen = $('<div class="spa-fullscreen"></div>').prependTo($body)
        $currentTarget.data('$fullscreen', $fullscreen)
      }
      
      $fullscreen.css({height: winHeight * 2})
      //收起iphone safari的地址栏
      window.scrollTo(0, 0)
      
      //缓存window全屏时的高度
      $win.data('innerHeight') || $win.data({innerHeight: window.innerHeight})
      
      winHeight = Math.max($win.height(), window.innerHeight)
      
      if($fullscreen.height() != winHeight) {
        
        $body.css({
          width: winWidth,
          height: winHeight
        })
        
        $fullscreen.css({
          width: winWidth,
          height: winHeight
        })
      }
    }
    
    if(requestID) {
      cancelAnimationFrame(requestID)
      $currentTarget.removeData('adjustfullscreenRequestID')
    } else {
      $currentTarget.data('fullpageRequestID', requestAnimationFrame(adjust))
    }
  })
  
  
  /*
   * scrollfix
   */
  
  $doc.on('scroll.spa', function(event, options) {
    var $target = $(event.target),
        direction = (options && options.direction) || ''
    
    $target.addClass('spa-scroll' + (direction ? ' spa-scroll-' + direction : ''))    
  })

  $doc.on('touchstart', '.spa-scroll, .spa-scroll-x, .spa-scroll-y', function(event) {
    var $target = $(event.currentTarget),
        scrollTop = $target.scrollTop(),
        scrollLeft = $target.scrollLeft(),
        height = $target.innerHeight(),
        width = $target.innerWidth(),
        scrollHeight = $target.prop('scrollHeight'),
        scrollWidth = $target.prop('scrollWidth')
    
    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-x')) {
      if(scrollLeft < 0) {
        // event.preventDefault()
      }
      if(scrollLeft <= 0) {
        $target.scrollLeft(1)
      }
      if(scrollLeft + width > scrollWidth) {
        // event.preventDefault()
      }
      if(scrollLeft + width >= scrollWidth) {
        $target.scrollLeft(scrollWidth - width - 1)
      }
    }

    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-y')) {
      if(scrollTop < 0) {
        // event.preventDefault()
      }
      if(scrollTop <= 0) {
        $target.scrollTop(1)
      }
      if(scrollTop + height > scrollHeight) {
        // event.preventDefault()
      }
      if(scrollTop + height >= scrollHeight) {
        $target.scrollTop(scrollTop - 1)
      }
    }
          
  })

  /*
   * fix body { overflow: hidden }
   * 阻塞body的滚动条
   */
  $win.on('scroll', function(event) {
    var innerHeight = $win.data('innerHeight')
    
    if(innerHeight && innerHeight != window.innerHeight) {
      $win.trigger('adjustfullscreen.spa')
    }
  })

  
  /*
   * 监听路由
   */
    
  function getHash(url) {
    url = url || location.href
    return url.replace(/^[^#]*#?\/?(.*)\/?$/, '$1')
  }
  
  $win.on('popstate', function(event) {
    if($doc.data('boot.spa')) {
      //在页面加载和转场过程中，阻止路由请求
      var $cover = $win.data('cover.spa'),
          $loader = $win.data('cover.spa')
      if(($cover && $cover.css('display') == 'block') || ($loader && $loader.css('display') == 'block')) {
        return false
      }
      
      var $curPage = $win.data('curPage.spa')
      
      //如果当前页面是面板,则先收起之前的面板，再打开新页面
      if($curPage && $curPage.hasClass('spa-panel')) {
        var $prevPage = $curPage.data('prevPage.spa')
        
        $prevPage.trigger('openpage.spa')
        
        return false
      }
      
      var hashhistory = $win.data('hashhistory.spa') || [],
          hash = getHash()
          
      if(!hashhistory.length || hashhistory[hashhistory.length - 1] != hash) {
        hashhistory.push(hash)
        $win.data('hashhistory.spa', hashhistory)
        
        var pagescache = $win.data('pagescache.spa') ||　{},
            $page = pagescache[hash],
            pushData = event.state || {}
        
        if($win.data('pushData.spa')) {
          pushData = $win.data('pushData.spa')
          $win.data('pushData.spa', null)
        }
                       
        if($page) {
          $page.data('oldpushData.spa', $page.data('pushData.spa'))
          $page.data('pushData.spa', pushData)
          $page.trigger('openpage.spa')
        } else {
          $doc.trigger('createpage.spa', {hash: hash, pushData: pushData})
        }

      }
    }
  })
  
  
  /*
   * 设置路由
   */

  var optionalParam = /\((.*?)\)/g,
      namedParam = /(\(\?)?:\w+/g,
      splatParam = /\*\w+/g,
      escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g

  var defaultPageOptions = {
    route: '',                            //路由规则
    animate: '',                          //入场动画效果
    classname: '',                        //自定义样式名
    view: function() { return {title: '', body: ''} },    //获取页面视图
    init: function() {},                  //初始化回调函数
    beforeopen: function() {},            //打开前回调
    afteropen: function() {},             //打开后回调
    beforeclose: function() {},           //关闭前回调
    afterclose: function() {}             //关闭后回调
  }
  
  //验证是否是正则表达式对象
  function isRegExp(obj) {
    return toString.call(obj) == '[object RegExp]'
  }
  
  //路由的字符串表达式转正则表达式
  function _routeToRegExp(route) {
    route = route.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional){
                   return optional ? match : '([^\/]+)'
                 })
                 .replace(splatParam, '(.*?)')
    return '^' + route + '$'
  }
  
  $doc.on('route.spa', function(event, options) {
    var args = Array.prototype.slice.call(arguments, 1)
    if(args.length > 1) {
      $.each(args, function(i, route) {
        $doc.trigger('route.spa', route)
      })
      
      return false
    }
    
    var routes = $win.data('routes.spa') || {},
        route = options.route || ''
    
    if(!isRegExp(route)) {
      route = _routeToRegExp(route)
    }
    
    //页面不允许使用面板转场动画
    if(options.animate && !$.isFunction(options.animate) && isPanelAnimate(options.animate)) {
      options.animate = ''
    }
    
    routes[route] = $.extend({}, defaultPageOptions, options)
    $win.data('routes.spa', routes)
  })
  
  
  /*
   * 页面场景
   */
    
  //解析路由请求参数
  function _extractParameters(route, hash) {
    var params = route.exec(hash).slice(1),
        decodeParams = []
        
    $.each(params, function(i, p) {
      p && decodeParams.push(decodeURIComponent(p))
    })
    
    return decodeParams
  }

  //切换容器的z-index
  function togglePagezIndex($fromPage, $toPage) {
    $fromPage.data('prevPage.spa') && $fromPage.data('prevPage.spa').css({zIndex: pagezIndex})
    $toPage.data('prevPage.spa') && $toPage.data('prevPage.spa').css({zIndex: pagezIndex})
    $fromPage.css({zIndex: prevPagezIndex})
    $toPage.css({zIndex: curPagezIndex})
  }
    
  var transitPageAnimates = {},
      transitPageAnimatesName = {},
      transformName = 'transform',
      transitionEndEvent = 'transitionend'

  ;(function() {
    var transitions = {
      'transition': ['transform', 'transitionend'],
      'WebkitTransition': ['WebkitTransform', 'webkitTransitionEnd'],
      'MSTransition': ['MSTransform', 'msTransitionEnd'],
      'MozTransition': ['MozTransform', 'transitionend'],
      'OTransition': ['OTransform', 'transitionend'],
    },
    el = $('<div></div>').get(0),
    t

    for(t in transitions){
      if(el.style[t] !== undefined ) {
        transformName = transitions[t][0]
        transitionEndEvent = transitions[t][1]
      }
      return
    }
  })()

  // $el.transition
  $.fn.transition = function(properties, callback) {
    var $el = $(this)

    // 防止同时重绘
    setTimeout(function() {
      $el.addClass('spa-transition').css(properties).emulateTransitionEnd(function() {
        // 过渡动画结束后移除 .spa-transition
        $el.removeClass('spa-transition')
        callback && callback()
      })
    }, 0)


    return $el
  }

  // transitionEnd 回调
  $.fn.emulateTransitionEnd = function(callback, duration) {
    var called = false,
        $el = $(this),
        endtimer

    duration = duration || 416

    // 只执行一次
    $el.one(transitionEndEvent, function() {
      called = true
      clearTimeout(endtimer)
      callback.call($el)
    })

    // 确保transitionend被执行
    var endcallback = function() {
      if(!called) {
        $el.trigger(transitionEndEvent)
      }
    }
    endtimer = setTimeout(endcallback, duration)

    return $el
  }

  //默认转场动画
  transitPageAnimates.defaultInOut = function($toPage, $fromPage, callback) {
    togglePagezIndex($fromPage, $toPage)
    callback()
  }
    
  //添加转场动画
  $doc.on('addTransitPageAnimates.spa', function(event, options) {
    var names = []
    
    $.each(options, function(name, fn) {
      names.push(name)
    })

    $.each(names, function(key, value) {
      if(key % 2 === 0) {
        transitPageAnimatesName[value] = names[key + 1]
      } else {
        transitPageAnimatesName[value] = names[key - 1]
      }
    })
    
    $.extend(transitPageAnimates, options)
  })
    
  $doc.trigger('addTransitPageAnimates.spa', {
    fadeIn: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}
          
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    fadeOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0},
          fromEndCss = {opacity: 1}

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    fadeInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate(100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0},
          fromEndCss = {opacity: 1}

      fromStartCss[transformName] = 'translate(100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate(-100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0},
          fromEndCss = {opacity: 1}

      fromStartCss[transformName] = 'translate(-100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate(0, 100%)'
      toEndCss[transformName] = 'translate(0, 0%)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0},
          fromEndCss = {opacity: 1}

      fromStartCss[transformName] = 'translate(0, 100%)'
      fromEndCss[transformName] = 'translate(0, 0%)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate(0, -100%)'
      toEndCss[transformName] = 'translate(0, 0%)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0},
          fromEndCss = {opacity: 1}

      fromStartCss[transformName] = 'translate(0, -100%)'
      fromEndCss[transformName] = 'translate(0, 0%)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate(100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    slideOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {},
          fromEndCss = {}

      fromStartCss[transformName] = 'translate(100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate(-100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    slideOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {},
          fromEndCss = {}

      fromStartCss[transformName] = 'translate(-100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate(0, 100%)'
      toEndCss[transformName] = 'translate(0, 0%)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    slideOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {},
          fromEndCss = {}

      fromStartCss[transformName] = 'translate(0, 100%)'
      fromEndCss[transformName] = 'translate(0, 0%)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate(0, -100%)'
      toEndCss[transformName] = 'translate(0, 0%)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    slideOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {},
          fromEndCss = {}

      fromStartCss[transformName] = 'translate(0, -100%)'
      fromEndCss[transformName] = 'translate(0, 0%)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    pushInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(-100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
    },
    pushOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(-100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(-100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(100%, 0)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(-100%, 0)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(0, 100%)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(0, -100%)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(0, -100%)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(0, 100%)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(0, -100%)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(0, 100%)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {},
          fromEndCss = {}

      toStartCss[transformName] = 'translate(0, 100%)'
      toEndCss[transformName] = 'translate(0%, 0)'

      fromStartCss[transformName] = 'translate(0, -100%)'
      fromEndCss[transformName] = 'translate(0%, 0)'

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
    },
    zoomIn: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'scale(0, 0)'
      toEndCss[transformName] = 'scale(1, 1)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    zoomOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {},
          fromEndCss = {}

      fromStartCss[transformName] = 'scale(0, 0)'
      fromEndCss[transformName] = 'scale(1, 1)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {left: 'auto', width: pageBodyWidth},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate(0px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate(' + pageBodyWidth + 'px, 0)'
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          fromStartCss = {},
          fromEndCss = {width: 'auto', left: 0}

      fromStartCss[transformName] = 'translate(' + prevPageBodyWidth + 'px, 0)'
      fromEndCss[transformName] = 'translate(0px, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {right: 'auto', width: pageBodyWidth},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate(0px, 0)'
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate(' + (0 - pageBodyWidth) + 'px, 0)'
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })      
    },
    overlayOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          fromStartCss = {},
          fromEndCss = {width: 'auto', right: 0}

      fromStartCss[transformName] = 'translate(' + (0 - prevPageBodyWidth) + 'px, 0)'
      fromEndCss[transformName] = 'translate(0px, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {top: 'auto', height: pageBodyHeight},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate(0, 0px)'
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate(0, ' + pageBodyHeight + 'px)'
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          fromStartCss = {},
          fromEndCss = {height: 'auto', top: 0}

      fromStartCss[transformName] = 'translate(0, ' + prevPageBodyHeight + 'px)'
      fromEndCss[transformName] = 'translate(0, 0px)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {bottom: 'auto', height: pageBodyHeight},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate(0, 0px)'
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate(0, ' + (0 - pageBodyHeight) + 'px)'
      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          fromStartCss = {},
          fromEndCss = {height: 'auto', bottom: 0}

      fromStartCss[transformName] = 'translate(0, ' + (0 - prevPageBodyHeight) + 'px)'
      fromEndCss[transformName] = 'translate(0, 0px)'

      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    revealInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {left: 'auto', width: pageBodyWidth},
          fromStartCss = {}
      
      toStartCss[transformName] = 'translate(0px, 0)'
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      fromStartCss[transformName] = 'translate(' + (0 - pageBodyWidth) + 'px, 0)'
      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          toStartCss = {}

      toStartCss[transformName] = 'translate(0px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        $fromPageBody.css({width: 'auto', left: 0})
        callback()
      })
    },
    revealInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {right: 'auto', width: pageBodyWidth},
          fromStartCss = {}
            
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      fromStartCss[transformName] = 'translate(' + pageBodyWidth + 'px, 0)'
      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          toStartCss = {}

      toStartCss[transformName] = 'translate(0px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        $fromPageBody.css({width: 'auto', right: 0})
        callback()
      })
    },
    revealInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {top: 'auto', height: pageBodyHeight},
          fromStartCss = {}

      fromStartCss[transformName] = 'translate(0, ' + (0 - pageBodyHeight) + 'px)'
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          toStartCss = {}

      toStartCss[transformName] = 'translate(0, 0px)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        $fromPageBody.css({height: 'auto', top: 0})
        callback()
      })
    },
    revealInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {bottom: 'auto', height: pageBodyHeight},
          fromStartCss = {}

      fromStartCss[transformName] = 'translate(0, ' + pageBodyHeight + 'px)'
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          toStartCss = {}

      toStartCss[transformName] = 'translate(0, 0px)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        $fromPageBody.css({height: 'auto', bottom: 0})
        callback()
      })
    },
    pushPartInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          isFinish = 0,
          toStartCss = {left: 'auto', width: pageBodyWidth},
          toEndCss = {},
          fromStartCss = {}
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate(' + pageBodyWidth + 'px, 0)'

      toEndCss[transformName] = 'translate(0px, 0)'

      fromStartCss[transformName] = 'translate(' + (0 - pageBodyWidth) + 'px, 0)'

      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          isFinish = 0,
          toStartCss = {},
          fromStartCss = {},
          fromEndCss = {width: 'auto', left: 0}

      togglePagezIndex($fromPage, $toPage)

      toStartCss[transformName] = 'translate(0px, 0)'
      fromStartCss[transformName] = 'translate(' + prevPageBodyWidth + 'px, 0)'
      fromEndCss[transformName] = 'translate(0px, 0)'

      $toPageBody.transition(toStartCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
    },
    pushPartInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          isFinish = 0,
          toStartCss = {right: 'auto', width: pageBodyWidth},
          toEndCss = {},
          fromStartCss = {}
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')

      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate(' + (0 - pageBodyWidth) + 'px, 0)'
      fromStartCss[transformName] = 'translate(' + pageBodyWidth + 'px, 0)'

      toEndCss[transformName] = 'translate(0px, 0)'

      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          isFinish = 0,
          toStartCss = {},
          fromStartCss = {},
          fromEndCss = {width: 'auto', right: 0}

      toStartCss[transformName] = 'translate(0px, 0)'
      fromStartCss[transformName] = 'translate(' + (0 - prevPageBodyWidth) + 'px, 0)'
      fromEndCss[transformName] = 'translate(0px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
    },
    pushPartInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          isFinish = 0,
          toStartCss = {top: 'auto', height: pageBodyHeight},
          toEndCss = {},
          fromStartCss = {}
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')

      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate(0, ' + pageBodyHeight + 'px)'
      toEndCss[transformName] = 'translate(0, 0px)'
      fromStartCss[transformName] = 'translate(0, ' + (0 - pageBodyHeight) + 'px)'

      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          isFinish = 0,
          toStartCss = {},
          fromStartCss = {},
          fromEndCss = {height: 'auto', top: 0}

      toStartCss[transformName] = 'translate(0, 0px)'
      fromStartCss[transformName] = 'translate(0, ' + prevPageBodyHeight + 'px)'
      fromEndCss[transformName] = 'translate(0, 0px)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
    },
    pushPartInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          isFinish = 0,
          toStartCss = {bottom: 'auto', height: pageBodyHeight},
          toEndCss = {},
          fromStartCss = {}
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')

      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate(0, ' + (0 - pageBodyHeight) + 'px)'
      toEndCss[transformName] = 'translate(0, 0px)'
      fromStartCss[transformName] = 'translate(0, ' + pageBodyHeight + 'px)'

      $toPageBody.css(toStartCss).transition(toEndCss, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          isFinish = 0,
          toStartCss = {},
          fromStartCss = {},
          fromEndCss = {height: 'auto', bottom: 0}

      togglePagezIndex($fromPage, $toPage)

      toStartCss[transformName] = 'translate(0, 0px)'
      fromStartCss[transformName] = 'translate(0, ' + (0 - prevPageBodyHeight) + 'px)'
      fromEndCss[transformName] = 'translate(0, 0px)'

      $toPageBody.transition(toStartCss, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;++isFinish == 2 && callback()
      })
    }
  })

  //判断是否是面板转场动画
  var isPanelAnimate = (function() {
    var panelAnimateReg = /^(overlay|reveal|pushPart).*$/
    return function(animate) {
      return panelAnimateReg.test(animate)
    }
  })()
  
  //页面转场
  function transitPage($toPage, $fromPage, animate, callback) {
    var $toPageBody = $('.spa-page-body', $toPage),
        $fromPageBody = $('.spa-page-body', $fromPage)
    
    transitPageAnimatesName[animate] || (animate = 'defaultInOut')

    transitPageAnimates[animate].apply($toPage, [$toPage, $fromPage, callback])
  }
  
  //生成唯一id
  var uniqueID = (function() {
    var id = 0
    return function() {
      return id++
    }
  })()
  
  //创建新页面
  $doc.on('createpage.spa', function(event, options) {
    $doc.trigger('openloader.spa')
        
    var routes = $win.data('routes.spa'),
        hash = options.hash,
        pushData = options.pushData,
        requestData,
        routeRegStr,
        routeReg,
        pageOptions
    
    $.each(routes, function(regStr, opt) {
      routeReg = new RegExp(regStr)
      if(routeReg.test(hash)) {
        routeRegStr = regStr
        pageOptions = opt
        return false
      } else {
        routeReg = false
      }
    })
    
    //页面的hash有匹配的路由规则
    if(isRegExp(routeReg)) {
      var classname = pageOptions.classname ? ' spa-page-' + pageOptions.classname : '',
          $page = $('<div class="spa-page' + classname + '"><div class="spa-page-bg"></div><div class="spa-page-body"></div></div>'),
          viewData

      //初始化页面数据    
      $page.data({
        'hash.spa': hash,
        'pushData.spa': pushData,
        'requestData.spa': _extractParameters(routeReg, hash),
        'route.spa': routeRegStr,
        'id.spa': uniqueID()
      }).appendTo($('body'))

      //缓存页面
      $doc.trigger('viewcache.spa', {view: $page})
      
      //获取视图数据
      viewData = pageOptions.view.call($page)
      
      if($.isPlainObject(viewData)) {
        $page.trigger('initpage.spa', viewData)
      }      
    }
  })

  //初始化页面
  $doc.on('initpage.spa', '.spa-page', function(event, viewData) {
    var $page = $(event.currentTarget)
    
    $page.data('viewData.spa', viewData)
    
    $('.spa-page-body', $page).html(viewData.body)
    
    //执行初始化回调函数
    var routes = $win.data('routes.spa'),
        pageOptions = routes[$page.data('route.spa')]
    
    //重置回调函数
    $.each(['init', 'beforeopen', 'afteropen', 'beforeclose', 'afterclose'], function(i, fn) {
      viewData[fn] && (pageOptions[fn] = viewData[fn])
    })
    
    $page.show()
    pageOptions.init.call($page)

    $doc.trigger('closeloader.spa')
    
    //触发打开页面事件
    $page.trigger('openpage.spa')
  })
  
  //打开页面
  $doc.on('openpage.spa', '.spa-page', function(event, afteropenCallback) {
    var $page = $(event.currentTarget),
        $curPage = $win.data('curPage.spa'),
        routes = $win.data('routes.spa'),
        route = routes[$page.data('route.spa')],
        hash = $page.data('hash.spa'),
        pushData = $page.data('pushData.spa'),
        oldpushData = $page.data('oldpushData.spa'),
        requestData = $page.data('requestData.spa'),
        viewData = $page.data('viewData.spa'),
        title = pushData.title || viewData.title,
        animate = pushData.animate || route.animate
    
    if(!$curPage) {
      $curPage = $('<div class="spa-page spa-page-empty"><div class="spa-page-body"></div></div>').appendTo($('body'))
      $win.data('curPage.spa', $curPage)
    }

    //如果是返回之前的页面，强制设置为之前页面的反相动画效果
    //但是，pushData.animate的优先级更高
    if(!pushData.animate && $curPage && $curPage.data('prevPage.spa') && $curPage.data('prevPage.spa').data('id.spa') == $page.data('id.spa')) {
      var prevAnimate = $curPage.data('prevAnimate.spa')
      if(prevAnimate && !$.isFunction(prevAnimate)) {
        animate = transitPageAnimatesName[prevAnimate]
      }
    }
    
    var beforeclose,
        afterclose
    
    //判断当前页面是面板还是页面
    if($curPage.hasClass('spa-panel')) {
      var panelOptions = $win.data('panels.spa')[$curPage.data('id.spa')]
      
      beforeclose = panelOptions.beforeclose
      afterclose = panelOptions.afterclose
    } else if($curPage.data('route.spa')) {
      var curPageRoute = routes[$curPage.data('route.spa')]
      
      beforeclose = curPageRoute.beforeclose
      afterclose = curPageRoute.afterclose

      $doc.trigger('navigate.spa', {
        hash: hash,
        title: title,
        pushData: pushData,
        replace: true
      })
    }
        
    $doc.trigger('opencover.spa')
            
    var callback = function() {
      route.afteropen.call($page)
      afterclose && afterclose.call($curPage)
      $page.data({'prevPage.spa': $curPage})
      $win.data('curPage.spa', $page)
      $doc.trigger('closecover.spa')
      
      //页面打开后，如果当前路由和当前页面不匹配，触发路由请求
      if($page.data('hash.spa') != getHash()) {
        $win.trigger('popstate')
      } else {
        $.isFunction(afteropenCallback) && afteropenCallback()
      }
    }
    
    route.beforeopen.call($page)
    beforeclose && beforeclose.call($curPage)
    
    //缓存页面最近一次载入的动画
    $page.data({'prevAnimate.spa': animate})
    
    if(!$.isFunction(animate)) {
      transitPage($page, $curPage, animate, callback)
    } else {
      animate($page, $curPage, callback)
    }


    // 更改视图缓存顺序
    $doc.trigger('viewcachesort.spa', {view: $page})
    
  })


  /*
   * 面板
   */
   
  var defaultPanelOptions = {
    id: '',                               //面板ID
    animate: '',                          //入场动画效果
    classname: '',                        //自定义样式名
    view: function() { return {body: ''} },    //获取面板视图
    init: function() {},                  //初始化回调函数
    beforeopen: function() {},            //打开前回调
    afteropen: function() {},             //打开后回调
    beforeclose: function() {},           //关闭前回调
    afterclose: function() {}             //关闭后回调
  }
  
  //定义面板
  $doc.on('panel.spa', function(event, options) {
    var args = Array.prototype.slice.call(arguments, 1)
    if(args.length > 1) {
      $.each(args, function(i, panel) {
        $doc.trigger('panel.spa', panel)
      })
      
      return false
    }
    
    var panels = $win.data('panels.spa') || {}
    
    //禁止重复定义ID相同的面板
    if(options.id && !panels[options.id]) {
      panels[options.id] = $.extend({}, defaultPanelOptions, options)
      $win.data('panels.spa', panels)
    }
  })
  
  //打开面板
  $doc.on('openpanel.spa', function(event, id, pushData) {
    //在页面加载和转场过程中，阻止面板请求
    var $cover = $win.data('cover.spa'),
        $loader = $win.data('cover.spa')
    if(($cover && $cover.css('display') == 'block') || ($loader && $loader.css('display') == 'block')) {
      return false
    }
    
    var panelscache = $win.data('panelscache.spa') ||　{},
        $panel = panelscache[id]

    pushData || (pushData = {})
    
    if($panel) {
      var panels = $win.data('panels.spa'),
          panelOptions = panels[id],
          $curPage = $win.data('curPage.spa'),
          animate = pushData.animate || panelOptions.animate
      
      //如果当前页面是面板,则先收起之前的面板，再打开新面板
      if($curPage.hasClass('spa-panel')) {
        var $prevPage = $curPage.data('prevPage.spa')
        
        $prevPage.trigger('openpage.spa', [function() {
          $doc.trigger('openpanel.spa', [id, pushData])
        }])
        
        return false
      }
          
      $panel.data('oldpushData.spa', $panel.data('pushData.spa'))
      $panel.data('pushData.spa', pushData)
          
      $doc.trigger('opencover.spa')
      
      panelOptions.beforeopen.call($panel)

      var callback = function() {
        panelOptions.afteropen.call($panel)
        $panel.data({'prevPage.spa': $curPage})
        $win.data('curPage.spa', $panel)
        $doc.trigger('closecover.spa')
      }

      //缓存页面最近一次载入的动画
      $panel.data({'prevAnimate.spa': animate})
      
      if(!$.isFunction(animate)) {
        transitPage($panel, $curPage, animate, callback)
      } else {
        animate($panel, $curPage, callback)
      }

      // 更改视图缓存顺序
      $doc.trigger('viewcachesort.spa', {view: $panel})

    } else {
      $doc.trigger('createpanel.spa', [id, pushData])
    }
    
  })
  
  //关闭面板
  $doc.on('closepanel.spa', function(event, options) {
    var $panel = $(event.target),
        $curPage = $win.data('curPage.spa')
    
    options && options.id && ($panel = $('.spa-panel-' + options.id))
    
    if($curPage.hasClass('spa-panel') && $curPage.data('id.spa') == $panel.data('id.spa')) {
      var $page = $panel.data('prevPage.spa')
      
      $page.trigger('openpage.spa')
    }
  })    
  
  //创建新面板
  $doc.on('createpanel.spa', function(event, id, pushData) {     
    var panels = $win.data('panels.spa') || {},
        panelOptions = panels[id]
    
    if(panelOptions) {
      $doc.trigger('openloader.spa')

      var classname = panelOptions.classname ? ' spa-panel-' + panelOptions.classname : '',
          $panel = $('<div id="spa-panel-' + id + '" class="spa-page spa-panel ' + classname + '"><div class="spa-page-bg"></div><div class="spa-page-body"></div></div>'),
          viewData
          
      //初始化页面数据    
      $panel.data({
        'id.spa': id,
        'pushData.spa': pushData
      }).appendTo($('body'))

      //缓存面板
      $doc.trigger('viewcache.spa', {view: $panel})
      
      //获取视图数据
      viewData = panelOptions.view.call($panel)
            
      if($.isPlainObject(viewData)) {
        $panel.trigger('initpanel.spa', viewData)
      }
    }
  })

  //初始化面板
  $doc.on('initpanel.spa', '.spa-panel', function(event, viewData) {
    var $panel = $(event.currentTarget),
        id = $panel.data('id.spa'),
        pushData = $panel.data('pushData.spa')
    
    $panel.data('viewData.spa', viewData)
    
    $('.spa-page-body', $panel).html(viewData.body)
    
    //执行初始化回调函数
    var panels = $win.data('panels.spa'),
        panelOptions = panels[id]

    //重置回调函数
    $.each(['init', 'beforeopen', 'afteropen', 'beforeclose', 'afterclose'], function(i, fn) {
      viewData[fn] && (panelOptions[fn] = viewData[fn])
    })
    
    panelOptions.init.call($panel)

    $doc.trigger('closeloader.spa')
    
    //触发打开页面事件
    $panel.trigger('openpanel.spa', [id, pushData])
  })
  
  //点击面板外侧自动关闭面板
  $doc.on('click touchstart', '.spa-panel', function(event) {
    var $panel = $(event.currentTarget),
        $tagert = $(event.target)
    
    if($tagert.hasClass('spa-page-bg') || $tagert.hasClass('spa-panel')) {
      event.stopPropagation()
      event.preventDefault()
      $panel.trigger('closepanel.spa')
    }
  })


  /*
   * 设置清理页面最多缓存的页面数量
   */

  $doc.on('viewcachecount.spa', function(event, options) {
    viewcachecount = options.count
  })


  /*
   * 缓存并清理视图优化内存
   */

  $doc.on('viewcache.spa', function(event, options) {
    var $view = options.view,
        type,
        key

    // 先缓存
    var pagescache = $win.data('pagescache.spa') ||　{},
        panelscache = $win.data('panelscache.spa') ||　{},
        viewscache = $win.data('viewscache.spa') ||　[]

    if($view.hasClass('spa-panel')) {
      type = 'panle'
      key = $view.data('id.spa')
      panelscache[key] = $view
    } else {
      type = 'page'
      key = $view.data('hash.spa')
      pagescache[key] = $view
    }

    viewscache.unshift(type + ':' + key)

    // 再清理
    if(viewcachecount !== 0 && viewscache.length > viewcachecount) {
      var cleanup = viewscache.splice(viewcachecount),
          cleanupsplit,
          cleanuptype,
          cleanupkey,
          cleanupcache

      $.each(cleanup, function(index, value) {
        cleanupsplit = value.split(':', 2)
        cleanuptype = cleanupsplit[0]
        cleanupkey = cleanupsplit[1]

        cleanupcache = cleanuptype == 'page' ? pagescache : panelscache
        cleanupcache[cleanupkey].html('').remove()
        delete cleanupcache[cleanupkey]
      })
    }

    // 存储新的缓存
    $win.data('pagescache.spa', pagescache)
    $win.data('panelscache.spa', panelscache)
    $win.data('viewscache.spa', viewscache)
  })


  /*
   * 更新视图缓存顺序
   */

  $doc.on('viewcachesort.spa', function(event, options) {
    var $view = options.view,
        type,
        key,
        name,
        index

    var viewscache = $win.data('viewscache.spa') ||　[]

    if($view.hasClass('spa-panel')) {
      type = 'panle'
      key = $view.data('id.spa')
    } else {
      type = 'page'
      key = $view.data('hash.spa')
    }

    name = type + ':' + key
    index = viewscache.indexOf(name)

    if(index !== -1) {
      viewscache.splice(index, 1)
      viewscache.unshift(name)
    }

    // 存储新的缓存顺序
    $win.data('viewscache.spa', viewscache)
  })
  

  /*
   * 路由请求
   */
  
  $doc.on('navigate.spa', function(event, options) {
    var hash = options.hash || '',
        title = options.title || '',
        pushData = options.pushData || {},
        replace = options.replace || false

    title && (document.title = title)
    hash = '#' + hash
    
    if(replace) {
      history.replaceState(pushData, title, hash)
    } else {
      history.pushState(pushData, title, hash)
      
      //fix:当$win.trigger('popstate')后,popstate事件对象无法获取到原生事件对象的state属性
      !$.isEmptyObject(pushData) && $win.data('pushData.spa', pushData)
      
      $win.trigger('popstate')
    }
  })
  
  
  /*
   * 场景转换遮罩
   */

  //阻塞鼠标和手势操作
  function preventEventHandle(evnet) {
    event.stopPropagation()
    event.preventDefault()
  }

  $doc.on('opencover.spa', function(event) {
    var $cover = $win.data('cover.spa')
    if(!$cover) {
      $cover = $('<div class="spa-cover"></div>').appendTo($('body'))
      $cover.on('click select mousedown mousemove mouseup touchstart touchmove touchend', preventEventHandle)
      
      /*
       * bugfix:z-index ignored with webkit overflow set to touch(-webkit-overflow-scrolling: touch)
       * 给遮罩层节点设置-webkit-overflow-scrolling: touch来抢占scrolling的优先级，等关闭遮罩层后，scrolling的优先级自动给到当前视图
       */
      $cover.trigger('scroll.spa')
      
      $win.data('cover.spa', $cover)
    }
    $cover.show()
  })

  $doc.on('closecover.spa', function(event) {
    $win.data('cover.spa').hide()
  })

  
  /*
   * 数据加载动画
   * http://css-tricks.com/snippets/css/bouncy-animated-loading-animation/
   */

  $doc.on('loader.spa', function(event, options) {
    options.body && (loaderBody = options.body)
    options.style && (loaderStyle = options.style)
  })
    
  $doc.on('openloader.spa', function(event) {
    var $loader = $win.data('loader.spa')
    if(!$loader) {
      $doc.trigger('addstyle.spa', loaderStyle)
      $loader = $('<div class="spa-loader">' + loaderBody + '</div>').appendTo($('body'))
      $loader.on('click select mousedown mousemove mouseup touchstart touchmove touchend', preventEventHandle)
      $win.data('loader.spa', $loader)
    }
    $loader.show()
  })

  $doc.on('closeloader.spa', function(event) {
    $win.data('loader.spa').hide()
  })
    
  
  /*
   * 应用启动
   */
  
  $doc.on('boot.spa', function(event) {
    $body = $('body')
    $doc.trigger('addstyle.spa', viewStyle)
    $doc.trigger('adjustfullscreen.spa')
    $doc.data('boot.spa', true)
    $win.trigger('popstate')
  })
  
})(jQuery)

/*
 * requestAnimationFrame and cancel polyfill
 */
;(function() {
  'use strict';

  var lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o']
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame']
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime(),
          timeToCall = Math.max(0, 16 - (currTime - lastTime)),
          id = window.setTimeout(function() { callback(currTime + timeToCall) }, timeToCall)
      lastTime = currTime + timeToCall
      return id
    };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id)
      }
})()

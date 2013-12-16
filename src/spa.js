/*!
 * SPA v0.3.0
 * A webapp framework for routing control and view transitions
 * Copyright 2013 zhaoda <http://zhaoda.net>
 * Licensed under MIT https://raw.github.com/zhaoda/spa/master/LICENSE
 */

// SPA
// ---

;(function($) {
  'use strict';

  var $win = $(window),
      // $(document)
      $doc = $(document),
      // $(document.body)
      $body,
      // 浏览器地址栏
      location = window.location,
      // 浏览器历史记录
      history = window.history,
      // 是否是ios
      isios = navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/),
      // popstate事件state数据中转
      historystate,
      // 框架是否已经启动
      hasBoot = false,
      // 页面视图定义集合
      routes = {},
      // 面板视图定义集合
      panels = {},
      // 路由请求历史
      hashhistory = [],
      // 视图默认z-index
      pagezIndex = 2000,
      // 前一个视图z-index
      prevPagezIndex = 2001,
      // 当前视图z-index
      curPagezIndex = 2002,
      // 缓存视图数量，默认0缓存全部
      viewcachecount = 0,
      // 页面视图缓存
      pagescache = {},
      // 面板视图缓存
      panelscache = {},
      // 视图顺序缓存
      viewscache = [],
      // 视图数据
      viewsdata = {},
      // 全凭模式监控层
      $fullscreen,
      // 透明遮罩层
      // $cover,
      // loading遮罩层
      $loader,
      // 当前视图
      $curPage,
      // 框架样式
      viewStyle = 'body {position: relative; margin: 0; padding: 0; width: 100%; overflow: hidden;}\
        .spa-fullscreen {position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; visibility: hidden; overflow: hidden; z-index: -1; }\
        .spa-page {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; z-index: 2000; }\
        .spa-page-bg {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; }\
        .spa-page-body {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; }\
        .spa-scroll {overflow: auto;}\
        .spa-scroll-touch {-webkit-overflow-scrolling: touch;}\
        .spa-scroll-x {overflow-y: hidden;}\
        .spa-scroll-y {overflow-x: hidden;}\
        .spa-cover {display: none; position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; z-index: 5000; }\
        .spa-loader {display: none; position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; overflow: hidden; z-index: 5001; }',
      // loading层元素
      loaderBody = '<div class="spa-loader-animate"><span></span><span></span><span></span></div>',
      // loading层样式
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
      
  // spa对外接口
  $.spa = {}

  // 获取视图数据
  $.spa.getViewData = function($view) {
    return viewsdata[$view.data('id')]
  }

  /*
   * 插入样式
   */
  
  $doc.on('spa:addstyle', function(event, css) {
    $('<style type="text/css">' + css + '</style>').appendTo($('head'))
  })
  
  
  /*
   * 全屏模式
   */

  ;(function() {
    var requestID,
        winHeight,
        winWidth
    
    var adjust = function() {
      winHeight = Math.max($win.height(), window.innerHeight),
      winWidth = Math.max($win.width(), window.innerWidth)
            
      // 撑高body，收起iphone(ios<7) safari的地址栏
      $fullscreen.css({height: winHeight * 2})
      window.scrollTo(0, 0)
      
      //缓存window全屏时的高度
      $body.data('innerHeight', window.innerHeight)
      
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

        // 发现在某些安卓浏览器全凭模式和非全屏模式切换后
        // 手势的第一次的动作失效
        // 在这里可以做些处理？
      }
    }
    
    $win.on('spa:adjustfullscreen resize orientationchange', function(event) {
      if(requestID !== undefined) {
        cancelAnimationFrame(requestID)
        requestID = undefined
      }
      requestID = requestAnimationFrame(adjust)
    })  
  })()
    
  
  /*
   * scrollfix
   */
  
  $doc.on('spa:scroll', function(event, options) {
    var $target = $(event.target),
        direction = (options && options.direction) || ''
    
    $target.addClass('spa-scroll' + (direction ? ' spa-scroll-' + direction : ''))    
  })

  $doc.on('spa:removescroll', function(event, options) {
    var $target = $(event.target)
    
    $target.removeClass('spa-scroll')    
  })

  // ios设备才支持scrollfix
  isios && $doc.on('touchstart', '.spa-scroll, .spa-scroll-x, .spa-scroll-y', function(event) {

    var $target = $(event.currentTarget),
        scrollTop = $target.prop('scrollTop'),
        scrollLeft = $target.prop('scrollLeft'),
        height = $target.height(),
        width = $target.width(),
        scrollHeight = $target.prop('scrollHeight'),
        scrollWidth = $target.prop('scrollWidth')
    
    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-x')) {
      if(scrollLeft < 0) {
        // event.preventDefault()
      }
      if(scrollLeft <= 0) {
        $target.prop('scrollLeft', 1)
      }
      if(scrollLeft + width > scrollWidth) {
        // event.preventDefault()
      }
      if(scrollLeft + width >= scrollWidth) {
        $target.prop('scrollLeft', scrollWidth - width - 1)
      }
    }

    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-y')) {
      if(scrollTop < 0) {
        // event.preventDefault()
      }
      if(scrollTop <= 0) {
        $target.prop('scrollTop', 1)
      }
      if(scrollTop + height > scrollHeight) {
        // event.preventDefault()
      }
      if(scrollTop + height >= scrollHeight) {
        $target.prop('scrollTop', scrollTop - 1)
      }
    }
          
  })

  /*
   * fix body { overflow: hidden }
   * 阻塞body的滚动条
   */
  $win.on('scroll', function(event) {
    var innerHeight = $body.data('innerHeight')
    
    if(innerHeight && innerHeight !== window.innerHeight) {
      $win.trigger('spa:adjustfullscreen')
    }
  })

  
  // window.onunload
  $win.on('unload', function(event) {
    $body.html('')
  })

  
  /*
   * 监听路由
   */
    
  function getHash(url) {
    url = url || location.href
    return url.replace(/^[^#]*#?\/?(.*)\/?$/, '$1')
  }
  
  $win.on('popstate', function(event) {
    // 框架启动前阻止路由请求
    if(!hasBoot) return

    // 在页面加载和转场过程中阻止路由请求
    // if(($cover && $cover.css('display') === 'block') || ($loader && $loader.css('display') === 'block')) {
    //   return false
    // }
    if($loader && $loader.css('display') === 'block') {
      return false
    }
    
    //如果当前页面是面板，则先收起之前的面板，再打开新页面
    if($curPage && $curPage.hasClass('spa-panel')) {
      var curPageId = $curPage.data('id'),
          curPageData = viewsdata[curPageId],
          $prevPage = curPageData.prevPage
      
      $prevPage.trigger('spa:openpage')
      
      return false
    }
    
    var hash = getHash()
    
    // 如果当前路由请求和上一次路由请求不一样
    // 则激活当前路由请求
    if(!hashhistory.length || hashhistory[hashhistory.length - 1] !== hash) {
      hashhistory.push(hash)
      
      var $page = pagescache[hash],
          pushData = event.state || {}
      
      // 如果有中转的state数据，则优先使用，并清除
      if(historystate) {
        pushData = historystate
        historystate = undefined
      }
                     
      if($page) {
        var pageId = $page.data('id'),
            pageData = viewsdata[pageId]

        // 更新pushData
        pageData.oldpushData = pageData.pushData
        pageData.pushData = pushData

        $page.trigger('spa:openpage')
      } else {
        $doc.trigger('spa:createpage', {hash: hash, pushData: pushData})
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
  
  $doc.on('spa:route', function(event, options) {
    var args = Array.prototype.slice.call(arguments, 1)
    if(args.length > 1) {
      $.each(args, function(i, route) {
        $doc.trigger('spa:route', route)
      })
      
      return false
    }
    
    var route = options.route || ''
    
    if(!isRegExp(route)) {
      route = _routeToRegExp(route)
    }
    
    // 页面视图不允许使用面板视图转场动画
    if(options.animate && !$.isFunction(options.animate) && isPanelAnimate(options.animate)) {
      options.animate = ''
    }
    
    routes[route] = $.extend({}, defaultPageOptions, options)
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
    var fromPageData = viewsdata[$fromPage.data('id')],
        toPageData = viewsdata[$toPage.data('id')]

    fromPageData && fromPageData.prevPage && fromPageData.prevPage.css({zIndex: pagezIndex})
    toPageData.prevPage && toPageData.prevPage.css({zIndex: pagezIndex})
    $fromPage.css({zIndex: prevPagezIndex/*, 'pointer-events': 'none'*/})
    $toPage.css({zIndex: curPagezIndex})
    // 防止事件点击穿透
    // setTimeout(function() {
    //   $toPage.css({'pointer-events': 'auto'})
    // }, 100)
  }
    
  var transitPageAnimates = {},
      transitPageAnimatesName = {},
      transformName = 'transform',
      transitionName = 'transition',
      transitionEndEvent = 'transitionend'

  ;(function() {
    var transitions = {
      '-webkit-transition': ['-webkit-transform', 'webkitTransitionEnd'],
      '-moz-transition': ['-moz-transform', 'transitionend'],
      '-ms-transition': ['-ms-transform', 'msTransitionEnd'],
      '-o-transition': ['-o-transform', 'oTransitionEnd'],
      'transition': ['transform', 'transitionend']
    },
    el = $('<div></div>').get(0),
    t

    for(t in transitions){
      if(el.style[t] !== undefined ) {
        transitionName = t
        transformName = transitions[t][0]
        transitionEndEvent = transitions[t][1]
      }
      return
    }
  })()

  // $el.transition
  $.fn.transition = function(properties, callback) {
    var $el = $(this)

    // css3动画是异步无阻塞的，防止同时重绘
    requestAnimationFrame(function() {
      // $el.get(0).offsetWidth
      properties[transitionName] = '0.4s'
      $el.css(properties).emulateTransitionEnd(function() {
        // 过渡动画结束后移除 transition
        properties = {}
        properties[transitionName] = ''
        $el.css(properties)
        callback && callback()
      })
    })


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
  $doc.on('spa:addTransitPageAnimates', function(event, options) {
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
    
  $doc.trigger('spa:addTransitPageAnimates', {
    fadeIn: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}
      
      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    fadeOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0}

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    fadeInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate3d(100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0}

      fromStartCss[transformName] = 'translate3d(100%, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate3d(-100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0}

      fromStartCss[transformName] = 'translate3d(-100%, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate3d(0, 100%, 0)'
      toEndCss[transformName] = 'translate3d(0, 0%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0}

      fromStartCss[transformName] = 'translate3d(0, 100%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {opacity: 0},
          toEndCss = {opacity: 1}

      toStartCss[transformName] = 'translate3d(0, -100%, 0)'
      toEndCss[transformName] = 'translate3d(0, 0%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    fadeOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {opacity: 0}

      fromStartCss[transformName] = 'translate3d(0, -100%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate3d(100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    slideOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {}

      fromStartCss[transformName] = 'translate3d(100%, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate3d(-100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    slideOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {}

      fromStartCss[transformName] = 'translate3d(-100%, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate3d(0, 100%, 0)'
      toEndCss[transformName] = 'translate3d(0, 0%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    slideOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {}

      fromStartCss[transformName] = 'translate3d(0, 100%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'translate3d(0, -100%, 0)'
      toEndCss[transformName] = 'translate3d(0, 0%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    slideOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {}

      fromStartCss[transformName] = 'translate3d(0, -100%, 0)'

      $fromPageBody.transition(fromStartCss, function() {
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
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(-100%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(-100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(100%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(-100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(100%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(100%, 0, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(-100%, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(0, 100%, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(0, -100%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(0, -100%, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(0, 100%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(0, -100%, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(0, 100%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    pushOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0,
          toStartCss = {},
          toEndCss = {},
          fromStartCss = {}

      toStartCss[transformName] = 'translate3d(0, 100%, 0)'
      toEndCss[transformName] = 'translate3d(0%, 0, 0)'

      fromStartCss[transformName] = 'translate3d(0, -100%, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
    },
    zoomIn: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          toStartCss = {},
          toEndCss = {}

      toStartCss[transformName] = 'scale3d(0, 0, 0)'
      toEndCss[transformName] = 'scale3d(1, 1, 1)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    zoomOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          fromStartCss = {}

      fromStartCss[transformName] = 'scale3d(0, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
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
      
      toEndCss[transformName] = 'translate3d(0px, 0, 0)'

      $toPageBody.css(toStartCss)
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate3d(' + pageBodyWidth + 'px, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          fromStartCss = {},
          fromEndCss = {width: 'auto', left: 0}

      fromStartCss[transformName] = 'translate3d(' + prevPageBodyWidth + 'px, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        $fromPageBody.css(fromEndCss)
        callback()
      })
    },
    overlayInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {right: 'auto', width: pageBodyWidth},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate3d(0px, 0, 0)'
      
      $toPageBody.css(toStartCss)
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate3d(' + (0 - pageBodyWidth) + 'px, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })      
    },
    overlayOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          fromStartCss = {},
          fromEndCss = {width: 'auto', right: 0}

      fromStartCss[transformName] = 'translate3d(' + (0 - prevPageBodyWidth) + 'px, 0, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        $fromPageBody.css(fromEndCss)
        callback()
      })
    },
    overlayInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {top: 'auto', height: pageBodyHeight},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate3d(0, 0px, 0)'
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate3d(0, ' + pageBodyHeight + 'px, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          fromStartCss = {},
          fromEndCss = {height: 'auto', top: 0}

      fromStartCss[transformName] = 'translate3d(0, ' + prevPageBodyHeight + 'px, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        $fromPageBody.css(fromEndCss)
        callback()
      })
    },
    overlayInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          toStartCss = {bottom: 'auto', height: pageBodyHeight},
          toEndCss = {}
      
      toEndCss[transformName] = 'translate3d(0, 0px, 0)'
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate3d(0, ' + (0 - pageBodyHeight) + 'px, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        callback()
      })
    },
    overlayOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          fromStartCss = {},
          fromEndCss = {height: 'auto', bottom: 0}

      fromStartCss[transformName] = 'translate3d(0, ' + (0 - prevPageBodyHeight) + 'px, 0)'

      $fromPageBody.transition(fromStartCss, function() {
        togglePagezIndex($fromPage, $toPage)
        $fromPageBody.css(fromEndCss)
        callback()
      })
    },
    revealInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          toStartCss = {left: 'auto', width: pageBodyWidth},
          fromStartCss = {}
            
      toStartCss[transformName] = 'translate3d(0, 0, 0)'

      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      fromStartCss[transformName] = 'translate3d(' + (0 - pageBodyWidth) + 'px, 0, 0)'

      togglePagezIndex($toPage, $fromPage)
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

      toStartCss[transformName] = 'translate3d(0px, 0, 0)'

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

      toStartCss[transformName] = 'translate3d(0, 0, 0)'
            
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      fromStartCss[transformName] = 'translate3d(' + pageBodyWidth + 'px, 0, 0)'

      togglePagezIndex($toPage, $fromPage)
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

      toStartCss[transformName] = 'translate3d(0px, 0, 0)'

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

      toStartCss[transformName] = 'translate3d(0, 0, 0)'
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      fromStartCss[transformName] = 'translate3d(0, ' + (0 - pageBodyHeight) + 'px, 0)'

      togglePagezIndex($toPage, $fromPage)
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

      toStartCss[transformName] = 'translate3d(0, 0px, 0)'

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

      toStartCss[transformName] = 'translate3d(0, 0, 0)'
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      fromStartCss[transformName] = 'translate3d(0, ' + pageBodyHeight + 'px, 0)'

      togglePagezIndex($toPage, $fromPage)
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

      toStartCss[transformName] = 'translate3d(0, 0px, 0)'

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
      
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      
      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate3d(' + pageBodyWidth + 'px, 0, 0)'

      toEndCss[transformName] = 'translate3d(0px, 0, 0)'

      fromStartCss[transformName] = 'translate3d(' + (0 - pageBodyWidth) + 'px, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
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

      toStartCss[transformName] = 'translate3d(0px, 0, 0)'
      fromStartCss[transformName] = 'translate3d(' + prevPageBodyWidth + 'px, 0, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;(++isFinish == 2) && callback()
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
      
      $toPageBody.css(toStartCss)
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')

      toStartCss = {width: pageBodyWidth}
      toStartCss[transformName] = 'translate3d(' + (0 - pageBodyWidth) + 'px, 0, 0)'
      fromStartCss[transformName] = 'translate3d(' + pageBodyWidth + 'px, 0, 0)'

      toEndCss[transformName] = 'translate3d(0px, 0, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
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

      toStartCss[transformName] = 'translate3d(0px, 0, 0)'
      fromStartCss[transformName] = 'translate3d(' + (0 - prevPageBodyWidth) + 'px, 0, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;(++isFinish == 2) && callback()
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
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')

      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate3d(0, ' + pageBodyHeight + 'px, 0)'
      toEndCss[transformName] = 'translate3d(0, 0px, 0)'
      fromStartCss[transformName] = 'translate3d(0, ' + (0 - pageBodyHeight) + 'px, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
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

      toStartCss[transformName] = 'translate3d(0, 0px, 0)'
      fromStartCss[transformName] = 'translate3d(0, ' + prevPageBodyHeight + 'px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;(++isFinish == 2) && callback()
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
      
      $toPageBody.css(toStartCss)
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')

      toStartCss = {height: pageBodyHeight}
      toStartCss[transformName] = 'translate3d(0, ' + (0 - pageBodyHeight) + 'px, 0)'
      toEndCss[transformName] = 'translate3d(0, 0px, 0)'
      fromStartCss[transformName] = 'translate3d(0, ' + pageBodyHeight + 'px, 0)'

      $toPageBody.css(toStartCss)
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toEndCss, function() {
        ;(++isFinish == 2) && callback()
      })      
      $fromPageBody.transition(fromStartCss, function() {
        ;(++isFinish == 2) && callback()
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

      toStartCss[transformName] = 'translate3d(0, 0px, 0)'
      fromStartCss[transformName] = 'translate3d(0, ' + (0 - prevPageBodyHeight) + 'px, 0)'

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition(toStartCss, function() {
        ;(++isFinish == 2) && callback()
      })
      $fromPageBody.transition(fromStartCss, function() {
        $fromPageBody.css(fromEndCss)
        ;(++isFinish == 2) && callback()
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
        $fromPageBody = $('.spa-page-body', $fromPage),
        toStartCss = {}
    
    transitPageAnimatesName[animate] || (animate = 'defaultInOut')

    // 还原之前转场过程中被修改的视图样式
    toStartCss.opacity = 1
    if(!isPanelAnimate(animate)) {
      toStartCss[transformName] = 'translate3d(0, 0, 0) scale3d(1, 1, 1)'
    }
    $toPageBody.css(toStartCss)

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
  $doc.on('spa:createpage', function(event, options) {
    $doc.trigger('spa:openloader')
        
    var hash = options.hash,
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
          pageId = uniqueID(),
          pageData,
          viewData

      // 设置pageId
      $page.data('id', pageId)

      // 初始化视图数据    
      pageData = {
        id: pageId,
        hash: hash,
        pushData: pushData,
        requestData: _extractParameters(routeReg, hash),
        route: routeRegStr,
        el: $page
      }

      viewsdata[pageId] = pageData

      // 渲染视图
      $page.appendTo($('body'))

      // 缓存视图
      $doc.trigger('spa:viewcache', {view: $page})
      
      // 获取视图的渲染数据
      viewData = pageOptions.view.call($page, pageData)
      
      if($.isPlainObject(viewData)) {
        $page.trigger('spa:initpage', viewData)
      }      
    }
  })

  //初始化页面
  $doc.on('spa:initpage', '.spa-page', function(event, viewData) {
    var $page = $(event.currentTarget),
        pageId = $page.data('id'),
        pageData = viewsdata[pageId],
        pageOptions = routes[pageData.route]
            
    // 重置回调函数
    $.each(['init', 'beforeopen', 'afteropen', 'beforeclose', 'afterclose'], function(i, fn) {
      viewData[fn] && (pageOptions[fn] = viewData[fn])
    })

    pageData.viewData = viewData

    // 渲染视图内容
    $('.spa-page-body', $page).html(viewData.body)    

    // 初始化视图
    pageOptions.init.call($page, pageData)
    
    // 打开页面视图
    $page.trigger('spa:openpage')

    $doc.trigger('spa:closeloader')
  })
  
  //打开页面
  $doc.on('spa:openpage', '.spa-page', function(event, afteropenCallback) {
    var $page = $(event.currentTarget),
        pageId = $page.data('id'),
        pageData = viewsdata[pageId],
        route = routes[pageData.route],
        hash = pageData.hash,
        pushData = pageData.pushData,
        oldpushData = pageData.oldpushData,
        requestData = pageData.requestData,
        viewData = pageData.viewData,
        title = pushData.title || viewData.title,
        animate = pushData.animate || route.animate
    
    // 第一次没有页面视图的时候
    // 新建一个占位页面视图
    if(!$curPage) {
      $curPage = $('<div class="spa-page spa-page-empty"><div class="spa-page-body"></div></div>').appendTo($('body'))
    }

    var curPageId = $curPage.data('id'),
        curPageData = viewsdata[curPageId] || {}

    // 如果是返回前一个页面，强制设置为前一个页面的反相动画效果
    // 但是，pushData.animate的优先级更高
    if(!pushData.animate && curPageData.prevPage && curPageData.prevPage.data('id') === pageId) {
      var prevAnimate = curPageData.prevAnimate
      if(prevAnimate && !$.isFunction(prevAnimate)) {
        animate = transitPageAnimatesName[prevAnimate]
      }
    }
    
    var beforeclose,
        afterclose
    
    // 判断当前视图是面板还是页面
    if($curPage.hasClass('spa-panel')) {
      var panelOptions = panels[$curPage.data('id')]
      
      beforeclose = panelOptions.beforeclose
      afterclose = panelOptions.afterclose
    } else if(curPageData.route) {
      var curPageRoute = routes[curPageData.route]
      
      beforeclose = curPageRoute.beforeclose
      afterclose = curPageRoute.afterclose

      $doc.trigger('spa:navigate', {
        hash: hash,
        title: title,
        pushData: pushData,
        replace: true
      })
    }
        
    // $doc.trigger('spa:opencover')
            
    var callback = function() {
      route.afteropen.call($page, pageData)

      // 关闭之后清除spa-scroll-touch
      $('.spa-scroll', $curPage).removeClass('spa-scroll-touch')

      afterclose && afterclose.call($curPage, curPageData)
      pageData.prevPage = $curPage
      $curPage = $page
      // $doc.trigger('spa:closecover')
      
      // 页面打开后，如果当前路由和当前页面不匹配，触发路由请求
      if(pageData.hash !== getHash()) {
        $win.trigger('popstate')
      } else {
        $.isFunction(afteropenCallback) && afteropenCallback.call($page)
      }
    }

    // 打开之前还原spa-scroll-touch
    $('.spa-scroll', $page).addClass('spa-scroll-touch')

    beforeclose && beforeclose.call($curPage, curPageData)
    
    route.beforeopen.call($page, pageData)
    
    // 缓存页面最近一次载入的动画
    pageData.prevAnimate = animate
    
    if(!$.isFunction(animate)) {
      transitPage($page, $curPage, animate, callback)
    } else {
      animate($page, $curPage, callback)
    }

    // 更改视图缓存顺序
    $doc.trigger('spa:viewcachesort', {view: $page})
    
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
  $doc.on('spa:panel', function(event, options) {
    var args = Array.prototype.slice.call(arguments, 1)
    if(args.length > 1) {
      $.each(args, function(i, panel) {
        $doc.trigger('spa:panel', panel)
      })
      
      return false
    }
        
    //禁止重复定义ID相同的面板
    if(options.id && !panels[options.id]) {
      panels[options.id] = $.extend({}, defaultPanelOptions, options)
    }
  })

  //创建新面板
  $doc.on('spa:createpanel', function(event, id, pushData) {     
    var panelOptions = panels[id]
    
    if(panelOptions) {
      $doc.trigger('spa:openloader')

      var classname = panelOptions.classname ? ' spa-panel-' + panelOptions.classname : '',
          $panel = $('<div id="spa-panel-' + id + '" class="spa-page spa-panel ' + classname + '"><div class="spa-page-bg"></div><div class="spa-page-body"></div></div>'),
          panelData,
          viewData
      
      // 设置panelId
      $panel.data('id', id)

      panelData = {
        id: id,
        pushData: pushData,
        el: $panel
      }

      viewsdata[id] = panelData

      //初始化页面数据    
      $panel.appendTo($body)

      //缓存面板
      $doc.trigger('spa:viewcache', {view: $panel})
      
      //获取视图数据
      viewData = panelOptions.view.call($panel, panelData)
            
      if($.isPlainObject(viewData)) {
        $panel.trigger('spa:initpanel', viewData)
      }
    }
  })

  //初始化面板
  $doc.on('spa:initpanel', '.spa-panel', function(event, viewData) {
    var $panel = $(event.currentTarget),
        panelId = $panel.data('id'),
        panelData = viewsdata[panelId],
        pushData = panelData.pushData,
        panelOptions = panels[panelId]
        
    //重置回调函数
    $.each(['init', 'beforeopen', 'afteropen', 'beforeclose', 'afterclose'], function(i, fn) {
      viewData[fn] && (panelOptions[fn] = viewData[fn])
    })

    panelData.viewData = viewData

    // 渲染视图内容
    $('.spa-page-body', $panel).html(viewData.body)

    // 执行初始化回调函数    
    panelOptions.init.call($panel, panelData)
    
    //触发打开页面事件
    $panel.trigger('spa:openpanel', [panelId, pushData])

    $doc.trigger('spa:closeloader')
  })

  //打开面板
  $doc.on('spa:openpanel', function(event, id, pushData) {
    //在页面加载和转场过程中阻止面板请求
    // if(($cover && $cover.css('display') === 'block') || ($loader && $loader.css('display') === 'block')) {
    //   return false
    // }
    if($loader && $loader.css('display') === 'block') {
      return false
    }
    
    var $panel = panelscache[id]

    pushData || (pushData = {})
    
    if($panel) {
      var panelOptions = panels[id],
          animate = pushData.animate || panelOptions.animate
      
      // 如果当前页面是面板，则先收起之前的面板，再打开新面板
      if($curPage.hasClass('spa-panel')) {
        var curPageData = viewsdata($curPage.data('id')),
            $prevPage = curPageData.prevPage
        
        $prevPage.trigger('spa:openpage', [function() {
          $doc.trigger('spa:openpanel', [id, pushData])
        }])
        
        return false
      }

      var panelData = viewsdata[id]
          
      panelData.oldpushData = panelData.pushData
      panelData.pushData = pushData
          
      // $doc.trigger('spa:opencover')

      // 打开之前还原spa-scroll-touch
      $('.spa-scroll', $panel).addClass('spa-scroll-touch')
      
      panelOptions.beforeopen.call($panel, panelData)

      var callback = function() {
        panelOptions.afteropen.call($panel, panelData)  
        panelData.prevPage = $curPage
        $curPage = $panel
        // $doc.trigger('spa:closecover')
      }

      // 缓存页面最近一次载入的动画
      panelData.prevAnimate = animate
      
      if(!$.isFunction(animate)) {
        transitPage($panel, $curPage, animate, callback)
      } else {
        animate($panel, $curPage, callback)
      }

      // 更改视图缓存顺序
      $doc.trigger('spa:viewcachesort', {view: $panel})

    } else {
      $doc.trigger('spa:createpanel', [id, pushData])
    }
    
  })
  
  //关闭面板
  $doc.on('spa:closepanel', function(event, options) {
    var $panel = $(event.target),
        panelId = $panel.data('id'),
        panelData = viewsdata[panelId]
    
    options && options.id && ($panel = $('.spa-panel-' + options.id))
    
    // 关闭面板后打开之前的页面
    if($curPage.hasClass('spa-panel') && $curPage.data('id') === panelId) {
      var $page = panelData.prevPage
      
      $page.trigger('spa:openpage')
    }
  })
  
  //点击面板外侧自动关闭面板
  $doc.on('click touchstart', '.spa-panel', function(event) {
    var $panel = $(event.currentTarget),
        $tagert = $(event.target)
    
    if($tagert.hasClass('spa-page-bg') || $tagert.hasClass('spa-panel')) {
      event.stopPropagation()
      event.preventDefault()
      $panel.trigger('spa:closepanel')
    }
  })


  /*
   * 设置清理页面最多缓存的页面数量
   */

  $doc.on('spa:viewcachecount', function(event, options) {
    viewcachecount = options.count
  })


  /*
   * 缓存并清理视图优化内存
   */

  $doc.on('spa:viewcache', function(event, options) {
    var $view = options.view,
        viewId = $view.data('id'),
        type,
        key

    // 先缓存
    if($view.hasClass('spa-panel')) {
      type = 'panle'
      key = viewId
      panelscache[key] = $view
    } else {
      type = 'page'
      key = viewsdata[viewId].hash
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
  })


  /*
   * 更新视图缓存顺序
   */

  $doc.on('spa:viewcachesort', function(event, options) {
    var $view = options.view,
        viewId = $view.data('id'),
        type,
        key,
        name,
        index

    if($view.hasClass('spa-panel')) {
      type = 'panle'
      key = viewId
    } else {
      type = 'page'
      key = viewsdata[viewId].hash
    }

    name = type + ':' + key
    index = viewscache.indexOf(name)

    if(index !== -1) {
      viewscache.splice(index, 1)
      viewscache.unshift(name)
    }
  })
  

  /*
   * 路由请求
   */
  
  $doc.on('spa:navigate', function(event, options) {
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
      
      //fix: 当$win.trigger('popstate')后,popstate事件对象无法获取到原生事件对象的state属性
      !$.isEmptyObject(pushData) && (historystate = pushData)

      $win.trigger('popstate')
    }
  })
  
  
  /*
   * 场景转换遮罩
   */

  // 阻塞鼠标和手势操作
  function preventEventHandle(evnet) {
    event.stopPropagation()
    event.preventDefault()
  }

  // 显示遮罩层
  // $doc.on('spa:opencover', function(event) {
  //   $cover.show()
  // })

  // 隐藏遮罩层
  // $doc.on('spa:closecover', function(event) {
  //   $cover.hide()
  // })

  
  /*
   * 数据加载动画
   * http://css-tricks.com/snippets/css/bouncy-animated-loading-animation/
   */

  // 自定义loading层元素和样式
  $doc.on('spa:loader', function(event, options) {
    options.body && (loaderBody = options.body)
    options.style && (loaderStyle = options.style)
  })
  
  // 显示loading层
  $doc.on('spa:openloader', function(event) {
    $loader.show()
  })

  // 隐藏loading层
  $doc.on('spa:closeloader', function(event) {
    $loader.hide()
  })
    
  
  /*
   * 应用启动
   */
  
  $doc.on('spa:boot', function(event) {
    // 初始化$body
    $body = $('body')
    // 注入样式
    $doc.trigger('spa:addstyle', viewStyle)
    // 调整全屏模式
    $fullscreen = $('<div class="spa-fullscreen"></div>').prependTo($body)
    $doc.trigger('spa:adjustfullscreen')

    // 初始化$cover
    // $cover = $('<div class="spa-cover"></div>').appendTo($('body'))
    // $cover.on('click select mousedown mousemove mouseup touchstart touchmove touchend', preventEventHandle)   

    // 初始化loading层
    $doc.trigger('spa:addstyle', loaderStyle)
    $loader = $('<div class="spa-loader">' + loaderBody + '</div>').appendTo($('body'))
    $loader.on('click select mousedown mousemove mouseup touchstart touchmove touchend', preventEventHandle)

    // 启动完成
    hasBoot = true
    // 激活路由请求
    $win.trigger('popstate')
  })
  
})(window.Zepto || window.jQuery || window.$)

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

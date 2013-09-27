/*
 * requestAnimationFrame and cancel polyfill
 */
;(function() {
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

;(function($) {
  var $win = $(window),
      $doc = $(document),
      $body,
      location = window.location,
      history = window.history,
      routes = {},
      pagezIndex = 2000,
      prevPagezIndex = 2001,
      curPagezIndex = 2002,  
      viewStyle = 'body { position: relative; margin: 0; padding: 0; width: 100%; overflow: hidden; }\
        .spa-fullscreen {position: absolute; left: 0; top: 0; margin: 0; padding: 0; width: 100%; visibility: hidden; overflow: hidden; z-index: -1; }\
        .spa-page {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; z-index: 2000; }\
        .spa-page-bg {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; }\
        .spa-page-body {position: absolute; left: 0; top: 0; bottom: 0; right: 0; margin: 0; padding: 0; overflow: hidden; }\
        .spa-scroll {overflow: auto; -webkit-overflow-scrolling: touch; -moz-overflow-scrolling: touch; -ms-overflow-scrolling: touch; -o-overflow-scrolling: touch; overflow-scrolling: touch; }\
        .spa-scroll-x {overflow-x: auto; -webkit-overflow-scrolling: touch; -moz-overflow-scrolling: touch; -ms-overflow-scrolling: touch; -o-overflow-scrolling: touch; overflow-scrolling: touch; }\
        .spa-scroll-y {overflow-y: auto; -webkit-overflow-scrolling: touch; -moz-overflow-scrolling: touch; -ms-overflow-scrolling: touch; -o-overflow-scrolling: touch; overflow-scrolling: touch; }\
        .spa-cover {position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; overflow: hidden; z-index: 5000; }\
        .spa-loader {position: absolute; left: 0; right: 0; top: 0; bottom: 0; text-align: center; overflow: hidden; z-index: 5001; }',
      loaderBody = '<div class="spa-loader-animate"><span></span><span></span><span></span></div>',
      loaderStyle = '.spa-loader .spa-loader-animate {position: absolute; left: 50%; top: 50%; margin: -12px 0 0 -65px; }\
        .spa-loader .spa-loader-animate span { display: inline-block; vertical-align: middle; width: 10px; height: 10px; margin: 0 10px; background: black; border-radius: 50px; -webkit-animation: loader 0.9s infinite alternate; -moz-animation: loader 0.9s infinite alternate; }\
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
      $currentTarget.data('fullpageRequestID', requestAnimationFrame(function() {
        adjust()
      }))
    }
  })
  
  
  /*
   * scrollfix
   */
  
  $doc.on('scroll.spa', function(event, options) {
    var $target = $(event.target),
        direction = (options && options.direction) || ''
    
    $target.addClass('spa-scroll' + (direction ? '-' + direction : ''))    
  })

  $doc.on('touchstart', '.spa-scroll, .spa-scroll-x, .spa-scroll-y', function(event) {
    var $target = $(event.currentTarget),
        scrollTop = $target.scrollTop(),
        scrollLeft = $target.scrollLeft(),
        height = $target.height(),
        width = $target.width(),
        scrollHeight = $target.prop('scrollHeight'),
        scrollWidth = $target.prop('scrollWidth')
    
    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-x')) {
      if(scrollLeft < 0) {
        event.preventDefault()
      }
      if(scrollLeft <= 0) {
        $target.scrollLeft(1)
      }
      if(scrollLeft + width > scrollWidth) {
        event.preventDefault()
      }
      if(scrollLeft + width >= scrollWidth) {
        $target.scrollLeft(scrollWidth - width - 1)
      }
    }

    if($target.hasClass('spa-scroll') || $target.hasClass('spa-scroll-y')) {
      if(scrollTop < 0) {
        event.preventDefault()
      }
      if(scrollTop <= 0) {
        $target.scrollTop(1)
      }
      if(scrollTop + height > scrollHeight) {
        event.preventDefault()
      }
      if(scrollTop + height >= scrollHeight) {
        $target.scrollTop(scrollHeight - height - 1)
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
    
    var routes = $win.data('routes.spa') || {}
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
      transitPageAnimatesName = {}
  
  //默认转场动画
  transitPageAnimates.defaultInOut = function($toPage, $fromPage, callback) {
    //$fromPage.hide()
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
      if(key % 2 == 0) {
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
          $fromPageBody = $('.spa-page-body', $fromPage)
          
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({opacity: 0}).transition({opacity: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    fadeOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({opacity: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({opacity: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    fadeInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({x: '100%', opacity: 0}).transition({x: '0', opacity: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    fadeOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({x: '100%', opacity: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0, opacity: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({x: '-100%', opacity: 0}).transition({x: '0', opacity: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    fadeOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({x: '-100%', opacity: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0, opacity: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({y: '100%', opacity: 0}).transition({y: '0', opacity: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    fadeOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({y: '100%', opacity: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0, opacity: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    fadeInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({y: '-100%', opacity: 0}).transition({y: '0', opacity: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    fadeOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({y: '-100%', opacity: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0, opacity: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({x: '100%'}).transition({x: '0'}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    slideOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({x: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({x: '-100%'}).transition({x: '0'}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    slideOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({x: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({y: '100%'}).transition({y: '0'}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    slideOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({y: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    slideInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({y: '-100%'}).transition({y: '0'}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    slideOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({y: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    pushInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({x: '100%'}).transition({x: '0'}, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition({x: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        ++isFinish == 2 && callback()
      })
    },
    pushOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({x: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({x: '-100%'}).transition({x: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({x: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({x: '-100%'}).transition({x: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({x: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({x: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({x: '100%'}).transition({x: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({y: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({y: '100%'}).transition({y: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({y: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({y: '-100%'}).transition({y: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({y: '100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({y: '-100%'}).transition({y: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    pushOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $fromPageBody.transition({y: '-100%'}, function() {
        //$fromPage.hide()
        $fromPageBody.css({y: 0})
        ++isFinish == 2 && callback()
      })
      $toPageBody.css({y: '100%'}).transition({y: '0'}, function() {
        ++isFinish == 2 && callback()
      })
    },
    zoomIn: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({scale: 0}).transition({scale: 1}, function() {
        //$fromPage.hide()
        callback()
      })
    },
    zoomOut: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage)

      $fromPageBody.transition({scale: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({scale: 1})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width()
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({left: 'auto', width: pageBodyWidth})
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth, x: pageBodyWidth}).transition({x: 0}, function() {
        callback()
      })
    },
    overlayOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width()

      $fromPageBody.transition({x: prevPageBodyWidth}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', left: 0, x: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width()
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({right: 'auto', width: pageBodyWidth})
      pageBodyWidth = pageBodyWidth * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth, x: 0 - pageBodyWidth}).transition({x: 0}, function() {
        callback()
      })      
    },
    overlayOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width()

      $fromPageBody.transition({x: 0 - prevPageBodyWidth}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', right: 0, x: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height()
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({top: 'auto', height: pageBodyHeight})
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight, y: pageBodyHeight}).transition({y: 0}, function() {
        callback()
      })
    },
    overlayOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height()

      $fromPageBody.transition({y: prevPageBodyHeight}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', top: 0, y: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    overlayInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height()
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({bottom: 'auto', height: pageBodyHeight})
      pageBodyHeight = pageBodyHeight * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight, y: 0 - pageBodyHeight}).transition({y: 0}, function() {
        callback()
      })
    },
    overlayOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height()

      $fromPageBody.transition({y: 0 - prevPageBodyHeight}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', bottom: 0, y: 0})
        togglePagezIndex($fromPage, $toPage)
        callback()
      })
    },
    revealInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width()
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css({left: 'auto', width: pageBodyWidth})
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      $fromPageBody.transition({x: 0 - pageBodyWidth}, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width()

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({x: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', left: 0})
        callback()
      })
    },
    revealInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width()
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css({right: 'auto', width: pageBodyWidth})
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth})
      $fromPageBody.transition({x: pageBodyWidth}, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width()

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({x: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', right: 0})
        callback()
      })
    },
    revealInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height()
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css({top: 'auto', height: pageBodyHeight})
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      $fromPageBody.transition({y: 0 - pageBodyHeight}, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height()

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({y: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', top: 0})
        callback()
      })
    },
    revealInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height()
      
      togglePagezIndex($toPage, $fromPage)
      $toPageBody.css({bottom: 'auto', height: pageBodyHeight})
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight})
      $fromPageBody.transition({y: pageBodyHeight}, function() {
        togglePagezIndex($fromPage, $toPage)
        callback()
      })      
    },
    revealOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height()

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({y: 0}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', bottom: 0})
        callback()
      })
    },
    pushPartInLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          isFinish = 0
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({left: 'auto', width: pageBodyWidth})
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth, x: pageBodyWidth}).transition({x: 0}, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition({x: 0 - pageBodyWidth}, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({x: 0}, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition({x: prevPageBodyWidth}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', left: 0, x: 0})
        ++isFinish == 2 && callback()
      })
    },
    pushPartInRight: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyWidth = $toPageBody.children().width(),
          isFinish = 0
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({right: 'auto', width: pageBodyWidth})
      pageBodyWidth = $toPageBody.width() * 2 - $toPageBody.prop('clientWidth')
      $toPageBody.css({width: pageBodyWidth, x: 0 - pageBodyWidth}).transition({x: 0}, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition({x: pageBodyWidth}, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutLeft: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyWidth = $fromPageBody.width(),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({x: 0}, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition({x: 0 - prevPageBodyWidth}, function() {
        //$fromPage.hide()
        $fromPageBody.css({width: 'auto', right: 0, x: 0})
        ++isFinish == 2 && callback()
      })
    },
    pushPartInUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          isFinish = 0
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({top: 'auto', height: pageBodyHeight})
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight, y: pageBodyHeight}).transition({y: 0}, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition({y: 0 - pageBodyHeight}, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({y: 0}, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition({y: prevPageBodyHeight}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', top: 0, y: 0})
        ++isFinish == 2 && callback()
      })
    },
    pushPartInDown: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          pageBodyHeight = $toPageBody.children().height(),
          isFinish = 0
      
      togglePagezIndex($fromPage, $toPage)
      $toPageBody.css({bottom: 'auto', height: pageBodyHeight})
      pageBodyHeight = $toPageBody.height() * 2 - $toPageBody.prop('clientHeight')
      $toPageBody.css({height: pageBodyHeight, y: 0 - pageBodyHeight}).transition({y: 0}, function() {
        ++isFinish == 2 && callback()
      })      
      $fromPageBody.transition({y: pageBodyHeight}, function() {
        ++isFinish == 2 && callback()
      })      
    },
    pushPartOutUp: function($toPage, $fromPage, callback) {
      var $toPageBody = $('.spa-page-body', $toPage),
          $fromPageBody = $('.spa-page-body', $fromPage),
          prevPageBodyHeight = $fromPageBody.height(),
          isFinish = 0

      togglePagezIndex($fromPage, $toPage)
      $toPageBody.transition({y: 0}, function() {
        ++isFinish == 2 && callback()
      })
      $fromPageBody.transition({y: 0 - prevPageBodyHeight}, function() {
        //$fromPage.hide()
        $fromPageBody.css({height: 'auto', bottom: 0, y: 0})
        ++isFinish == 2 && callback()
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
        animate = transitPageAnimatesName[animate] ? animate : 'defaultInOut'
    
    //$toPage.show()
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
      var pagescache = $win.data('pagescache.spa') ||　{},
          classname = pageOptions.classname ? ' spa-page-' + pageOptions.classname : '',
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
      
      viewData = pageOptions.view.call($page)
      
      if($.isPlainObject(viewData)) {
        $page.trigger('initpage.spa', viewData)
      }
      
      //缓存该页面
      pagescache[hash] = $page
      $win.data('pagescache.spa', pagescache)
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
      $curPage = $('<div class="spa-page"><div class="spa-page-body"></div></div>').appendTo($('body'))
      $win.data('curPage.spa', $curPage)
    }

    //如果是返回之前的页面，强制设置为之前页面的反相动画效果
    if($curPage && $curPage.data('prevPage.spa') && $curPage.data('prevPage.spa').data('id.spa') == $page.data('id.spa')) {
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
    }
        
    $doc.trigger('opencover.spa')
    
    $doc.trigger('navigate.spa', {
      hash: hash,
      title: title,
      pushData: pushData,
      replace: true
    })
            
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
        $panel = panelscache[id],
        pushData = pushData || {}
    
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

      var panelscache = $win.data('panelscache.spa') ||　{},
          classname = panelOptions.classname ? ' spa-panel-' + panelOptions.classname : '',
          $panel = $('<div id="spa-panel-' + id + '" class="spa-page spa-panel ' + classname + '"><div class="spa-page-bg"></div><div class="spa-page-body"></div></div>'),
          viewData
          
      //初始化页面数据    
      $panel.data({
        'id.spa': id,
        'pushData.spa': pushData
      }).appendTo($('body'))
      
      viewData = panelOptions.view.call($panel)
      
      //缓存该页面
      panelscache[id] = $panel
      $win.data('panelscache.spa', panelscache)
      
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
   * 路由请求
   */
  
  $doc.on('navigate.spa', function(event, options) {
    var hash = options.hash || '',
        title = options.title || '',
        pushData = options.pushData || {},
        replace = options.replace || false

    title && (document.title = title)
    hash = hash ? '#' + hash : ''
    
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















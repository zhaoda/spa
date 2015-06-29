;(function (argument) {
  'use strict'

  var $doc = $(document)
  var $win = $(window)

  // 启动spa
  $.spa.boot = function(options) {
    $doc.trigger('spa:boot', options)
  }

  // 添加路由
  $.spa.addRoute = function(view) {
    $doc.trigger('spa:route', view)
  }

  $.spa.addPanel = function(options) {
    $doc.trigger('spa:panel', options)
  }

  // 路由跳转
  $.spa.navigate = function(options) {
    $doc.trigger('spa:navigate', options)
  }

  // 主动打开面板
  $.spa.openPanel = function(options) {
    options = options || {}
    $doc.trigger('spa:openpanel', options.id, options.pushData)
  }

  // 缓存页面控制
  $.spa.setViewCacheCount = function(options) {
    $doc.trigger('spa:viewcachecount', options)
  }

  // 加样式
  $.spa.addStyle = function(css) {
    $doc.trigger('spa:addstyle', css)
  }

  // 添加滚动
  $.spa.addElScroll = function($el, options) {
    $el.trigger('spa:scroll', options)
  }

  // 删除滚动
  $.spa.removeElScroll = function($el, options) {
    $el.trigger('spa:removescroll', options)
  }

  // 添加自定义转场动画
  $.spa.addTransitPageAnimates = function(options) {
    $doc.trigger('spa:addTransitPageAnimates', options)
  }

  // 自定义loading
  $.spa.setLoaderStyle = function(options) {
    $doc.trigger('spa:loader', options)
  }

  // 显示spa loading
  $.spa.openLoader = function() {
    $doc.trigger('spa:openloader')
  }

  // 关闭spa loading
  $.spa.closeLoader = function() {
    $doc.trigger('spa:closeloader')
  }

  // 强制全屏
  $.spa.fullScreen = function() {
    $win.trigger('spa:adjustfullscreen')
  }

})(window.Zepto || window.jQuery || window.$)
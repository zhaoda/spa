requirejs.config({
  baseUrl: '',
  // urlArgs: "v=" +  (new Date()).getTime(),
  urlArgs: 'v=20160919',
  paths: {}
})


var $doc = $(document)

// 设置缓存页面数量
$doc.trigger('spa:viewcachecount', {count: 2})

// 首页
var pageHome = {
  route: '',
  classname: 'home',
  animate: 'fadeIn',
  view: function() {
    var $page = this
    requirejs(['home'], function(viewData) {
      $doc.trigger('spa:initpage', [$page, viewData])
    })
  }
}

// demo:打开新页面视图
var demoNewPage = {
  route: 'demo/newpage',
  classname: 'demo-newpage',
  animate: 'slideInRight',
  view: function() {
    var $page = this
    requirejs(['demo.newpage'], function(viewData) {
      $doc.trigger('spa:initpage', [$page, viewData])
    })
  }
}

// demo:页面视图转换动画
var demoTransitPage = {
  route: 'demo/transitpage',
  classname: 'demo-transitpage',
  animate: 'default',
  view: function() {
    var $page = this
    requirejs(['demo.transitpage'], function(viewData) {
      $doc.trigger('spa:initpage', [$page, viewData])
    })
  }
}

// demo:404
var notFoundPage = {
  route: '*notfound',
  classname: 'demo-notfound',
  animate: 'default',
  view: function() {
    var $page = this
    requirejs(['demo.notfound'], function(viewData) {
      $doc.trigger('spa:initpage', [$page, viewData])
    })
  }
}

$doc.trigger('spa:route', [pageHome, demoNewPage, demoTransitPage, notFoundPage])

// demo:侧边栏菜单
var demoPanelSidemenu = {
  id: 'demoPanelSidemenu',
  classname: 'demo-panel-sidemenu',
  animate: 'revealInRight',
  view: function() {
    var $panel = this
    requirejs(['demo.panelsidemenu'], function(viewData) {
      $doc.trigger('spa:initpanel', [$panel, viewData])
    })
  }
}

// demo:提示对话框
var demoPanelAlert = {
  id: 'demoPanelAlert',
  classname: 'demo-panel-alert',
  animate: 'zoomIn',
  view: function() {
    var $panel = this
    requirejs(['demo.panelalert'], function(viewData) {
      $doc.trigger('spa:initpanel', [$panel, viewData])

      var $dialog = $('.panel', $panel)

      //高度居中
      $dialog.css({marginTop: ($panel.height() - $dialog.prop('offsetHeight')) / 2})
      
      $panel.on('click touchstart', 'button', function(event) {
        $panel.trigger('spa:closepanel')
        event.stopPropagation()
        event.preventDefault()
      })
    })
  }
}

// demo:确认对话框
var demoPanelConfirm = {
  id: 'demoPanelConfirm',
  classname: 'demo-panel-confirm',
  animate: 'overlayInUp',
  view: function() {
    var $panel = this
    requirejs(['demo.panelconfirm'], function(viewData) {
      $doc.trigger('spa:initpanel', [$panel, viewData])
    })
  }
}

// demo:面板视图转换动画
var demoPanelTransit = {
  id: 'demoPanelTransit',
  classname: 'demo-panel-transit',
  animate: 'overlayInLeft',
  view: function() {
    var $panel = this
    requirejs(['demo.paneltransit'], function(viewData) {
      $doc.trigger('spa:initpanel', [$panel, viewData])
    })
  }
}

$doc.trigger('spa:panel', [demoPanelSidemenu, demoPanelAlert, demoPanelConfirm, demoPanelTransit])


$(function() {
  $doc.trigger('spa:boot')
})

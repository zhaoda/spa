requirejs.config({
  baseUrl: '',
  urlArgs: "v=" +  (new Date()).getTime(),
  // urlArgs: 'v=20131127',
  paths: {}
})


var $doc = $(document)

// 首页
var pageHome = {
  route: '',
  classname: 'home',
  animate: 'fadeIn',
  view: function() {
    var $page = this
    requirejs(['home'], function(viewData) {
      $page.trigger('initpage.spa', viewData)
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
      $page.trigger('initpage.spa', viewData)
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
      $page.trigger('initpage.spa', viewData)
    })
  }
}


$doc.trigger('route.spa', [pageHome, demoNewPage, demoTransitPage])

// 导航菜单面板
var panelMenu = {
  id: 'menu',
  classname: 'menu',
  animate: 'overlayInRight',
  view: function() {
    var $panel = this
    requirejs(['menu'], function(menuView) {
      $panel.trigger('initpage.spa', menuView)
    })
  }
}

// demo:侧边栏菜单
var demoPanelSidemenu = {
  id: 'demoPanelSidemenu',
  classname: 'demo-panel-sidemenu',
  animate: 'revealInRight',
  view: function() {
    var $panel = this
    requirejs(['demo.panelsidemenu'], function(viewData) {
      $panel.trigger('initpanel.spa', viewData)
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
      $panel.trigger('initpanel.spa', viewData)
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
      $panel.trigger('initpanel.spa', viewData)
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
      $panel.trigger('initpanel.spa', viewData)
    })
  }
}

$doc.trigger('panel.spa', [panelMenu, demoPanelSidemenu, demoPanelAlert, demoPanelConfirm, demoPanelTransit])


$(function() {
  $doc.trigger('boot.spa')
})

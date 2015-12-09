define({
  title: 'SPA - 为WebApp设计的路由控制和视图转换框架',
  body: '<nav class="navbar navbar-default navbar-static-top" role="navigation">\
    <div class="navbar-header">\
      <a class="navbar-brand" href="#">SPA</a>\
    </div>\
    <!--a href="#" class="btn btn-default navbar-btn btn-link pull-left"><span class="glyphicon glyphicon-align-justify"></span></a-->\
    <!--a href="#" class="btn btn-default navbar-btn btn-link pull-right">关于</a-->\
  </nav>\
  <div class="page-container-navbar">\
    <div class="container">\
      <div class="page-header"><h1>概述</h1></div>\
      <p class="lead">SPA是为构建WebApp设计的路由控制和视图转换框架</p>\
      <p>\
      SPA专注于解决构建WebApp时遇到的共性问题，尤其适用于构建MobileApp，\
      我们和<a href="http://jquerymobile.com/" target="_blank">jQuery Mobile</a>、<a href="http://www.sencha.com/products/touch/" target="_blank">Sencha Touch</a>等框架不同，\
      并不是一个构建移动端应用的前端整体解决方案，所以我们不包含UI组件，如果你不想自己设计界面，\
      可以用<a href="http://getbootstrap.com/" target="_blank">Bootstrap</a>、<a href="http://topcoat.io/" target="_blank">Topcoat</a>等UI Components框架配合SPA，\
      来快速构建你的WebApp；\
      </p>\
      <p>\
      SPA依赖<a href="http://zeptojs.com/" target="_blank">Zepto</a>或<a href="http://jquery.com/" target="_blank">jQuery</a>，\
      并且每个视图可以通过<a href="http://requirejs.org/" target="_blank">RequireJS</a>、<a href="http://seajs.org/docs/" target="_blank">Sea.js</a>等CommonJS解决方案或者自定义的方式进行模块化组织、异步加载；\
      </p>\
      <p>\
      SPA支持移动端和桌面端的现代浏览器；\
      </p>\
      <p>\
      <iframe src="http://ghbtns.com/github-btn.html?user=zhaoda&repo=spa&type=watch" allowtransparency="true" frameborder="0" scrolling="0" width="53" height="20"></iframe>\
      <iframe src="http://ghbtns.com/github-btn.html?user=zhaoda&repo=spa&type=fork" allowtransparency="true" frameborder="0" scrolling="0" width="53" height="20"></iframe>\
      <iframe src="http://ghbtns.com/github-btn.html?user=zhaoda&type=follow" allowtransparency="true" frameborder="0" scrolling="0" width="132" height="20"></iframe>\
      </p>\
      <p>\
      <a href="https://travis-ci.org/zhaoda/spa" title="Build Status" target="_blank"><img src="https://img.shields.io/travis/zhaoda/spa.svg"/></a>\
      <a href="https://david-dm.org/zhaoda/spa#info=devDependencies" title="Dependency status" target="_blank"><img src="https://img.shields.io/david/dev/zhaoda/spa.svg"/></a>\
      <a href="https://npmjs.org/package/spa.js" title="Total views" target="_blank"><img src="https://img.shields.io/npm/v/spa.js.svg"/></a>\
      </p>\
      <div class="page-header"><h1>为什么使用SPA</h1></div>\
      <h3>提供快速的开发实现</h3>\
      <p>\
      你可以像开发传统网站一样，先设计并制作每个视图，比如页面、导航、对话框等等，然后通过SPA提供的接口把每个视图拼装组织，完成一个拥有NativeApp体验的WebApp；\
      </p>\
      <h3>保留更大的设计自由度</h3>\
      <p>\
      SPA相对于jQuery Mobile和Sencha Touch等框架，SPA是非常轻量级的，我们只关心并解决WebApp的路由控制和视图转换等共性问题，每个场景被模拟成一个&lt;body&gt;节点，场景内的具体界面和交互设计完全交给开发者；\
      </p>\
      <h3>减少后端依赖</h3>\
      <p>\
      视图的渲染和路由是在前端完成的，后端只需要提供一个简单的入口页面（Single-page application）和应用所需的异步数据接口；如果再配合使用javascript模版，还可以最大化的利用前端缓存，减少网络流量请求；\
      </p>\
      <h3>事件驱动</h3>\
      <p>\
      SPA不提供类、对象或函数库，利用jQuery的自定义事件和事件代理，SPA的接口都绑定到DOM上，所有的操作都是触发相关DOM上的自定义事件，将各个视图的代码解耦隔离，降低开发复杂度，这个特性和<a href="http://flightjs.github.io/" target="_blank">Flight</a>框架一致。\
      </p>\
      <div class="page-header"><h1>路由控制</h1></div>\
      <p>\
      WebApp中不同的视图（页面）通常需要被链接、收藏或分享，所以需要记录视图的地址，SPA提供基于hash fragments的URL路由控制，每个路由规则都绑定相应的页面视图，应用启动后将根据路由的变化自动转换视图；\
      </p>\
      <p>\
      SPA中的hash路由被设计成基于字符串片段的规则，每个片段用斜线<code>/</code>分割，\
      片段可以包含以冒号为前缀的参数<code>:param</code>，\
      以星号为前缀<code>*splat</code>可以匹配任意数量的片段，\
      括号括起来<code>(:optional)</code>可以匹配可选的片段（有或者无），\
      路由规则还可以直接用正则表达式创建；\
      </p>\
      <p>\
      解析后的请求参数数组<code>requestData</code>会存储到对应的页面视图对象中，以提供给视图渲染、视图初始化等回调函数所使用；\
      </p>\
      <p>\
      比如：\
      </p>\
      <p>\
      规则<code>"search/:keyword/page:num"</code>可以匹配路由请求<code>#search/something/page2</code>，并将参数<code>"something"</code>和<code>"2"</code>存储到视图对象；\
      </p>\
      <p>\
      规则<code>"file/*path"</code>可以匹配路由请求<code>#file/some/folder/file.txt</code>，并将参数<code>"some/folder/file.txt"</code>存储到视图对象；\
      </p>\
      <p>\
      规则<code>"docs/:section(/:subsection)"</code>可以匹配路由请求<code>#docs/faq</code>和<code>#docs/faq/install</code>，并将参数<code>"faq"</code>存储到第一个视图对象，将参数<code>"faq"</code>和<code>"install"</code>存储到第二个视图对象；\
      </p>\
      <p>\
      规则<code>"/^(.*?)\/open$/"</code>可以匹配路由请求<code>#some/thing/open</code>，并将参数<code>"some/thing"</code>存储到视图对象；\
      </p>\
      <p>\
      当用户点击链接、浏览器后退按钮或者输入url hash进行路由请求时，window的<code>popstate</code>事件将被触发，然后寻找匹配的路由规则，创建对应的页面视图，并进行初始化，再通过对应的转换动画来显示；\
      </p>\
      <pre>\
var pageHome = {\n\
  route: "",\n\
  classname: "home",\n\
  animate: "fadeIn",\n\
  view: function() {\n\
    var $page = this\n\
    requirejs(["home"], function(viewData) {\n\
      $doc.trigger("spa:initpage", [$page, viewData])\n\
    })\n\
  }\n\
}\n\
\n\
$doc.trigger("spa:route", [pageHome])\n\
      </pre>\
      <p>\
      除了用户操作，还可以通过<code>spa:navigate</code>事件主动进行路由请求。\
      </p>\
      <pre>\
$doc.trigger("spa:navigate", {\n\
  hash: "go/to/some/pageview"\n\
})\
      </pre>\
      <div class="page-header"><h1>视图转换</h1></div>\
      <p>\
      SPA提供了两类视图，分别是<strong>页面视图</strong>和<strong>面板视图</strong>，不同视图之间通过设定的动画规则进行转换；\
      </p>\
      <h3>页面视图</h3>\
      <p>\
      页面视图需要绑定路由规则，每次路由请求都会寻找匹配的路由规则，然后激活对应的页面视图；\
      </p>\
      <p>\
      页面视图是用一组<code>&lt;div&gt;</code>节点构造的容器，模拟成<code>&lt;body&gt;</code>节点承载视图内容并覆盖整个视图区域；\
      <code>.spa-page-<em>customclassname</em></code>区分不同视图，添加自定义样式；\
      每个节点的背景色默认透明；\
      <code>.spa-page-body</code>节点用来承载内容，通常在不需要半透明背景色的视图中，视图的背景色应该设置到该节点；\
      </p>\
      <pre>\
&lt;!--页面视图的DOM结构--&gt;\n\
&lt;div class="spa-page spa-page-<em>customclassname</em>"&gt;\n\
  &lt;div class="spa-page-body"&gt;\n\
    &lt;!--视图内容会被渲染到这里--&gt;\n\
  &lt;/div&gt;\n\
&lt;/div&gt;\
      </pre>\
      <p>\
      <a href="#demo/newpage" class="btn btn-sm btn-info">打开新页面视图</a>\
      </p>\
      <pre>\
//demo:打开新页面视图\n\
var demoNewPage = {\n\
  route: "demo/newpage",\n\
  classname: "demo-newpage",\n\
  animate: "pushInLeft",\n\
  view: function() {\n\
    var $page = this\n\
    requirejs(["demo.newpage"], function(viewData) {\n\
      $doc.trigger("spa:initpage", [$page, viewData])\n\
    })\n\
  }\n\
}\n\
\n\
$doc.trigger("spa:route", [demoNewPage])\n\
      </pre>\
      <h3>面板视图</h3>\
      <p>\
      面板视图不需要绑定路由规则，即没有对应的路由请求，需要在javascript中主动打开，面板视图可以用来做侧边栏菜单、对话框等应用组件；\
      </p>\
      <pre>\
//打开面板\n\
$doc.trigger("spa:openpanel", [<em>panelid</em>, <em>pushData</em>])\n\
      </pre>\
      <p>\
      面板视图的容器结构是在页面视图容器结构的基础上进行扩展；\
      增加了节点id<code>#spa-panel-<em>panelid</em></code>和classname<code>.spa-panel</code>；\
      </p>\
      <pre>\
&lt;!--面板视图的DOM结构--&gt;\n\
&lt;div id="spa-panel-<em>panelid</em>" class="spa-page spa-panel spa-page-<em>customclassname</em>"&gt;\n\
  &lt;div class="spa-page-bg"&gt;&lt;/div&gt;\n\
  &lt;div class="spa-page-body"&gt;\n\
    &lt;!--视图内容会被渲染到这里--&gt;\n\
  &lt;/div&gt;\n\
&lt;/div&gt;\
      </pre>\
      <p>\
      <a href="#" data-panel="demoPanelSidemenu" class="btn btn-sm btn-info btn-demo-panel">侧边栏菜单</a>\
      <a href="#" data-panel="demoPanelAlert" class="btn btn-sm btn-info btn-demo-panel">提示对话框</a>\
      <a href="#" data-panel="demoPanelConfirm" class="btn btn-sm btn-info btn-demo-panel">确认对话框</a>\
      </p>\
      <pre>\
//demo:侧边栏菜单\n\
var demoPanelSidemenu = {\n\
  id: "demoPanelSidemenu",\n\
  classname: "demo-panel-sidemenu",\n\
  animate: "revealInRight",\n\
  view: function() {\n\
    var $panel = this\n\
    requirejs(["demo.panelsidemenu"], function(viewData) {\n\
      $panel.trigger("spa:initpanel", viewData)\n\
    })\n\
  }\n\
}\n\
\n\
//demo:提示对话框\n\
var demoPanelAlert = {\n\
  id: "demoPanelAlert",\n\
  classname: "demo-panel-alert",\n\
  animate: "zoomIn",\n\
  view: function() {\n\
    var $panel = this\n\
    requirejs(["demo.panelalert"], function(viewData) {\n\
      $panel.trigger("spa:initpanel", viewData)\n\
    })\n\
  }\n\
}\n\
\n\
//demo:确认对话框\n\
var demoPanelConfirm = {\n\
  id: "demoPanelConfirm",\n\
  classname: "demo-panel-confirm",\n\
  animate: "overlayInUp",\n\
  view: function() {\n\
    var $panel = this\n\
    requirejs(["demo.panelconfirm"], function(viewData) {\n\
      $panel.trigger("spa:initpanel", viewData)\n\
    })\n\
  }\n\
}\n\
\n\
//添加面板\n\
$doc.trigger("spa:panel", [demoPanelSidemenu, demoPanelAlert, demoPanelConfirm])\n\
\n\
//点击按钮打开面板\n\
$doc.trigger("spa:openpanel", [<em>panelid</em>]) //panelid = demoPanelSidemenu, demoPanelAlert, demoPanelConfirm\n\
      </pre>\
      <h3>转换动画</h3>\
      <p>\
      SPA内置了22组视图转换动画，每组包含一个入场动画和一个相反的出场动画，比如<code>fadeIn & fadeOut</code>、<code>pushInRight & pushOutLeft</code>，\
      其中有12组动画是只支持面板视图，比如<code>overlayInUp & overlayOutDown</code>，\
      </p>\
      <p>\
      可以通过<code>$doc.trigger("spa:addTransitPageAnimates", <em>Animates</em>)</code>添加自定义的视图转换动画；\
      </p>\
      <p>\
      如果视图通过异步加载，将触发遮罩层和loading动画（可自定义）；\
      </p>\
      <h4>页面视图转换动画</h4>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="default">default</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="fadeIn">fadeIn</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="fadeOut">fadeOut</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideInLeft">slideInLeft</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideOutRight">slideOutRight</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideInRight">slideInRight</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideOutLeft">slideOutLeft</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideInUp">slideInUp</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideOutDown">slideOutDown</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideInDown">slideInDown</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="slideOutUp">slideOutUp</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushInLeft">pushInLeft</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushOutRight">pushOutRight</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushInRight">pushInRight</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushOutLeft">pushOutLeft</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushInUp">pushInUp</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushOutDown">pushOutDown</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushInDown">pushInDown</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="pushOutUp">pushOutUp</a>\
      </p>\
      <p>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="zoomIn">zoomIn</a>\
      <a href="#demo/transitpage" class="btn btn-sm btn-info btn-transitpage" data-animate="zoomOut">zoomOut</a>\
      </p>\
      <h4>面板视图转换动画</h4>\
      <p class="text-warning">注意：面板视图只支持正向的入场动画</p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="overlayInLeft">overlayInLeft</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">overlayOutRight</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="overlayInRight">overlayInRight</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">overlayOutLeft</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="overlayInUp">overlayInUp</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">overlayOutDown</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="overlayInDown">overlayInDown</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">overlayOutUp</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="revealInLeft">revealInLeft</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">revealOutRight</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="revealInRight">revealInRight</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">revealOutLeft</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="revealInUp">revealInUp</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">revealOutDown</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="revealInDown">revealInDown</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">revealOutUp</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="pushPartInLeft">pushPartInLeft</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">pushPartOutRight</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="pushPartInRight">pushPartInRight</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">pushPartOutLeft</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="pushPartInUp">pushPartInUp</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">pushPartOutDown</a>\
      </p>\
      <p>\
      <a href="#" class="btn btn-sm btn-info btn-transitpanel" data-animate="pushPartInDown">pushPartInDown</a>\
      <a href="#" class="btn btn-sm btn-default" disabled="disabled">pushPartOutUp</a>\
      </p>\
      <div class="page-header"><h1>License</h1></div>\
      <p>\
      SPA遵循<a href="https://github.com/zhaoda/spa/blob/master/LICENSE" target="_blank">MIT协议</a>，无论个人还是公司，都可以免费自由使用。\
      </p>\
    </div>\
  </div>\
  ',
  init: function(pageData) {
    var $view = this

    // 获取hash
    function getHash(url) {
      url = url || location.href
      return url.replace(/^[^#]*#?\/?(.*)\/?$/, '$1')
    }
    
    $('pre', $view).each(function(i, e) { hljs.highlightBlock(e) })
    
    $view.on('click', '.btn-demo-panel', function(event) {
      event.preventDefault()
      var $btn = $(this),
          panelid = $btn.attr('data-panel')
      
      $doc.trigger('spa:openpanel', [panelid])
    })

    $view.on('click', '.btn-transitpage', function(event) {
      event.preventDefault()
      var $btn = $(this),
          animate = $btn.attr('data-animate'),
          hash = getHash($btn.attr('href'))
      
      $doc.trigger('spa:navigate', {hash: hash, pushData: {animate: animate}})
    })

    $view.on('click', '.btn-transitpanel', function(event) {
      event.preventDefault()
      var $btn = $(this),
          animate = $btn.attr('data-animate')
      
      $doc.trigger('spa:openpanel', ['demoPanelTransit', {animate: animate}])
    })
    
    $('.page-container-navbar', $view).trigger('spa:scroll')
  }
})
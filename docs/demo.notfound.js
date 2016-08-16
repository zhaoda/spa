define({
  title: 'SPA - 页面不存在',
  body: '<nav class="navbar navbar-default navbar-static-top" role="navigation">\
    <div class="navbar-header">\
      <a class="navbar-brand" href="#demo/newpage">页面不存在</a>\
    </div>\
    <a href="#" class="btn btn-default navbar-btn btn-link pull-left"><span class="glyphicon glyphicon-chevron-left"></span></a>\
  </nav>\
  <div class="page-container-navbar">\
    <div class="container">\
      <div class="page-header"><h1>404</h1></div>\
      <p>Page Not Found</p>\
      <a href="#" class="btn btn-default">返回</a>\
    </div>\
  </div>\
  ',
  init: function(pageData) {
    var $view = this
    
    $('.page-container-navbar', $view).trigger('spa:scroll')
  }
})
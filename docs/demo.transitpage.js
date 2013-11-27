define({
  title: 'SPA - 页面视图转换动画demo',
  body: '\
  <div class="page-container">\
    <div class="container">\
      <div class="page-header"><h1>我是通过<span class="animate"></span>动画打开的页面视图</h1></div>\
      <a href="#" class="btn btn-default">返回</a>\
    </div>\
  </div>\
  ',
  init: function() {
    var $view = this
    
    $('.page-container', $view).trigger('scroll.spa')
  },
  beforeopen: function() {
    var $view = this,
        pushData = $view.data('pushData.spa'),
        animate = pushData.animate || 'default'

    $('.animate', $view).text(animate)
  }
})
define({
  body: '\
  <div class="container">\
    <ul>\
      <li>我是通过<span class="animate"></span>动画打开的面板视图</li>\
      <li>点击面板视图以外的区域可以返回</li>\
    </ul>\
  </div>\
  ',
  init: function(pageData) {
    var $view = this
    
    $('.container', $view).trigger('spa:scroll')
  },
  beforeopen: function(pageData) {
    var $view = this,
        pushData = pageData.pushData,
        animate = pushData.animate || 'default'

    $('.animate', $view).text(animate)
  }
})
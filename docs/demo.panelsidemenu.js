define({
  body: '<div class="container">\
    <div class="panel panel-default">\
      <div class="panel-heading">我是侧边栏菜单</div>\
      <div class="panel-body">\
        菜单可以上下滚动，点击右侧空白区域可以自动收起\
      </div>\
      <ul class="list-group">\
        <li class="list-group-item"><a href="#demo/newpage">新页面</a></li>\
        <li class="list-group-item">菜单1</li>\
        <li class="list-group-item">菜单2</li>\
        <li class="list-group-item">菜单3</li>\
        <li class="list-group-item">菜单4</li>\
        <li class="list-group-item">菜单5</li>\
        <li class="list-group-item">菜单6</li>\
        <li class="list-group-item">菜单7</li>\
        <li class="list-group-item">菜单8</li>\
        <li class="list-group-item">菜单9</li>\
        <li class="list-group-item">菜单10</li>\
      </ul>\
    </div>\
  </div>\
  ',
  init: function(panelData) {
    var $view = this
    
    $('.container', $view).trigger('spa:scroll')
  }
})
define({
  body: '<div class="container">\
    <div class="row">\
      <div class="col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3">\
        <div class="panel panel-success">\
          <div class="panel-heading">提示对话框</div>\
          <div class="panel-body">\
            <p>点击“知道了”按钮或者半透明区域可以关闭该对话框</p>\
            <p class="text-center"><button type="button" class="btn btn-lg btn-success">知道了</button><p>\
          </div>\
        </div>\
      </div>\
    </div>\
  </div>\
  ',
  init: function() {
    var $view = this,
        $dialog = $('.panel', $view)
    
    $('.container', $view).trigger('scroll.spa')
    
    //高度居中
    $dialog.css({marginTop: ($view.height() - $dialog.height()) / 2})
    
    $view.on('click', 'button', function(event) {
      $view.trigger('closepanel.spa')
    })

    $view.on('click', '.panel', function(event) {
      event.stopPropagation()
    })

    $view.on('click', '.spa-page-body', function(event) {
      $view.trigger('closepanel.spa')
    })
    
  },
  beforeopen: function() {
    var $view = this
    
    $('.spa-page-bg', $view).css({opacity: 0}).transition({opacity: 0.6})
  },
  beforeclose: function() {
    var $view = this
    
    $('.spa-page-bg', $view).transition({opacity: 0})
  }
})
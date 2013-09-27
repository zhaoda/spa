define({
  body: '<div class="container">\
    <button type="button" class="btn btn-primary btn-lg btn-block">确定</button>\
    <button type="button" class="btn btn-danger btn-lg btn-block">取消</button>\
  </div>\
  ',
  init: function() {
    var $view = this,
        $dialog = $('.panel', $view)
    
    $('.container', $view).trigger('scroll.spa')
        
    $view.on('click', 'button', function() {
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
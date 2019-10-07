"use strict";

(function () {
  var _collection = $(".js-input");

  _collection.keyboard({
    usePreview: false,
    useCombos: false,
    autoAccept: true,
  });

  $.keyboard.keyaction.enter = function (base) {
    base.accept();
    return false;
  };

  _collection.bind('beforeClose', function(){
    _collection.each(function () {
      var _current = $(this);
      _current.val() ? _current.addClass("active") : _current.removeClass("active");
    });
  });

  _collection.bind('beforeVisible', function(e, keyboard, el){
    $(el).addClass("active");
  });
})();
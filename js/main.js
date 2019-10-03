"use strict";

/*! npm.im/object-fit-images 3.2.4 */
var objectFitImages = function () {
  "use strict";
  function t(t, e) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + t + "' height='" + e + "'%3E%3C/svg%3E";
  }function e(t) {
    if (t.srcset && !p && window.picturefill) {
      var e = window.picturefill._;t[e.ns] && t[e.ns].evaled || e.fillImg(t, { reselect: !0 }), t[e.ns].curSrc || (t[e.ns].supported = !1, e.fillImg(t, { reselect: !0 })), t.currentSrc = t[e.ns].curSrc || t.src;
    }
  }function i(t) {
    for (var e, i = getComputedStyle(t).fontFamily, r = {}; null !== (e = u.exec(i));) {
      r[e[1]] = e[2];
    }return r;
  }function r(e, i, r) {
    var n = t(i || 1, r || 0);b.call(e, "src") !== n && h.call(e, "src", n);
  }function n(t, e) {
    t.naturalWidth ? e(t) : setTimeout(n, 100, t, e);
  }function c(t) {
    var c = i(t),
        o = t[l];if (c["object-fit"] = c["object-fit"] || "fill", !o.img) {
      if ("fill" === c["object-fit"]) return;if (!o.skipTest && f && !c["object-position"]) return;
    }if (!o.img) {
      o.img = new Image(t.width, t.height), o.img.srcset = b.call(t, "data-ofi-srcset") || t.srcset, o.img.src = b.call(t, "data-ofi-src") || t.src, h.call(t, "data-ofi-src", t.src), t.srcset && h.call(t, "data-ofi-srcset", t.srcset), r(t, t.naturalWidth || t.width, t.naturalHeight || t.height), t.srcset && (t.srcset = "");try {
        s(t);
      } catch (t) {
        window.console && console.warn("https://bit.ly/ofi-old-browser");
      }
    }e(o.img), t.style.backgroundImage = 'url("' + (o.img.currentSrc || o.img.src).replace(/"/g, '\\"') + '")', t.style.backgroundPosition = c["object-position"] || "center", t.style.backgroundRepeat = "no-repeat", t.style.backgroundOrigin = "content-box", /scale-down/.test(c["object-fit"]) ? n(o.img, function () {
      o.img.naturalWidth > t.width || o.img.naturalHeight > t.height ? t.style.backgroundSize = "contain" : t.style.backgroundSize = "auto";
    }) : t.style.backgroundSize = c["object-fit"].replace("none", "auto").replace("fill", "100% 100%"), n(o.img, function (e) {
      r(t, e.naturalWidth, e.naturalHeight);
    });
  }function s(t) {
    var e = { get: function get(e) {
        return t[l].img[e ? e : "src"];
      }, set: function set(e, i) {
        return t[l].img[i ? i : "src"] = e, h.call(t, "data-ofi-" + i, e), c(t), e;
      } };Object.defineProperty(t, "src", e), Object.defineProperty(t, "currentSrc", { get: function get() {
        return e.get("currentSrc");
      } }), Object.defineProperty(t, "srcset", { get: function get() {
        return e.get("srcset");
      }, set: function set(t) {
        return e.set(t, "srcset");
      } });
  }function o() {
    function t(t, e) {
      return t[l] && t[l].img && ("src" === e || "srcset" === e) ? t[l].img : t;
    }d || (HTMLImageElement.prototype.getAttribute = function (e) {
      return b.call(t(this, e), e);
    }, HTMLImageElement.prototype.setAttribute = function (e, i) {
      return h.call(t(this, e), e, String(i));
    });
  }function a(t, e) {
    var i = !y && !t;if (e = e || {}, t = t || "img", d && !e.skipTest || !m) return !1;"img" === t ? t = document.getElementsByTagName("img") : "string" == typeof t ? t = document.querySelectorAll(t) : "length" in t || (t = [t]);for (var r = 0; r < t.length; r++) {
      t[r][l] = t[r][l] || { skipTest: e.skipTest }, c(t[r]);
    }i && (document.body.addEventListener("load", function (t) {
      "IMG" === t.target.tagName && a(t.target, { skipTest: e.skipTest });
    }, !0), y = !0, t = "img"), e.watchMQ && window.addEventListener("resize", a.bind(null, t, { skipTest: e.skipTest }));
  }var l = "bfred-it:object-fit-images",
      u = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g,
      g = "undefined" == typeof Image ? { style: { "object-position": 1 } } : new Image(),
      f = "object-fit" in g.style,
      d = "object-position" in g.style,
      m = "background-size" in g.style,
      p = "string" == typeof g.currentSrc,
      b = g.getAttribute,
      h = g.setAttribute,
      y = !1;return a.supportsObjectFit = f, a.supportsObjectPosition = d, o(), a;
}();

var App = function () {
  "use strict";

  var form = $("#registration_form");
  var startBtn = $(".start-btn");
  var wheelBlock = $("#wheel");
  var pie = wheelBlock.find(".pie");
  var pieAmin = $('.wheel__pie');
  var formBlock = $("#form");
  var errorMessages = {
    name: {
      regExp: /([A-Za-zА-ЯЄІЇа-яєії])+$/,
      empty: "Имя обязательно",
      notValid: "Некорректное имя"
    },
    phone: {
      regExp: /[0-9+()-\s]{5,}/,
      empty: "Номер телефона или телеграм логин обязателен",
      notValid: "Некорректный номер телефона",
      group: 1
    },
    telegram: {
      regExp: /\@?[\d\w]{5,}/,
      empty: "Номер телефона или телеграм логин обязателен",
      notValid: "Некорректный telegram",
      group: 1
    }
  };

  function testPrizes(prizes) {
    for (var i = 0; i < prizes.length; i++) {
      var prize = prizes[i];
      if (prize.amount > 0) {
        return true;
      }
    }
    return false;
  }
  var randomNumberInRange = function randomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  var getRandomPrize = function getRandomPrize(prizes) {
    var random = randomNumberInRange(1, prizes.length);

    var amount = prizes[random - 1].amount;
    if (amount > 0) {
      return random;
    } else {
      return testPrizes(prizes) && getRandomPrize(prizes);
    }
  };
  var prizes;

  return {
    labelFormActive: function labelFormActive() {
      $(".js-input").keyup(function () {
        var _this = $(this);
        _this.val() ? _this.addClass("active") : _this.removeClass("active");
      });
    },
    submitHandler: function submitHandler() {
      form.submit(function (e) {
        e.preventDefault();

        $(".form_error").remove();
        var errorFields = App.validateForm(form);
        if (errorFields.length) {
          App.showErrorFields(errorFields);
        } else {
          var ajaxData = {};
          var serializeData = form.serialize();
          var dataArr = serializeData.split("&");
          for (var i = 0; i < dataArr.length; i++) {
            var item = dataArr[i].split("=");
            var name = item[0];
            var value = item[1];
            ajaxData[name] = decodeURIComponent(value);
          }
          $.ajax({
            type: "PUT",
            url: "http://localhost:8070/api/users/",
            contentType: "application/json",
            data: JSON.stringify(ajaxData),
            success: function (response) {
              document.getElementById('wheel__num').innerHTML = `#${response.userId}`;
              document.cookie = `userId=${response.userId}`;
              window.userId = response.userId;
              $('#form').hide();
              $('.wheel__info').show();
              $('.wheel__info').css({ 'display': 'flex', 'align-items': 'center' });
              App.getPrizes();
            }
          });
        }
      });
    },
    showErrorFields: function showErrorFields(errorFields) {
      for (var i = 0; i < errorFields.length; i++) {
        var _errorFields$i = errorFields[i],
            name = _errorFields$i.name,
            msg = _errorFields$i.msg;

        var field = $("[name=" + name + "]");
        field.parents(".input").append("<div class=\"form_error\"> " + msg + "</div >");
      }
    },
    validateInput: function validateInput(input) {
      if (!input.length) {
        return false;
      }
      var error = "";
      var value = input.val();
      var name = input.attr("name");
      if (!errorMessages[name]) {
        return false;
      }
      var _errorMessages$name = errorMessages[name],
          regExp = _errorMessages$name.regExp,
          empty = _errorMessages$name.empty,
          notValid = _errorMessages$name.notValid;

      if (value.length < 1) {
        error = empty;
      } else {
        var isValid = regExp.test(value);
        if (!isValid) {
          error = notValid;
        }
      }
      return error;
    },
    validateForm: function validateForm(form) {
      var inputs = form.find(".js-input");
      var errors = [];
      var validGroups = [];
      for (var i = 0; i < inputs.length; i++) {
        var input = $(inputs[i]);
        var name = input.attr("name");
        var group = "";

        if (errorMessages[name]) {
          group = errorMessages[name].group;
        }
        var error = App.validateInput(input);
        if (error) {
          if (group) {
            errors.push({ name: name, msg: error, group: group });
          } else {
            errors.push({ name: name, msg: error });
          }
        } else {
          if (group && validGroups.indexOf(group) === -1) {
            validGroups.push(group);
          }
        }
      }

      var filteredErrors = errors.filter(function (error) {
        var group = error.group;

        if (!group) {
          return error;
        } else {
          if (validGroups.indexOf(group) !== -1) {
            return false;
          } else {
            return error;
          }
        }
      });
      return filteredErrors;
    },
  getPrizes: () => {
    $.ajax({
      type: "GET",
      url: "http://localhost:8070/api/lottery/",
      success: function (response) {
        prizes = response;
        if (!testPrizes(prizes)) {
          startBtn.addClass('disabled');
          return;
        };
        startBtn.click(function (e) {
          e.preventDefault();
          App.startGame();
        });
        return;
      }
    });
  },
  startGame: function startGame() {
    formBlock.hide();
    wheelBlock.show();
    startBtn.addClass('disabled');
    var number = getRandomPrize(prizes);

    var spinCount = randomNumberInRange(2, 4);
    var deg = (number - 1) * 45 - 45 + 22.5 + spinCount * 360;
    pieAmin.animate({
      textIndent: -deg
    }, {
        duration: spinCount * 1000,
        step: function step(now, fx) {
          $(this).css("transform", "rotate(" + now + "deg)");
        },
        complete: () => {
          $.ajax({
            type: "POST",
            url: "http://localhost:8070/api/users/win",
            contentType: "application/json",
            data: JSON.stringify({ prizeId: prizes[number - 1].id, userId })
          });
        }
      });
    },
    pieDraw: function pieDraw() {
      var degRotate = -180 - 22.5;
      var degSkew = -45;
      var colors = ["rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)"];
      for (var i = 0; i < colors.length; i++) {
        var sector = $('<div class="sector"></div>');
        sector.css({
          transform: "rotate(" + degRotate + "deg) skew(" + degSkew + "deg)",
          background: colors[i]
        });
        degRotate = degRotate + 45;
        pie.append(sector);
      }

      var item = $('.prizes__item');
      var position = -112.5;
      for (var _i = 0; _i < item.length; _i++) {
        item[_i].style.transform = 'rotate(' + position + 'deg) translateX(-50%)';
        position = position + 45;
      }
    },

    init: function init() {
      App.labelFormActive();
      App.submitHandler();
      App.pieDraw();
    }
  };
}();

$(document).ready(function () {
  App.init();
});
//# sourceMappingURL=../maps/main.js.map

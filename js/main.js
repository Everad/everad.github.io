"use strict";


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

	//db connections
	var initTables = function () {
		const db = openDatabase(
			'applicants',
			'1.0',
			'ApplicantsDb',
			10*1024*1024
		);
		db.transaction(function(trx){
			trx.executeSql('CREATE TABLE IF NOT EXISTS PERSONAL_INFO (id INTEGER PRIMARY KEY, name, phone, telegram, role, prize)');
		});
		return db;
	};


	var getCurrentUserId = function () {
		const db = initTables();

		return new Promise(function(resolved) {
			db.transaction(function(trx){
				trx.executeSql('SELECT max(id) FROM PERSONAL_INFO', [], function(tx, result){
					resolved(result.rows[0]['max(id)']);
				});
			});
		});
	};

	var validateTelegram = function (data) {
		const db = initTables();

		return new Promise(function(resolved, rejected) {
			db.transaction(function(trx){
				trx.executeSql(`SELECT * FROM PERSONAL_INFO WHERE telegram="${data.telegram}"`, [], function(tx, result){
					result.rows.length === 0 ? resolved(data) : rejected(`Telegram already exists`);
				});
			});
		});
	};


	var insertNewUser = function (data) {
		const db = initTables();
		return new Promise(resolved => {
			db.transaction(
				function(trx){
					trx.executeSql(`INSERT INTO PERSONAL_INFO (name, phone, telegram, role, prize)
                VALUES ("${data.name}", "${data.phone}", "${data.telegram}", "${data.role}", "")`)
				},
				[],
				function () {resolved(true);}
			);
		})

	};



	var updateGood = async function (type, nn) {
		const db = initTables();
		return new Promise(resolved => {
			db.transaction(
				function(trx){
					trx.executeSql(`UPDATE PERSONAL_INFO SET prize="${type}" WHERE id="${nn}"`)
				},
				[],
				function () {
					decreasePrizeAmount(type);
					resolved(true);
				}
			);
		})

	};


	function testPrizes(prizes) {
    for (var i = 0; i < prizes.length; i++) {
      var prize = prizes[i];

      if (prize.count > 0) {
        return true;
      }
    }

    return false;
  }

  var randomNumberInRange = function randomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var getRandomPrize = function getRandomPrize(prizes) {
    var random = randomNumberInRange(0, prizes.length - 1);
    var amount = prizes[random].count;

    if (amount > 0) {
	    prizes[random].count = prizes[random].count - 1;
	    return random;
    } else {
      return testPrizes(prizes) && getRandomPrize(prizes);
    }
  };

  var prizes = [{
	  count: 130,
	  type: "Стикер-салфетка для экрана и камеры"
  },{
	  count: 5,
	  type: "Porsche на радиоуправлении"
  } , {
  	  count: 10,
	  type: "Power Bank"
 },{
    count: 30,
    type: "Термокружка"
  }, {
	 count: 200,
	type: "Обнимашки"
 }, {
    count: 150,
    type: "Значок"
  }, {
    count: 160,
    type: "Блокнот"
  }, {
    count: 200,
    type: "Набор стикеров"
  }];
  //prizes methods
  var getPrizes = () => {
	const prizesList = localStorage.getItem('prizes');
	  if(!prizesList) {
		  localStorage.setItem('prizes', JSON.stringify(prizes))
	  };
	  return JSON.parse(localStorage.getItem('prizes'));
  }
  var dropPrizes = () => localStorage.removeItem('prizes');
  var decreasePrizeAmount = prizeType => {
  	const prizesList = JSON.parse(localStorage.getItem('prizes'))
	  const currentPrizeIndex = prizesList.findIndex(prz => prz.type === prizeType);
	  prizesList[currentPrizeIndex].count--;
	  localStorage.setItem('prizes', JSON.stringify(prizesList))

  }
  //

  var insertPrizes = () => {
	  const db = openDatabase(
		  'applicants',
		  '1.0',
		  'ApplicantsDb',
		  10*1024*1024
	  );
  }

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
            var value = decodeURI(item[1]);
            ajaxData[name] = value;
          }
	        insertNewUser(ajaxData).then(getCurrentUserId).then(data => {
	        	console.log('\n\ndata', data,'\n\n');
		        var id_field = $("#wheel__user-id");
		        id_field.html(`#${ data + 10000 }`.substr(2));
	        });
	        //insert id to [FE]

          $('#form').hide();
          $('.wheel__info').show();
          $('.wheel__info').css({
            'display': 'flex',
            'align-items': 'center'
          });
        }
      });
    },
    showErrorFields: function showErrorFields(errorFields) {
      for (var i = 0; i < errorFields.length; i++) {
        var _errorFields$i = errorFields[i],
            name = _errorFields$i.name,
            msg = _errorFields$i.msg;
        var field = $("[name=".concat(name, "]"));
        field.parents(".input").append("<div class=\"form_error\"> ".concat(msg, "</div >"));
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
            errors.push({
              name: name,
              msg: error,
              group: group
            });
          } else {
            errors.push({
              name: name,
              msg: error
            });
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
    startGame: function startGame() {
      startBtn.click(async function (e) {
        e.preventDefault();
        formBlock.hide();
        wheelBlock.show();
        startBtn.addClass('disabled');
        const prizesList = getPrizes();
        var number = getRandomPrize(prizesList);
        var spinCount = randomNumberInRange(2, 4);
        var deg = (number) * 45  + 22.5 + spinCount * 360;
        getCurrentUserId().then(data => {
          $('#your_id-span').html(`#${ 10000 + data }`.substr(2));
	        pieAmin.animate({
		        textIndent: -deg
	        }, {
		        duration: spinCount * 1000,
		        step: function step(now, fx) {
			        $(this).css("transform", "rotate(".concat(now, "deg)"));
		        },
		        complete: function complete() {
			        $('.main').addClass('animate');
		        }
	        });
	        $('#prise__user').html(prizesList[number].type);
	        return updateGood(prizesList[number].type, data).then(() => {});
        }).catch(() => {
	        pieAmin.animate({
		        textIndent: -deg
	        }, {
		        duration: spinCount * 1000,
		        step: function step(now, fx) {
			        $(this).css("transform", "rotate(".concat(now, "deg)"));
		        },
		        complete: function complete() {
			        $('.main').addClass('animate');
		        }
	        });
        });

      });
    },
    anewStartGame: function anewStartGame() {
      $('.js-anew').click(function (e) {
        e.preventDefault();
        $('.main').removeClass('animate');
        startBtn.removeClass('disabled');
        $('#form').show();
        $('#form').find("input[type=text], input[type=tel]").val("");
        $(".js-input").removeClass('active');
        $('.wheel__info').hide();
      });
    },
    pieDraw: function pieDraw() {
      var degRotate = -180 - 22.5;
      var degSkew = -45;
      var colors = ["rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)", "rgba(255, 68, 146, 0)", "rgba(159, 114, 255, 0)"];

      for (var i = 0; i < colors.length; i++) {
        var sector = $('<div class="sector"></div>');
        sector.css({
          transform: "rotate(".concat(degRotate, "deg) skew(").concat(degSkew, "deg)"),
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
    	if(window.location.search.includes('clear=true')) {
		    dropPrizes();
		    const db = openDatabase(
			    'applicants',
			    '1.0',
			    'ApplicantsDb',
			    10*1024*1024
		    );
		    db.transaction(function(trx){
			    trx.executeSql('DROP TABLE PERSONAL_INFO');
		    });
	    }
	  getPrizes()
      App.labelFormActive();
      App.submitHandler();
      App.startGame();
      App.pieDraw();
      App.anewStartGame();
    }
  };
}();

$(document).ready(function () {
  App.init();
});
//# sourceMappingURL=../maps/main.js.map

"use strict";

var App = function () {
    "use strict";

    var form = $("#registration_form");
    var startBtn = $(".start-btn");
    var wheelBlock = $("#wheel");
    var pie = wheelBlock.find(".pie");
    var pieAmin = $('.wheel__pie');
    var formBlock = $("#form");
    var googleSheetsRow = {};
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
            10 * 1024 * 1024
        );
        db.transaction(function (trx) {
            trx.executeSql('CREATE TABLE IF NOT EXISTS PERSONAL_INFO (id INTEGER PRIMARY KEY, name, phone, telegram, role, prize)');
        });
        return db;
    };


    var getCurrentUserId = function () {
        const db = initTables();

        return new Promise(function (resolved) {
            db.transaction(function (trx) {
                trx.executeSql('SELECT max(id) FROM PERSONAL_INFO', [], function (tx, result) {
                    resolved(result.rows[0]['max(id)']);
                });
            });
        });
    };

    var validateTelegram = function (data) {
        const db = initTables();

        return new Promise(function (resolved, rejected) {
            db.transaction(function (trx) {
                trx.executeSql(`SELECT * FROM PERSONAL_INFO WHERE telegram="${data.telegram}"`, [], function (tx, result) {
                    result.rows.length === 0 ? resolved(data) : rejected(`Telegram already exists`);
                });
            });
        });
    };


    var insertNewUser = function (data) {
        const db = initTables();
        return new Promise(resolved => {
            db.transaction(
                function (trx) {
                    trx.executeSql(`INSERT INTO PERSONAL_INFO (name, phone, telegram, role, prize)
                VALUES ("${data.name}", "${data.phone}", "${data.telegram}", "${data.role}", "")`)
                },
                [],
                function () {
                    resolved(true);
                }
            );
        })

    };


    var updateGood = async function (type, nn) {
        const db = initTables();
        return new Promise(resolved => {
            db.transaction(
                function (trx) {
                    trx.executeSql(`UPDATE PERSONAL_INFO SET prize="${type}" WHERE id="${nn}"`)
                },
                [],
                function () {
                    // decreasePrizeAmount(type);
                    resolved(true);
                }
            );
        })

    };


    // function testPrizes(prizes) {
    //     for (var i = 0; i < prizes.length; i++) {
    //         var prize = prizes[i];
    //
    //         if (prize.count > 0) {
    //             return true;
    //         }
    //     }
    //
    //     return false;
    // }

    var randomNumberInRange = function randomNumberInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    //gifts methods
    var prepareGiftListWithFrequencies = () => {
        const giftsCount = gifts.reduce((count, nextVal) => {
            return count + nextVal.count
        }, 0)
        const giftsFlatList = new Array(giftsCount);
        let offset = 0;
        gifts.map(gift => {
            giftsFlatList.fill(gift.type, offset, offset + gift.count);
            offset += gift.count;
        })
        return giftsFlatList
    }

    const getGifts = () => {
        let giftsFlatList = localStorage.getItem('gifts');
        if (!giftsFlatList) {
            giftsFlatList = prepareGiftListWithFrequencies();
            localStorage.setItem('gifts', JSON.stringify(giftsFlatList))
        };
        return JSON.parse(localStorage.getItem('gifts'));
    }
    const removeGiftFromLottery = (giftsList, indexToRemove) => {
        giftsList.splice(indexToRemove, 1);
        localStorage.setItem('gifts', JSON.stringify(giftsList))
    }

    const clearGifts = () => localStorage.removeItem('gifts');


    // var insertPrizes = () => {
    //     const db = openDatabase(
    //         'applicants',
    //         '1.0',
    //         'ApplicantsDb',
    //         10 * 1024 * 1024
    //     );
    // }

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
                // var errorFields = App.validateForm(form);
                var errorFields = [];

                if (errorFields.length) {
                    App.showErrorFields(errorFields);
                } else {
                    var ajaxData = {};
                    var serializeData = form.serialize();
                    var dataArr = serializeData.split("&");
                    for (var i = 0; i < dataArr.length; i++) {
                        var item = dataArr[i].split("=");
                        var name = item[0];
                        var value = decodeURIComponent(item[1]);
                        ajaxData[name] = value;
                    }
                    insertNewUser(ajaxData).then(getCurrentUserId).then(userId => {
                        Object.assign(googleSheetsRow, ajaxData);
                        var id_field = $("#wheel__user-id");
                        var idString = ("000" + userId).slice(-4);
                        googleSheetsRow.id = idString;
                        id_field.html("#" + idString);
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
                const giftList = getGifts();
                if (!giftList.length) {
                    alert("There are no gifts left")
                }
                const giftIndex = randomNumberInRange(0, giftList.length);
                const gift = giftList[giftIndex];
                const sectorNumber = gifts.findIndex(item => item.type === gift);
                var spinCount = randomNumberInRange(4, 8);
                var deg = (sectorNumber) * 45 + 22.5 + spinCount * 360;
                console.log('\n\ndeg', deg,'\n\n');
                console.log('\n\nspinCount', spinCount,'\n\n');
                getCurrentUserId().then(userId => {
                    $('#your_id-span').html(`#${10000 + userId}`.substr(2));
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
                    $('#prise__user').html(gift);
                    return updateGood(gift, userId).then(() => {
                        googleSheetsRow.gift = gift;
                        saveToGoogleSheets(googleSheetsRow);
                        removeGiftFromLottery(giftList, giftIndex);
                    });
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
                // e.preventDefault();
                // $('.main').removeClass('animate');
                // startBtn.removeClass('disabled');
                // $('#form').show();
                // $('#form').find("input[type=text], input[type=tel]").val("");
                // $(".js-input").removeClass('active');
                // $('.wheel__info').hide();
	            location.reload(true);
            });
        },
        pieDraw: function pieDraw() {
            var degRotate = -180 - 22.5;
            var degSkew = -45;
            var colors = [
                "rgba(255, 68, 146, 0)",
                "rgba(159, 114, 255, 0)",
                "rgba(255, 68, 146, 0)",
                "rgba(159, 114, 255, 0)",
                "rgba(255, 68, 146, 0)",
                "rgba(159, 114, 255, 0)",
                "rgba(255, 68, 146, 0)",
                "rgba(159, 114, 255, 0)"
            ];

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
            if (window.location.search.includes('clear=true')) {
                clearGifts();
                const db = openDatabase(
                    'applicants',
                    '1.0',
                    'ApplicantsDb',
                    10 * 1024 * 1024
                );
                db.transaction(function (trx) {
                    trx.executeSql('DROP TABLE PERSONAL_INFO');
                });
            }
            getGifts();
            handleClientLoad();
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

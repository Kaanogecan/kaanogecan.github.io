"use strict";
var redirects =
{
    pagesEnum: { Contact: 0, Abilities: 1 },
    hideModal: function () { utils.modal.hideModal() },

    redirectInit: function () {
        let url = location.href;
        if (url.includes("http")) {
            url = url.replace('http://', '');
        }
        if (url.includes("https")) {
            url = url.replace('https://', '');
        }
        url = url.substring(url.indexOf('/'), url.length);
        homePageFuncs.breakBlink = true;
        if (url == '/' || url.startsWith("/index.html")) homePageFuncs.typeWriterHome();
        else if (url.startsWith("/contact.html")) redirects.getContactPage();
        else if (url.startsWith("/abilities.html")) redirects.getAbilitiesPage();
        else if (url.startsWith("/eduinfo.html")) redirects.getEduInfoPage();
        else if (url.startsWith("/info.html")) redirects.getInfoPage();
    },

    changeUrl: function (redirectingUrl, title) {
        let currentUrl = location.href;
        currentUrl = currentUrl.substring(0, currentUrl.indexOf('/'));
        let currentTitle = 'Cv.Exe';
        const nextURL = currentUrl + redirectingUrl;
        const nextTitle = currentTitle + ' >> ' + title;
        const nextState = { additionalInformation: 'Updated the URL with JS' };
        $("title").html(nextTitle);
        // This will create a new entry in the browser's history, without reloading
        window.history.pushState(nextState, nextTitle, nextURL);
    },

    changeTitle: function (title) {
        const element = document.getElementById('title');
        element.innerHTML = title;
    },
    getContactPage: function (htmlDiv, changeTitle = true) {
        htmlDiv = htmlDiv == undefined || htmlDiv == "" ? "#content" : htmlDiv;
        homePageFuncs.breakBlink = true;
        $.get("contact.html", function (data) {
            $(htmlDiv).html(data);
        });
        if (changeTitle) {
            redirects.changeTitle('GetContact()');
            redirects.changeUrl("contact.html", 'GetContact()');
        }
        this.hideModal();
    },
    getAbilitiesPage: function (htmlDiv, changeTitle = true) {
        htmlDiv = htmlDiv == undefined || htmlDiv == "" ? "#content" : htmlDiv;
        homePageFuncs.breakBlink = true;
        $.get("abilities.html", function (data) {
            $(htmlDiv).html(data);
        });
        if (changeTitle) {
            redirects.changeTitle('GetAbilities()');
            redirects.changeUrl("abilities.html", 'GetAbilities()');
        }
        this.hideModal();
    },
    getEduInfoPage: function (htmlDiv, changeTitle = true) {
        htmlDiv = htmlDiv == undefined || htmlDiv == "" ? "#content" : htmlDiv;
        homePageFuncs.breakBlink = true;
        $.get("eduinfo.html", function (data) {
            $(htmlDiv).html(data);
        });
        if (changeTitle) {
            redirects.changeTitle('GetEduInfo()');
            redirects.changeUrl("eduinfo.html", 'GetEduInfo()');
        }
        this.hideModal();
    },
    getInfoPage: function () {
        homePageFuncs.breakBlink = true;
        $.get("info.html", function (data) {
            $("#content").html(data);
        });
        redirects.changeTitle('GetInfo()');
        redirects.changeUrl("info.html", 'GetInfo()');
        this.hideModal();
    },
    onlyPartialRequestAction: function () {
        $.get("index.html", function (data) {
            $("body").html(data);
        });
    }
}
var bottomConsole =
{
    functionTxtList: [],
    InitIntellisenseWords: function () {
        var functionElementList = $("#navBar a").toArray();
        // CV yi de ekleme
        var showCv = $("#mainContent #CvOnizle");
        var showCvObj =
        {
            key: "ShowCv()",
            value: $(showCv).attr("href"),
            onclick: $(showCv).attr("href"),
        }
        bottomConsole.functionTxtList.push(showCvObj);

        functionElementList.forEach(aElement => {
            var obj = {
                key: $(aElement).attr("tooltipFuncText") + "()",
                value: $(aElement).attr("href"),
                onclick: $(aElement).attr("onclick")
            };
            bottomConsole.functionTxtList.push(obj);
        });
    },
    preventStringInput: function (key) {
        if (key == 'ArrowUp') {
            var intelliElements = $(".IntelliSenseDivElements").toArray();
            var selected = $(".IntelliSenseDivElements.selected");
            if (selected.length == 0) {
                $(intelliElements[intelliElements.length - 1]).addClass("selected");
            }
            else {
                var index = parseInt($(selected).attr("val"));
                $(".IntelliSenseDivElements.selected").removeClass("selected");
                $(intelliElements[index > 0 ? (index - 1) : intelliElements.length - 1]).addClass("selected");
            }
            return;
        }
        if (key == 'ArrowDown') {
            var intelliElements = $(".IntelliSenseDivElements").toArray();
            var selected = $(".IntelliSenseDivElements.selected");
            if (selected.length == 0) {
                $(intelliElements[0]).addClass("selected");
            }
            else {
                var index = parseInt($(selected).attr("val"));
                $(".IntelliSenseDivElements.selected").removeClass("selected");
                $(intelliElements[intelliElements.length - 1 > index ? (index + 1) : 0]).addClass("selected");
            }
            return;
        }
        var selected = $(".IntelliSenseDivElements.selected");

        if (selected.length != 0 && key == "Enter") {
            $(selected).removeClass("selected");
            eval($(selected).attr("onclick"));
            bottomConsole.hideInteliDiv();
            return;
        }

        var inputText = $("#bottomInput").val();
        var inteli = [];
        if (bottomConsole.functionTxtList.length == 0) {
            bottomConsole.InitIntellisenseWords();
        }
        bottomConsole.functionTxtList.forEach(element => {
            if (element.key.toUpperCase().includes(inputText.toUpperCase())) inteli.push(element.key);
        });
        bottomConsole.IntelliDivPush(inteli);
        if (key == "Enter") {
            var functionObject = bottomConsole.functionTxtList.find(x => x.key == inputText);
            if (inputText == "help") {
                let html = "";
                bottomConsole.functionTxtList.map(function (x) { html += x.key + "<br>"; });
                utils.modal.modal(html);
                $("#bottomInput").val('');
            }
            if (functionObject) {
                var fncTxt = functionObject.onclick;;
                try {
                    eval(fncTxt);
                } catch (error) {
                    location.href = fncTxt;
                }
                $("#bottomInput").val('');
                bottomConsole.hideHelpDiv();
                bottomConsole.hideInteliDiv();
                location.href = functionObject.value;
            }
        }

    },
    IntelliDivPush: function (list) {
        if (list.length == 0) {
            bottomConsole.hideInteliDiv()
            return;
        }
        if ($("#intelliDiv").length == 0) {
            $("#bottomStatic").prepend("<div id='intelliDiv'></div>")
        }
        $("#intelliDiv").show();
        var div = "<ul>";
        list.forEach(element => {
            let img = '<img src="./source/img/method.png" style = "width:20px;height:20px"/>';
            div += '<li class="IntelliSenseDivElements intelliDivHover" selected="false" val="' + list.indexOf(element) + '" onclick ="bottomConsole.intellisenseOtoCompleteInput(\'' + element + '\')"> <div class="inline">' + img + "&nbsp;" + element + '</div></li>';
        });
        div += "</ul>";
        $("#intelliDiv").html(div);
    },
    hideInteliDiv: function () {
        $("#intelliDiv").hide();
        $("div").remove("#intelliDiv");
    },
    hideInteliDivDelay: function () {
        function q(i) {
            setTimeout(function () {
                if (i > 3) {
                    q(i + 1);
                }
                else {
                    $("#intelliDiv").hide();
                    $("div").remove("#intelliDiv");
                    // $("#bottomInput").focus()
                    return;
                }
            }, 100);
        }
        q(0);
    },
    hideHelpDiv: function () {
        $("div").remove("#helpDiv");
    },
    intellisenseOtoCompleteInput: function (text) {
        $("#bottomInput").val(text);
    }
}
function InitToolTip() {
    $('.customTooltip').mouseover(function () {
        var txt = $(this).attr("tooltipText");
        var isDisabledForTooltip = $(this).hasClass("disabledForTooltip");
        if (!isDisabledForTooltip) {
            var funcTxt = $(this).attr("tooltipFuncText");
            var divTxt = funcTxt && funcTxt != '' ? "<div class='tooltipTopSide'><div class= 'lightBlue'>function&nbsp;</div><div class='method'> " + funcTxt + "</div>():&nbsp;<div class='commentLine'>void</div>" + '</div><hr>' : '';
            divTxt += txt;

            $("#wrapper").append('<div class ="tooltipDiv"> ' + divTxt + ' </div>');
            var topPosition = $(this).offset().top - $(document).scrollTop() + 25;
            var leftPosition = $(this).offset().left - $(document).scrollLeft();

            if ((leftPosition + ($(window).width() * 0.12)) > $(window).width()) {
                leftPosition = ($(window).width() * 0.85);
            }
            $(".tooltipDiv").css({ top: topPosition, left: leftPosition, position: 'fixed', border: "1px solid white", padding: "10px", "background-color": "black", "font-size": "1rem", "z-index": 999 });
        }
    });
    $('.customTooltip').mouseout(function () {
        $(".tooltipDiv").hide()
        $("div").remove(".tooltipDiv");
    });
}
var homePageFuncs = {
    downloadCv: function () {

    },
    typeWriterHome: function () {
        homePageFuncs.breakBlink = false;
        var txt = 'Merhaba, Ben Kaan. Kişisel Cv web siteme hoş geldin.\nBu websitesini kendimi geliştirmek, eğlenmek ve yaptıklarımı insanların beğenisine sunmak için hazırladım.' +
            '\n Sitenin altında bulunan console\'a yazacağın komutlarla sayfalar arası gezinti yapabilirsin.\n Komutları görmek için help yazıp entera basman yeterli.' +
            '\nEğer console\'a yazı yazmak sana uzak geliyorsa veya şimdi kim yazacak komutları,\n hızlıca sayfaları gezeyim diyorsan yukarıda bulunan menüden de sayfalar arası gezinti yapabilirsin. :)' +
            '\nİstersen bu websitesi yerine benim hakkımda bilgileri cv\'m aracılığıyla da edinebilirsin.\nSol tarafta bulunan panele indirmen veya önizlemen için kısayol ekledim.';
        $("#content").html('');
        var i = 0;
        var speed = 10; /* The speed/duration of the effect in milliseconds */
        var replacedText = "";
        function typeWriter() {
            if (!homePageFuncs.breakBlink) {
                if (i < txt.length) {
                    if (txt.charAt(i) == "\n") {
                        $("#content").append("<br>");
                        replacedText += "<br>";
                    }
                    replacedText += txt.charAt(i);
                    $("#content").append(txt.charAt(i));
                    i++;
                    setTimeout(typeWriter, speed);
                }
                else {
                    $("#content").html($("#content").outerText);
                    homePageFuncs.blink("#content", replacedText);
                }
            }
        }
        typeWriter();
    },
    breakBlink: false,
    isShow: false,
    blink: function (selector, text) {
        setTimeout(function () {
            if (homePageFuncs.breakBlink) return;
            if (!homePageFuncs.isShow) {
                $(selector).append("█");
                homePageFuncs.isShow = true;
            }
            else {
                $(selector).html(text);
                homePageFuncs.isShow = false;
            }
            homePageFuncs.blink(selector, text);
        }, 500);
    }
}
var utils =
{

    decIncPx: 2,
    toggleAnimationMs: 10,
    toggleLeftMenu: function (Id) {
        let toggleElements = $(Id + ">.toggleElement").toArray();
        let value = $(Id).attr("value") == "True";
        let txt = $(Id + ">#leftMenuToggle").text();
        if (value) {
            $(Id + ">#leftMenuToggle").text("◥" + txt.substring(1));
            $(Id + ".toggleElement>a").addClass("disabledForTooltip");

            toggleElements.forEach(x => {
                utils.toggleHideAnimation(x, 0);
            });
            $(Id).attr("value", "False");
        }
        else {
            $(Id + ">#leftMenuToggle").text("◢" + txt.substring(1));
            $(Id + ".toggleElement>a").removeClass("disabledForTooltip");
            toggleElements.forEach(x => {
                utils.toggleShowAnimation(x, 0);
            });
            $(Id).attr("value", "True");
        }
    },
    toggleHideAnimation: function (x, i) {
        function toggle(x, i) {
            setTimeout(function () {
                let top = $(x).css("margin-top");
                top = parseInt(top.split("px")[0]);
                $(x).css("margin-top", top - utils.decIncPx + "px")
                if (i < 9) {
                    toggle(x, i + 1);
                }
                else {
                    $(x).hide();
                    return;
                }
            }, utils.toggleAnimationMs);

        }
        toggle(x, i);
    },
    toggleShowAnimation: function (x, i) {
        function toggle(x, i) {
            setTimeout(function () {
                let top = $(x).css("margin-top");
                top = parseInt(top.split("px")[0]);
                $(x).css("margin-top", top + utils.decIncPx + "px")
                if (i == 0) {
                    $(x).show();
                }
                if (i < 9) {
                    toggle(x, i + 1);
                }
                else {
                    return;
                }
            }, utils.toggleAnimationMs);
        }
        toggle(x, i);
    },
    progressComponent: {
        progressComponent: function (element, id, name, percent, color, animationMs) {
            let isColorSetted = true;
            if (!color || color == '') {
                color = 'secondary';
                isColorSetted = false;
            }
            let component = `
            <div class="row bottomBorder">
                <div class="col-sm-3">`+ name + `</div>
                <div class="col-sm-8">
                    <div class="progress">
                        <div id="`+ id + `" class="progress-bar progress-bar-striped bg-` + color + ` progress-bar-animated"
                            role="progressbar" aria-label="Success example" style="width: 0%" aria-valuenow="25"
                            aria-valuemin="0" aria-valuemax="100"> 0%
                        </div>
                    </div>
                </div>
            </div>`;
            $(element).append(component);
            this.loadAnimation(id, percent, isColorSetted ? color : null, animationMs);
        },
        loadAnimation: function (element, percent, color, animationMs) {
            setTimeout(() => {
                let myElement = document.querySelector("#\\" + element);
                this.loadAnimationStep(myElement, 0, percent, color, animationMs);
            }, 300);
        },
        indexByColor:
            [
                { key: 90, value: "success" },
                { key: 70, value: "primary" },
                { key: 50, value: "info" },
                { key: 30, value: "warning" },
                { key: 15, value: "danger" },
                { key: 0, value: "secondary" },
            ],
        loadAnimationDefaultMs: 20,
        loadAnimationStep(element, index, limit, color, animationMs) {
            if (index <= limit) {
                if (!color || color == null) {
                    let className = this.indexByColor.find(x => index >= x.key).value;
                    $(element).removeClass("bg-success");
                    $(element).removeClass("bg-primary");
                    $(element).removeClass("bg-info");
                    $(element).removeClass("bg-warning");
                    $(element).removeClass("bg-danger");
                    $(element).removeClass("bg-secondary");
                    $(element).addClass("bg-" + className);
                }
                $(element).css('width', index + '%');
                $(element).html(index + '%');
                setTimeout(() => {
                    this.loadAnimationStep(element, index + 1, limit, color, animationMs);
                }, animationMs ?? this.loadAnimationDefaultMs);
            }
        },
    },
    modal: {
        modal: function (html) {
            $("div").remove("#modal");
            $.get("glitch.html", function (data) {
                $("#mainContent").append(data);
                $("#mainContent").css("filter", "blur(2px)")
                $("#wrapper").append("<div id ='modal'>" + html + "</div>");
                $("#modal").append("<div style='right: 4%;top: 0px;position: absolute; cursor: pointer' onclick='utils.modal.hideModal()'>x</div>");
            });
            // $("#mainContent").css("filter", "blur(2px)")
            // $("#wrapper").append("<div id ='modal'>" + html + "</div>");
            // $("#modal").append("<div style='right: 4%;top: 0px;position: absolute; cursor: pointer' onclick='utils.modal.hideModal()'>x</div>");
        },
        hideModal: function () {
            $("canvas").remove("#canvas");
            $("div").remove("#modal");
            $("#mainContent").css("filter", "blur(0)")
        },
    },
    textToSpeech: function (text) {
        // new SpeechSynthesisUtterance object
        let utter = new SpeechSynthesisUtterance();
        utter.lang = 'tr-TR';
        utter.text = text;
        utter.volume = 1;

        // event after text has been spoken
        utter.onend = function () {
            alert('Speech has finished');
        }

        // speak
        window.speechSynthesis.speak(utter);
    },
    randomKeyGenerator: function () {
        let r = (Math.random() + 1).toString(36).substring(2);
        return r;
    }
}
var infoPageFuncs = {
    getPartialByRadioId: function (pageRadioInput) {
        let pages = { abilities: 1, eduInfo: 2, contact: 3 };
        var value = $(pageRadioInput).val();

        let currentPageName = $("#infoMainContent>#newPage").attr("value");
        let currentPageIndex = pages[currentPageName];

        let newIndex = pages[value];
        let isTop = (currentPageIndex < newIndex) || currentPageIndex == undefined;
        let pageInnerDivId = "";

        // if (isTop) {
        $("div").remove("#currentPage");
        $("#infoMainContent>#newPage").attr("Id", "currentPage");
        $("#infoMainContent").append("<div id = 'newPage' value='" + value + "'></div>");
        $("#infoMainContent>#currentPage").css("height", "100%");
        pageInnerDivId = "#infoMainContent>#newPage";
        // }
        // else {
        //     $("#infoMainContent>#newPage").attr("value", value);
        //     $("#infoMainContent>#currentPage").attr("value", currentPageIndex);
        //     pageInnerDivId = "#infoMainContent>#currentPage";
        // }

        if (value == "abilities") {
            redirects.getAbilitiesPage(pageInnerDivId, false);
        }
        if (value == "eduInfo") {
            redirects.getEduInfoPage(pageInnerDivId, false);
        }
        if (value == "contact") {
            redirects.getContactPage(pageInnerDivId, false);
        }
        // if (isTop)
        this.slideAnimationTop(1);
        // else
        //     this.slideAnimationBottom(1);
    },
    slideAnimationTop: function (animationSpeedMs) {

        function sliderStep(value, animationSpeedMs) {
            if (value >= 0) {
                $("#infoMainContent>#currentPage").css("height", value + "%")
                setTimeout(() => {
                    sliderStep(value - 1, animationSpeedMs);
                }, animationSpeedMs);
            }
        }
        sliderStep(100, animationSpeedMs);
    },
    slideAnimationBottom: function (animationSpeedMs) {

        function sliderStep(value, animationSpeedMs) {
            if (value <= 100) {
                $("#infoMainContent>#currentPage").css("height", value + "%")
                setTimeout(() => {
                    sliderStep(value + 1, animationSpeedMs);
                }, animationSpeedMs);
            }
        }
        sliderStep(0, animationSpeedMs);
    }
}

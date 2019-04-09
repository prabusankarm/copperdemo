$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});


function deskMedia() {
    if (window.matchMedia('(min-width: 1020px)').matches) {
        var win_height = $(window).height();
        var header_height = $('.custom_header').height();
        var footer_height = $('footer.footer').height();
        var totl_height = (win_height - (header_height + footer_height));
        $('main').css('min-height', totl_height);
    }
    else {

    }
}

function resMedia() {
    if (window.matchMedia('(max-width: 800px)').matches) {
        $('.moile_hamburg_dots').click(function (e) {
            e.preventDefault();
            $('.mobile_header').stop().slideToggle();
        });
        $('.maxmize').hide();
        $('.mobile_header').children().removeClass('d-flex justify-content-end');
    }
    else {

    }
}

//ResCarouselCustom();
var pageRefresh = true;

function ResCarouselCustom() {
    var items = $("#dItems").val(),
        slide = $("#dSlide").val(),
        speed = $("#dSpeed").val(),
        interval = $("#dInterval").val()

    var itemsD = "data-items=\"" + items + "\"",
        slideD = "data-slide=\"" + slide + "\"",
        speedD = "data-speed=\"" + speed + "\"",
        intervalD = "data-interval=\"" + interval + "\"";


    var atts = "";
    atts += items != "" ? itemsD + " " : "";
    atts += slide != "" ? slideD + " " : "";
    atts += speed != "" ? speedD + " " : "";
    atts += interval != "" ? intervalD + " " : ""

    //console.log(atts);

    var dat = "";
    dat += '<h4 >' + atts + '</h4>'
    dat += '<div class=\"resCarousel\" ' + atts + '>'
    dat += '<div class="resCarousel-inner">'
    for (var i = 1; i <= 14; i++) {
        dat += '<div class=\"item\"><div><h1>' + i + '</h1></div></div>'
    }
    dat += '</div>'
    dat += '<button class=\'btn btn-default leftRs\'><i class=\"fa fa-fw fa-angle-left\"></i></button>'
    dat += '<button class=\'btn btn-default rightRs\'><i class=\"fa fa-fw fa-angle-right\"></i></button>    </div>'
    console.log(dat);
    $("#customRes").html(null).append(dat);

    if (!pageRefresh) {
        ResCarouselSize();
    } else {
        pageRefresh = false;
    }
    //ResCarouselSlide();
}

$("#eventLoad").on('ResCarouselLoad', function () {
    //console.log("triggered");
    var dat = "";
    var lenghtI = $(this).find(".item").length;
    if (lenghtI <= 30) {
        for (var i = lenghtI; i <= lenghtI + 10; i++) {
            dat += '<div class="item"><div class="tile"><div><h1>' + (i + 1) + '</h1></div><h3>Title</h3><p>content</p></div></div>'
        }
        $(this).append(dat);
    }
});


$(function () {
    // check native support
    $('#support').text($.fullscreen.isNativelySupported() ? 'supports' : 'doesn\'t support');

    // open in fullscreen
    $('.requestfullscreen').click(function () {
        $('body').fullscreen();
        $('body').addClass('screen_full');
        return false;
    });

    $('.half_screen').click(function () {
        $(this).parents('.widget').children('.div_g').fullscreen();
        $("body").addClass("fullscrn");
        // $(this).parents('.widget').children('.div_g').append( "<span class='icon-close1 close'></span>" );
        return false;
    });

    // exit fullscreen
    $('.exitfullscreen').click(function () {
        $.fullscreen.exit();
        return false;
    });

    // document's event
    $(document).bind('fscreenchange', function (e, state, elem) {
        // if we currently in fullscreen mode
        if ($.fullscreen.isFullScreen()) {
            $('#fullscreen .requestfullscreen').hide();
            $('#fullscreen .exitfullscreen').show();
            $('.requestfullscreen').children('span').removeClass('icon-enlarge');
            $('.requestfullscreen').children('span').addClass('icon-shrink');
            // $('.maxmize_full').removeClass('requestfullscreen');
            // $('.maxmize_full').addClass('exitfullscreen');
        } else {
            $('#fullscreen .requestfullscreen').show();
            $('#fullscreen .exitfullscreen').hide();
            $("body").removeClass('fullscrn');
            $('body').removeClass('screen_full');
            $('.requestfullscreen').children('span').addClass('icon-enlarge');
            $('.requestfullscreen').children('span').removeClass('icon-shrink');
            // $('.maxmize_full').addClass('requestfullscreen');
            // $('.maxmize_full').removeClass('exitfullscreen');
            $('.requestfullscreen').show();
        }

        $('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
    });
});


//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$(".next").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //activate next step on progressbar using the index of next_fs
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate({
        opacity: 0
    }, {
            step: function (now, mx) {
                //as the opacity of current_fs reduces to 0 - stored in "now"
                //1. scale current_fs down to 80%
                scale = 1 - (1 - now) * 0.2;
                //2. bring next_fs from the right(50%)
                left = (now * 50) + "%";
                //3. increase opacity of next_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({
                    'transform': 'scale(' + scale + ')',
                    'position': 'absolute'
                });
                next_fs.css({
                    'left': left,
                    'opacity': opacity
                });
            },
            duration: 800,
            complete: function () {
                current_fs.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
});

$(".previous").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //de-activate current step on progressbar
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

    //show the previous fieldset
    previous_fs.show();
    //hide the current fieldset with style
    current_fs.animate({
        opacity: 0
    }, {
            step: function (now, mx) {
                //as the opacity of current_fs reduces to 0 - stored in "now"
                //1. scale previous_fs from 80% to 100%
                scale = 0.8 + (1 - now) * 0.2;
                //2. take current_fs to the right(50%) - from 0%
                left = ((1 - now) * 50) + "%";
                //3. increase opacity of previous_fs to 1 as it moves in
                opacity = 1 - now;
                current_fs.css({
                    'left': left
                });
                previous_fs.css({
                    'transform': 'scale(' + scale + ')',
                    'opacity': opacity
                });
            },
            duration: 800,
            complete: function () {
                current_fs.hide();
                animating = false;
            },
            //this comes from the custom easing plugin
            easing: 'easeInOutBack'
        });
});


function bodyhightfun() {
    // var win_height = $(window).height();
    // var header_height = $('.custom_header').height();
    // var footer_height = $('footer.footer').height();
    // var totl_height = (win_height - (header_height + footer_height));
    // $('main').css('min-height', totl_height);
    // $('.nodata').css('min-height', totl_height - 40);
}

$(document).ready(function () {

    $(".add_dashboard").click(function () {
        $('body').addClass('add_dashboard_open');
        $('body').removeClass('outer_add_dashboard_open');
    });

    $('.add_dashboard_main_close').click(function () {
        $('body').removeClass('add_dashboard_open');
        $('body').removeClass('outer_add_dashboard_open');
        $('body').removeClass('edit_widget');
        $('body').removeClass("addwidget_open");
        $('body').removeClass("config_widget");
        $('#tablecellsselection tr td').removeClass("tcs-selected");
    });

    $(".add_dashboard_outer").click(function () {
        $('body').addClass('outer_add_dashboard_open');
    });

    $(".addwidget").click(function () {
        $("body").addClass("addwidget_open");
        $('#output').val("");
    });

    $(".hd_edit_click").click(function () {
        // $(this).parent(".hd-defalut").children().hide();
        // $(".hd_edit").children().fadeIn();
        $('body').addClass('grid_Editmode');
    });

    $(".hd_cancel").click(function () {
        // $(this).parent(".hd_edit").children().hide();
        // $(".hd-defalut").children().fadeIn();
        $('body').removeClass('grid_Editmode');
    }); 

    $(function () {
        $(".close, .login_btn").on('click', function () {
            $("body").removeClass("off_popup");
            $("body").removeClass("full_popup");
            $(".popup_offshadow").removeClass("active");
            $('body').removeClass('login');
        });
    });

    $('.dropdown').on('show.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).slideDown(200);
    });

    $('.dropdown').on('hide.bs.dropdown', function (e) {
        $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
    });

    $('.add_data_source_pls').click(function () {
        $('.add_data_source_main').addClass('active');
    });

    $(".wid_type_list ul li").removeClass('checked');
    $(".wid_type_list ul li input").change(function () {
        if ($(this).is(':checked')) {
            $(".wid_type_list ul li").removeClass('checked');
            $(this).parents('li').addClass('checked');
        }
    });

    var video_class = $(".video_height");
    video_class.each(function () {
        var height_chck = $(this).parent().height();
        $(this).height(height_chck);
    });

    $('.custom_h3_input').hide();
    $('.custom_h3_save').hide();
    $('.custom_h3_cancel').hide();

    $('.custom_h3_edit').click(function () {
        $(this).hide();
        $('.custom_h3_main').hide();
        $('.custom_h3_input').fadeIn();
        $('.custom_h3_save').fadeIn();
        $('.custom_h3_input').select();
        $('.custom_h3_cancel').fadeIn();
    });

    $('.custom_h3_save, .custom_h3_cancel').click(function () {
        $('.custom_h3_save').hide();
        $('.custom_h3_main').fadeIn();
        $('.custom_h3_input').hide();
        $('.custom_h3_edit').fadeIn();
        $('.custom_h3_cancel').hide();
    });

    $('.custom_h3_input').keypress(function (event) {
        if (event.keyCode == '13') {
            if ($.trim(this.value) == '') {
                this.value = (this.defaultValue ? this.defaultValue : '');
            } else {
                $(this).prev().html(this.value);
            }
            $(this).hide();
            $('.custom_h3_main').fadeIn();
            $('.custom_h3_input').hide();
            $('.custom_h3_save').hide();
            $('.custom_h3_edit').fadeIn();
        }
    });

    $('.add_data_source_calcel').click(function () {
        $('.add_data_source_main').removeClass('active');
    });

    /* $(".my-dash_hover").hover(function(){
        $('body').addClass('overflow');
        // $(this).children('.my-dash_sub').slideDown();
        }, function(){
        $('body').removeClass('overflow');
        // $(this).children('.my-dash_sub').slideUp();
       
    }); */

    $('.menu-bar').hide();
    $(deskMedia);
    $(resMedia);

    $('.hamburger-icon').click(function () {
        $(this).toggleClass('active');
        $('.menu-bar').slideToggle();
        if ($(this).hasClass("active")) {
            $("main").css('margin-top', '87px');
        } else {
            $("main").css('margin-top', '50px');
        }
        return false;
    });

    $("body").change(function () {
        $(deskMedia);
    });

    $('.scroll_addwidget').click(function () {
        $('.scroll_widget_main').toggleClass('open');
    });

    $('[data-toggle="tooltip"]').tooltip();

});

$(window).resize(function () {
    $(deskMedia);
    $(resMedia);
});

$(document).on('keyup', function (evt) {
    if (evt.keyCode == 27) {

    }
});


$(document).on("click", ".add_data_source_pls", function () {
    $('.add_data_source_main').addClass('active');
});

$(document).on("click", ".edit_widget_click", function () {
    $('body').addClass('edit_widget');
});

$(document).on("click", ".config_widget_click", function () {
    $('body').addClass('config_widget');
});

$(document).on("click", ".data_source_cls", function () {
    $('#msform fieldset').removeAttr("style");
});

function noscroll() {
    window.scrollTo(0, 0);
}

$(document).on("click", ".max_click", function () {
    $(this).hide();
    $('.max_close').show();
    $('.grid_master ul li').addClass('hide_all');
    $(this).closest('li').removeClass('hide_all');
    $('li').removeClass('panel-fullscreen');
    $(this).closest('li').addClass('panel-fullscreen');
    // add listener to disable scroll
    window.addEventListener('scroll', noscroll);
});

$(document).on("click", ".max_close", function () {
    $('.max_close').hide();
    $('.max_click').show();
    $('.grid_master ul li').removeClass('hide_all');
    $('li').removeClass('panel-fullscreen');
    // add listener to disable scroll
    window.removeEventListener('scroll', noscroll);
});

$(document).on("click", "ul.tabs li", function () {
    var tab_id = $(this).attr('data-tab');
    $('ul.tabs li').removeClass('current');
    $('.tab-content').removeClass('current');
    $(this).addClass('current');
    $("#" + tab_id).addClass('current');
});

var nav = $('.custom_header');
var scrolled = false;

$(window).scroll(function () {
    if (40 < $(window).scrollTop() && !scrolled) {
        // $(nav).addClass("sticky");
        // $('main').css('margin-top','87px');
        $('.scroll_addwidget').css('right', '0px');
        scrolled = true;
        if ($("body").hasClass("grid_Editmode")) {
            $('.scroll_widget_main').addClass('open');
        }
    }
    if (40 > $(window).scrollTop() && scrolled) {
        // $(nav).removeClass("sticky");
        // $('main').css('margin-top','0px');
        $('.scroll_addwidget').css('right', '-90px');
        $('.scroll_widget_main').removeClass('open');
        scrolled = false;
    }
});

jQuery(document).ready(function ($) {
    $('#tablecellsselection').tableCellsSelection();
    $('#tablecellsselection tr td').click(function () {
        $('#tablecellsselection tr td').removeClass('tcs-selected');
        var tab_clival = $(this).text();
        var tempString = tab_clival.split(",");
        $('#output').val(tempString[0] + "x" + tempString[1]);
        $(this).addClass('tcs-selected');

        selectedCellsSTyle(tempString);

        function selectedCellsSTyle(tempString) {
            for (var i = 1; i <= parseInt(tempString[0]); i++) {
                for (var j = 1; j <= parseInt(tempString[1]); j++) {
                    var selectSting = "select" + i + j;
                    $('#' + selectSting).addClass('tcs-selected');
                }
            }
        }
    });
});





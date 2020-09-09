$(function () {

    $('#MetricaHospital ul li a').removeClass('active');
    $("ul").find("a[href='/app/chat']").closest("li").removeClass().addClass('active');
    $("ul").find("a[href='/app/chat']").closest("li").closest("ul").removeClass().addClass('nav-second-level mm-collapse mm-show in');
    $("ul").find("a[href='/app/chat']").closest("li").closest("ul").closest("li").removeClass().addClass('nav-item mm-active active');
    $("ul").find("a[href='/app/chat']").closest("li").closest("ul").closest("li").closest("ul").removeClass().addClass('nav metismenu mm-show');
    $("ul").find("a[href='/app/chat']").closest("li").closest("ul").closest("li").closest("ul").closest("div").removeClass().addClass('main-icon-menu-pane mm-active active');
    $("ul").find("a[href='/app/chat']").removeClass().addClass('active');

});
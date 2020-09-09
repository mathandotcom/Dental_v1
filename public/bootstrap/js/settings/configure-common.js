$(function () {
    $('[data-toggle="popover"]').popover();
    $('.popover.title').css("background-color", "#9FC53B");
    $('.popover').css("background-color", "red");

    var divImagePath = $('#divImagePath');
    var divClinic = $('#divClinic');
    var divReminder = $('#divReminder');
    $('.card-header').text('Set image path of Opendental');
    
    $('#state1').keydown(function(e) {
        e.preventDefault();
      });

    $('.navbar-toggle').click(function () {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
        $('#search').removeClass('in').addClass('collapse').slideUp(200);

        /// uncomment code for absolute positioning tweek see top comment in css
        //$('.absolute-wrapper').toggleClass('slide-in');
        
    });
   
   // Remove menu for searching
   $('#search-trigger').click(function () {
        $('.navbar-nav').removeClass('slide-in');
        $('.side-body').removeClass('body-slide-in');

        /// uncomment code for absolute positioning tweek see top comment in css
        //$('.absolute-wrapper').removeClass('slide-in');

    });

    $('#showImagePath').on('click', function (e) {
        e.preventDefault();
        $(this).parent().find('li').removeClass("active");
        $(this).addClass('active');
        $('.card-header').text('Set image path of Opendental');
        $(divImagePath).css('display', 'block');
        $(divClinic).css("display", "none");
        $(divReminder).css("display", "none");
        $('.card').removeClass().addClass('card innerwhgt')
    });

    $('#ShowClinic').on('click', function(e){
        e.preventDefault();
        $(this).parent().find('li').removeClass("active");
        $(this).addClass('active');        
        $('.card-header').text('Set Clinic');
        $(divImagePath).css('display', 'none');
        $(divClinic).css("display", "block");
        $(divReminder).css("display", "none");

        $('.card').removeClass().addClass('card innerwhgt-clinic')
    });

    $('#showReminder').on('click', function(e){
        e.preventDefault();
        $('.card-header').text('Set Reminder');
        $(this).parent().find('li').removeClass("active");
        $(this).addClass('active');        
        $(divImagePath).css('display', 'none');
        $(divClinic).css("display", "none");
        $(divReminder).css("display", "block");
        $('.card').removeClass().addClass('card innerwhgt')
    });


});    
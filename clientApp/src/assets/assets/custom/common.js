//Global variables
var TREATMENTPLANFILENAME = "_tp.png";
var CONSENTFORMFILENAME   = "_cf.png";
var TREATMENTPLAN   = "treatmentplan";
var CONSENTFORM     = "consentform";

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function saveAsPng(canvas, filename) {
    var dataUrl = canvas.toDataURL();
    if(window.navigator.msSaveBlob){
        window.navigator.msSaveBlob(canvas.msToBlob(),filename);
    }
    else{
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            link.href = dataUrl;
            link.download = filename;

            //Firefox requires the link to be in the body
            document.body.appendChild(link);

            //simulate click
            link.click();

            //remove the link when done
            document.body.removeChild(link);
        } else {
            window.open(dataUrl);
        }
    }
}

function getToken(key) {
    var currentUser = JSON.parse(sessionStorage.getItem(key));
    if (currentUser !== null) {
      var token = currentUser.token; // your token
      return token;
    } else {
      return null;
    }
  }
  
$(function () {
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
    $("[data-toggle-pop='popover']").popover();
    
    $('#btnClose').click(function(e){
        window.close();
    });
   
    $(document).on('click', function (e) {
        var
            $popover,
            $target = $(e.target);
    
        //do nothing if there was a click on popover content
        if ($target.hasClass('popover') || $target.closest('.popover').length) {
            return;
        }
    
        $('[data-toggle="popover"]').each(function () {
            $popover = $(this);
    
            if (!$popover.is(e.target) &&
                $popover.has(e.target).length === 0 &&
                $('.popover').has(e.target).length === 0)
            {
                $popover.popover('hide');
            } else {
                //fixes issue described above
                $popover.popover('toggle');
            }
        });
    })
});
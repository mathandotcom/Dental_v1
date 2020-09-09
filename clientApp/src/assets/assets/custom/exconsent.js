$(function () {
    var element = $("#patientConsentForm"); // global variable

    $('#consentModal').modal({
        keyboard: true,
        show: false,
        backdrop: 'static'
    });
    $("#consentModal").on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var imagePath = button.data('path'); // Extract info from data-* attributes
        var modal = $(this);
        modal.find('.modal-body img').attr("src", imagePath);
    });


    $("#modalImage").click(function(){
        var imagePath = $(this).data('path');
        console.log(imagePath);
    });
    $('#MetricaHospital ul li a').removeClass('active');
    $("ul").find("a[href='/app/consent']").closest("li").removeClass().addClass('active');
    $("ul").find("a[href='/app/consent']").closest("li").closest("ul").removeClass().addClass('nav-second-level mm-collapse mm-show in');
    $("ul").find("a[href='/app/consent']").closest("li").closest("ul").closest("li").removeClass().addClass('nav-item mm-active active');
    $("ul").find("a[href='/app/consent']").closest("li").closest("ul").closest("li").closest("ul").removeClass().addClass('nav metismenu mm-show');
    $("ul").find("a[href='/app/consent']").closest("li").closest("ul").closest("li").closest("ul").closest("div").removeClass().addClass('main-icon-menu-pane mm-active active');
    $("ul").find("a[href='/app/consent']").removeClass().addClass('active');

});

var confirmSignature = function()
{
    $('#alertWindow').hide();
    var message = '';
    var hasError = false;

    if (signaturePad.isEmpty()) {
        hasError = true;
        message = "Please sign on the signature box to consent";
    }

    if(hasError)
    {
        var alertType = "alert alert-danger";
        var messageStatus = "Oops! ";
        $('#alertWindow').show();
        $('#errorMessage').html(`<b> ${messageStatus}</b>, ${message}`);
        $('#alertType').removeClass().addClass('alert alert-danger');
        $('.modal-body').animate({ scrollTop: $('#patientConsentForm').height() }, 'slow');
        return false;
    }

    return true;
}

var saveAsImage = async function()
{
    $('#alertWindow').hide();
    var CanvasDataUrl;
    if(!confirmSignature()) {
        return false;
    }

    try {
        $('#btnDownload').attr("disabled", "disabled").html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
        var patientId = $('#patientId').val();
        var consenttype = $('#consenttype').val();
        var userName = $('#username').val();
        var loggedUserId = $('#loggedUserId').val();
        var loggedUserClinicId = $('#loggedUserClinicId').val();
        //var element = document.querySelector("#patientFinanceOption");
        var element = document.querySelector("#patientConsentForm");
        var dataURL = null;

        await html2canvas(element, {
            scale: 1,
            allowTaint: true,
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            CanvasDataUrl = canvas.toDataURL('image/png');
        });
    }
    catch (err) {
        $('#alertWindow').show();
        $('#errorMessage').html(`<b> Oops</b>, ${err}`);
        $('#btnDownload').removeAttr("disabled").html('Submit');
        return false;
    }
    postImageData(consenttype, patientId, userName, loggedUserId, loggedUserClinicId, CanvasDataUrl);
    return false;
};


var postImageData = function(consenttype, patientId, userName, loggedUserId, loggedUserClinicId, canvasDataUrl){
    var url = apiEndpoint + '/api/v1/patient/saveasimage';
    var consentType = '';
    $('#patientFinanceOptionConfirmed').hide();
    var token = getToken('currentUser');
    var dataobj = {
        userName: userName,
        imgBase64:canvasDataUrl,
        businessid:consenttype,
        bType:CONSENTFORM,
        patientId:patientId,
        loggedUserId: loggedUserId,
        consentType: consenttype,
        clinicId: loggedUserClinicId
    };

    $.ajax({  
        type: 'PUT',  
        url: url,  
        contentType: "application/json; charset=utf-8",  
        dataType: 'json',  
        headers:{
            Authorization: 'Bearer ' + token
        },
        data: JSON.stringify(dataobj),
        success: function( response, textStatus, jqXhr ){  
            console.log(response.status);
            if (response != null) {  
                if(response.status === 'true'){
                    console.log(response.message);
                    //$('#responseStatus').removeClass().addClass('row h-100 py-3 align-items-center justify-content-center alert alert-success');
                    $('#responseMessage').html(`<b>Success</b>, ${response.message}`);
                    $('#patientConsentForm').hide();
                    $('#patientConsentFormStatic').show();
                    $('#btnDownload, #clear').attr("disabled", "disabled").css('display', 'none');
                    $('#btnDownload, #clear').addClass('disabled');
                    $('#btnDownload').removeAttr("disabled").html('Submit').removeClass('spinner-border text-blue');
                    Swal.fire(
                        'Success!',
                        response.message,
                        'success'
                      ).then((result) => {
                        if (result.value) {
                            //$('.modal').removeClass('show');
                            //$('.modal').modal('hide');
                            window.angularComponentReference.zone.run(() =>  {window.angularComponentReference.refreshContent(patientId, consenttype);});
                        }
                      });
                }
                else{
                    $('#btnDownload').removeAttr("disabled").html('Submit');
                    $('#responseMessage').html(`<b> Oops</b>, ${response.message}`);
                    //$('#alertType').removeClass().addClass('alert alert-danger');
                    Swal.fire(
                        'Oops!',
                        response.message,
                        'error'
                      )
                }
            }  
        },  
        error: function(jqXhr, textStatus, errorThrown) {  
            $('#btnDownload').removeAttr("disabled").html('Submit');
            $('#patientConsentForm').show();
            $('#patientConsentFormStatic').hide();
            $('#alertWindow').show();   
            if(jqXhr.responseJSON.message.indexOf('expired') >= 0){
                $('#errorMessage').html(`<b>Oops</b>, Token has expired, Please log in back and try again later`);
            }
            else{
                $('#errorMessage').html(`<b> Oops</b>, ${jqXhr.responseJSON.message}`);
            }
        }
    });

}
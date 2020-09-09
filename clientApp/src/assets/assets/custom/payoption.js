
    $('#chkMonthlyPay').click(function () {
        if ($(this).is(":checked")) {
            //$("#myTable").find("tr:gt(0)").remove();
            $("#tpo").children('tbody').children("tr:eq(1)").show();
        }
        else {
            $("#tpo").children('tbody').children("tr:eq(1)").hide();
            $("#tpo").children('tbody').children('tr:first').show();
        }
    });

    $("input[name='rdoPaymentMode']").click(function (event) {
        var payMode = $("input[name='rdoPaymentMode']:checked").val();
        console.log('pay mode:', payMode);
        if (payMode === 'full') {
            $('#rdoMonthlyPay6').prop('checked', false);
            $('#rdoMonthlyPay12').prop('checked', false);
            $('#rdoMonthlyPay18').prop('checked', false);
        }
        else if (payMode === 'month') {
            $('#rdoMonthlyPay6').prop('checked', true);
        }

    });

    $("input[name='rdoPayType']").click(function (event) {
        var radioValue = $("input[name='rdoPayType']:checked").val();
        console.log('rdoPayType', radioValue);
        $('#rdoMonthly').prop('checked', true);

    });

    $("input[type='radio1']").click(function () {
        var radioValue = $("input[name='rdoPayType']:checked").val();
        if (radioValue) {
            console.log("Your are a - " + radioValue);
        }
    });

function monthlyPayment(){
    console.log('monthlypayment()');
    if ($('#chkMonthlyPay').is(":checked")) {
        //$("#myTable").find("tr:gt(0)").remove();
        $("#tpo").children('tbody').children("tr:gt(0)").show();
    }
    else {
        $("#tpo").children('tbody').children("tr:gt(0)").hide();
        $("#tpo").children('tbody').children('tr:first').show();
        $('input[name="rdoPaymentMode"]:eq(0)').prop('checked', true);
    }    
}    

function paymentMode(){
    var payMode = $("input[name='rdoPaymentMode']:checked").val();
    console.log('pay mode:', payMode);
    if (payMode === 'full') {
        $('#rdoMonthlyPay6').prop('checked', false);
        $('#rdoMonthlyPay12').prop('checked', false);
        $('#rdoMonthlyPay18').prop('checked', false);
    }
    else if (payMode === 'month') {
        $('#rdoMonthlyPay6').prop('checked', true);
    }
}

function paymentType(){
    var radioValue = $("input[name='rdoPayType']:checked").val();
    console.log('rdoPayType', radioValue);
    $('#rdoMonthly').prop('checked', true);    
}


var confirmSignature = function()
{
    $('#alertWindow').hide();
    var message = '';
    var hasError = false;

    if (signaturePad.isEmpty()) {
        hasError = true;
        message = "Please sign on the signature box to consent";
    }
    if($('#chkAgreePayment').is(":not(:checked)")){ //$(this).is(":checked")
        hasError = true;
        message = "Please check the payment agreement option";
    }

    if(hasError)
    {
        var alertType = "alert alert-danger";
        var messageStatus = "Oops! ";
        $('#alertWindow').show();   
        $('#errorMessage').html(`<b> ${messageStatus}</b>, ${message}`);
        $('#alertType').removeClass().addClass('alert alert-danger');
        $('.modal-body').animate({ scrollTop: $('#patientFinanceOption').height() }, 'slow');
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


    var patientId = $('#patientId').val();
    var treatmentPlanId = $('#treatmentPlanId').val();
    var userName = $('#username').val();
    var loggedUserId = $('#loggedUserId').val();
    var loggedUserClinicId = $('#loggedUserClinicId').val();
    //var element = document.querySelector("#patientFinanceOption");
    var element = document.querySelector("#patientFinanceOption");
    var dataURL=null;
    
    await html2canvas(element, {
        scale:1,
        allowTaint:true,
        backgroundColor:null,
        useCORS: true
        }).then(canvas => {
        CanvasDataUrl = canvas.toDataURL('image/png');
    }); 

    postImageData(treatmentPlanId, patientId, userName, loggedUserId, loggedUserClinicId, CanvasDataUrl);
    return false;
};

var postImageData = function(treatmentPlanId, patientId, userName, loggedUserId, loggedUserClinicId, canvasDataUrl){
    var url = apiEndpoint + '/api/v1/patient/saveasimage';
    var consentType = '';
    $('#patientFinanceOptionConfirmed').hide();
    var token = getToken('currentUser');
    var dataobj = {
        userName: userName,
        imgBase64:canvasDataUrl,
        businessid:treatmentPlanId,
        bType:TREATMENTPLAN,
        patientId:patientId,
        loggedUserId: loggedUserId,
        consentType: consentType,
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
                    $('#patientFinanceOption').hide();
                    $('#patientFinanceOptionStatic').show();
                    $('#btnDownload, #clear').attr("disabled", "disabled").css('display', 'none');
                    $('#btnDownload, #clear').addClass('disabled');
                    Swal.fire(
                        'Success!',
                        response.message,
                        'success'
                        ).then((result) => {
                            if (result.value) {
                                //$('.modal').removeClass('show');
                                //$('.modal').modal('hide');
                                window.angularComponentReference.zone.run(() =>  {window.angularComponentReference.closeModalFn();});
                            }
                          });
                    }
                else{
                    $('#responseMessage').html(`<b>Oops</b>, ${response.message}`);
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
            $('#patientFinanceOption').show();
            $('#patientFinanceOptionStatic').hide();
            $('#alertWindow').show();   
            $('#errorMessage').html(`<b>Oops</b>, ${response.message}`);
            $('.modal-body').animate({ scrollTop: $('#patientFinanceOption').height() }, 'slow');

        }
    });

}

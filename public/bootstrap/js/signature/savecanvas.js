$(document).ready(function() {
    var element = $("#patientConsentForm"); // global variable

    $("#btnDownload1").click(function () {
        html2canvas(element, {
            onrendered: function (canvas) {
                theCanvas = canvas;
                var pName = $('#pName').val();
                saveAs(canvas.toDataURL(), pName + '.png');
            }
        });
    });

    function saveAs(uri, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            link.href = uri;
            link.download = filename;

            //Firefox requires the link to be in the body
            document.body.appendChild(link);

            //simulate click
            link.click();

            //remove the link when done
            document.body.removeChild(link);
        } else {
            window.open(uri);
        }
    }


    $("#rdoPayfull").click(function(event) {
        if ($(this).is(":checked")){
            $('#rdoMonthlyPay6').prop('checked', false);
            $('#rdoMonthlyPay12').prop('checked', false);
            $('#rdoMonthlyPay18').prop('checked', false);
        }
    });

    $("[data-dismiss]").on("click", function(){
        $("." + $(this).attr("data-dismiss")).hide();
    });

    $('.close').click(function(){
        $(this).parent().hide();
    });


});
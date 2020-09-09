
var mainController = function ($scope, $http, $window, $location) {
    $scope.message = '';
    $scope.errorMessage = '';
    $scope.alertType = "";
    $scope.messageStatus = "Failed";
    $scope.cust = {};
    $scope.cust.SearchText = '';
    $scope.PatientId = "";
    $scope.FullName = "";
    $scope.currentDate = new Date();
    $scope.TreatmentPlanDetails = [];
    $scope.UserName = "";
    $scope.TreatmentPlanId = "";

    $scope.TotalFees = 0;
    $scope.InsuranceDiscount = 0;
    $scope.PrimaryInsurance = 0;
    $scope.SecondayInsurance = 0;
    $scope.InsurancePayment = 0;
    $scope.PatientCost = 0;
    $scope.baseUrl = "";
    $scope.CanvasDataUrl = "";
    
    $scope.showFinanceOption = function (id) {
        $scope.PatientId = id;
        $scope.resetValues();
        var dataObj = { id: id };
        var url = $scope.baseUrl + '/api/patient/ls-treamentplan/' + id;
        $http.get(url, {
            headers:{
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
         })
            .then(function (response) {
                console.log("status:" + response.status);
                if (response.data != null) {
                    $('#patientFinanceOptionConfirmed').hide();
                    $('#patientFinanceOption').show();
                    $scope.TreatmentPlanDetails = response.data.data;
                    $scope.FullName = response.data.data[0].fName + " " + response.data.data[0].lName;
                    $scope.UserName = response.data.data[0].lName + response.data.data[0].fName;
                    $scope.TreatmentPlanId = response.data.data[0].treatPlanNum;
                    angular.forEach(response.data.data, function (plan) {
                        $scope.TotalFees += plan.procFee;
                        $scope.PrimaryInsurance += plan.insPayEst;
                        $scope.SecondayInsurance += 0;
                        $scope.InsurancePayment += plan.insPayAmt;
                        $scope.PatientCost += plan.patientEst;
                    });
                    if(response.data.payoption != null){
                        $scope.alertType = "alert alert-warning";
                        $scope.message = "Payment option has been already setup for this treatment plan";
                        $('#btnDownload, #clear').attr("disabled", "disabled");
                        $('#btnDownload, #clear').addClass('disabled');
                        $('#btnDownload, #clear').hide();
                        $('#patientFinanceOptionConfirmed').show();
                        $('#patientFinanceOption').hide();
                        $('#imgPaymentOption').attr('src', response.data.payoption.filePath);
                        return;
                    }

                }
                $scope.totalItems = $scope.TreatmentPlanDetails.length;
            }).catch(function (response) {
                $('#patientFinanceOption').hide();
                $('#btnDownload').hide();
                if(response !=null && response.data !=null && response.data.error ==="jwt malformed"){
                    $scope.errorMessage = "Unable to get treatment plan because of invalid security token";
                }
                else{
                    $scope.errorMessage = response.data.message;
                }

                console.log('Error occurred:', response.status, response.data);
            }).finally(function () {
                console.log("Task Finished.");
            });
    };

    $scope.postImageData = function(treatmentPlanId, patientId, userName){
        var url = $scope.baseUrl + '/api/patient/ls-saveasimage';
        $('#patientFinanceOptionConfirmed').hide();
        data = {
            userName: userName, // + TREATMENTPLANFILENAME,
            imgBase64:$scope.CanvasDataUrl,
            businessid:treatmentPlanId,
            bType:TREATMENTPLAN,
            patientId:patientId
        };
        $http.put(url, data)
        .then(function successCallback(response){
            $scope.alertType = "";
            console.log('response: '+ response.data.message);
            $scope.message = response.data.message;
            $('#patientFinanceOption').hide();
            $('#patientFinanceOptionStatic').show();
            $('#btnDownload, #clear').attr("disabled", "disabled");
            $('#btnDownload, #clear').addClass('disabled');
            //$('#updateStatus').html('Success');
        }, function errorCallback(response){
            $('#patientFinanceOption').show();
            $('#patientFinanceOptionStatic').hide();
            $scope.alertType = "alert alert-danger";
            $scope.message = response.data !== null ? response.data.message : 'Oops something went wrong';
            console.log('error: '+ $scope.message);
        });

    };

    $scope.confirmSignature = function()
    {
        var hasError = false;

        if (signaturePad.isEmpty()) {
            hasError = true;
            $scope.message = "Please sign on the signature box to consent";
        }
        if(!$('#chkAgreePayment:checked')){
            hasError = true;
            $scope.message = "Please check the payment agreement option";
        }

        if(hasError)
        {
            $scope.alertType = "alert alert-danger";
            $scope.messageStatus = "Oops! ";
            $('#alertWindow').show();   
            return false;
        }

        return true;
    }

    $scope.saveAsImage = async function()
    {
        if(!$scope.confirmSignature()) {
            return false;
        }

        $scope.PatientId = $('#patientId').val();
        //var element = document.querySelector("#patientFinanceOption");
        var element = document.querySelector("#patientFinanceOption");
        var dataURL=null;
        //PatientId
        
        // html2canvas(element[0], {
        //     onrendered: function (canvas) {
        //         theCanvas = canvas;
        //         var pName = $('#pName').val();
        //         //saveAsPng(canvas, pName + '.png');
        //         //sendImageData(canvas);
        //         dataURL = canvas.toDataURL('image/png');
        //         document.getElementById('canvasImage').src = dataURL;
        //     }
        // });
        /*
        await html2canvas(element[0],{ logging: true, letterRendering: 1, allowTaint: false, useCORS: true,scale: .5  }) 
        .then(function(canvas){
            var pName = $('#pName').val();
            dataURL = canvas.toDataURL('image/png');
            document.getElementById('canvasImage').src = dataURL;
        });
        */
        await html2canvas(element, {
            scale:1,
            allowTaint:true,
            backgroundColor:null,
            useCORS: true
            }).then(canvas => {
            
            $scope.CanvasDataUrl = canvas.toDataURL('image/png');
            //document.getElementById('canvasimage').src = canvas.toDataURL('image/png');
            //saveAsPng(canvas, pName + '.png');
        
        }); 
        //$scope.postImageData($scope.TreatmentPlanId, $scope.PatientId, $scope.UserName);

    };

    $scope.downloadExcel = function (id) {
        console.log("Id: " + id);
    };

    $scope.resetValues = function () {
        $scope.TreatmentPlanDetails = [];
        $scope.TreatmentPlanId = "";
        $scope.FullName = "";
        $scope.PatientId = "";

        $scope.TotalFees = 0;
        $scope.PrimaryInsurance = 0;
        $scope.SecondayInsurance = 0;
        $scope.InsurancePayment = 0;
        $scope.PatientCost = 0;
    };

    $scope.selectPayment = function(optValue){
        console.log('optValue:', optValue)
        if ($('#rdoPayfull').is(":checked")){
            $("#monthlypayment1").show('slow');
            $('#rdoMonthlyPay6').prop('checked', false);
            $('#rdoMonthlyPay12').prop('checked', false);
            $('#rdoMonthlyPay18').prop('checked', false);
        }
        else if ($('#rdoMonthly').is(":checked")){
            $("#monthlypayment1").hide('slow');
            $('#rdoMonthlyPay6').prop('checked', true);
        }
    };

    var pId = $location.absUrl().split(/[\s/]+/).pop();
    //console.log($location.absUrl() + ' ' + pId);
    $scope.showFinanceOption(pId);
    

}
app.controller('mkmController', ['$scope', '$http', '$window', '$location', mainController]);

app.filter('startFrom', function () {
    return function (data, start) {
        return data.slice(start);
    }
});


var mainController = function ($scope, $http, $window, $location) {
    $scope.message = '';
    $scope.errorMessage = '';
    $scope.messageStatus = '';
    $scope.alertType = "";
        
    $scope.cust = {};
    $scope.cust.SearchText = '';
    $scope.PatientId = "";
    $scope.ConsentType = "";
    $scope.FullName = "";
    $scope.currentDate = new Date();
    $scope.baseUrl = "";
    
    $scope.showPatientInfo = function (id) {
        $scope.resetValues();
        $scope.PatientId = id;
        var dataObj = { id: id };
        var url = $scope.baseUrl + `/api/patient/ls-patientinfo/${id}`;
        $http.get(url, {
            headers:{
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
         })
        .then(function (response) {
            console.log("status:" + response.status);
            if (response.data != null) {
                $scope.TreatmentPlanDetails = response.data.data;
                $scope.FullName = response.data.data[0].firstName + " " + response.data.data[0].lastName;
                $scope.UserName = response.data.data[0].lastName + response.data.data[0].firstName;
            }
            $scope.totalItems = $scope.TreatmentPlanDetails.length;
        })
        .catch(function (response) {
            $scope.alertType = "alert alert-danger";
            //$('#patientFinanceOption').hide();
            $('#btnDownload').hide();
            $scope.messageStatus = "Failed";
            if(response !=null && response.data !=null){
                $scope.message = response.data.message;
            }
            else{
                $scope.message = "Unable to get patient details";
            }

            console.log('Error occurred:', response.status, response.data);
        }).finally(function () {
            console.log("Task Finished.");
        });
    };


    $scope.downloadExcel = function (id) {
        console.log("Id: " + id);
    };

    $scope.resetValues = function () {
        $scope.TreatmentPlanDetails = [];
        $scope.FullName = "";
        $scope.UserName = "";
        $scope.PatientId = "";

        $scope.TotalFees = 0;
        $scope.PrimaryInsurance = 0;
        $scope.SecondayInsurance = 0;
        $scope.InsurancePayment = 0;
        $scope.PatientCost = 0;
    };

    $scope.postImageData = function(treatmentPlanId, ct, userName){
        var url = $scope.baseUrl + '/api/patient/ls-saveasimage';
        data = {
            userName: userName,// + CONSENTFORMFILENAME,
            imgBase64:$scope.CanvasDataUrl,
            businessid:treatmentPlanId,
            bType:CONSENTFORM,
            patientId:treatmentPlanId,
            consentType:ct
        };
        $http.put(url, data)
        .then(function successCallback(response){
            $scope.alertType = "";
            console.log('response: '+ response.data.message);
            $scope.message = response.data.message;
            $('#patientConsentForm').hide();
            $('#patientConsentFormStatic').show();

            $('#btnDownload, #clear').attr("disabled", "disabled");
            $('#btnDownload, #clear').addClass('disabled');
            $window.history.forward();
            //$('#updateStatus').html('Success');
        }, function errorCallback(response){
            $('#patientConsentForm').show();
            $('#patientConsentFormStatic').hide();
            $scope.alertType = "alert alert-danger";
            $scope.message = response.data.message;
            $scope.messageStatus = "Failed";
            console.log('error: '+ response.data.message);
        });

    };



    $scope.confirmSignature = function()
    {
        if (signaturePad.isEmpty()) {
            $scope.alertType = "alert alert-danger";
            $scope.messageStatus = "Missing";
            $scope.message = "Please sign on the signature box to consent";
            $('#alertWindow').show();   
            return false;
            //return alert("Please provide a signature first.");
          }
          return true;
    }

    $scope.saveAsImage = async function()
    {
        if(!$scope.confirmSignature()) {
            return false;
        }

        var id = $('#patientId').val();
        var ct = $('#consenttype').val();
        var element = document.querySelector("#patientConsentForm");
        var dataURL=null;
        //PatientId
        

        await html2canvas(element, {
            scale:1,
            allowTaint:true,
            backgroundColor:null,
            useCORS: true
            }).then(canvas => {
            
            $scope.CanvasDataUrl = canvas.toDataURL('image/png');
       
        }); 
        $scope.postImageData($scope.PatientId, ct, $scope.UserName);

    };   

    $scope.getConsents = function(id, ct)
    {
        $scope.PatientId = id;
        var url = $scope.baseUrl + `/api/patient/ls-consents/${ct}/${id}`;
        try {
            $http.get(url, {
                headers:{
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            }).then(successCallback, errorCallback);
        } catch (error) {
            console.log(error.message);            
        }
    }

    var successCallback = function(response){
        console.log('successCallback');
        if(response !== null && response.data !== null && response.data.data.length >= 0){
            $scope.availableConsents = response.data.data;

        }
        else{
            $scope.openNewConsent();
        }
    };

    var errorCallback = function(response){
        console.log('errorCallback: ' + response.data.message);
        //console.log($(consenttype).val());
        $scope.openNewConsent();
    };
    
    $scope.openNewConsent = function()
    {
        $window.location.href = `../../consent/${$(consenttype).val()}/${$scope.PatientId}`;
    }

    //var pId = $location.absUrl().split(/[\s/]+/).pop();
    var uri = new URL($location.absUrl());
    var params = uri.pathname.match(/([^\/]*)\/([^\/]*)$/);
    var conType = params[1];
    var pId = params[2];
    //console.log($location.absUrl() + ' ' + conType + ' - ' + pId);
    $scope.showPatientInfo(pId);
    if($location.absUrl().indexOf('exconsent') >= 0){
        $scope.getConsents(pId, conType);
    }
    

}
app.controller('mkmController', ['$scope', '$http', '$window', '$location', mainController]);

app.filter('startFrom', function () {
    return function (data, start) {
        return data.slice(start);
    }
});

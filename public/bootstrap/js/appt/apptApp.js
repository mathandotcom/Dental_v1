

var mainController = function ($scope, $http, $window, dateService) {
    $scope.message = '';
    $scope.cust = {};
    $scope.cust.SearchText = '';
    $scope.cust.ApptDateText = dateService.getDate();

    $scope.pageSize = 5;
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.apptdetails = [];
    $scope.TreatmentPlanDetails = [];
    $scope.PatientId = "";
    $scope.FullName = "";

    $scope.TotalFees = 0;
    $scope.InsuranceDiscount = 0;
    $scope.PrimaryInsurance = 0;
    $scope.SecondayInsurance = 0;
    $scope.InsurancePayment = 0;
    $scope.PatientCost = 0;
    $scope.baseUrl = "";

    $scope.responseMessage = "";
    $scope.alertType = "alert alert-danger";

    $scope.allAppointmentDetail = function () {
        var url = $scope.baseUrl + "/api/appt/ls-appointment";
        $http.get(url, {
           headers:{
               Authorization: 'Bearer ' + localStorage.getItem('token')
           }
        })
        .then(function (response) {
            console.log("status:" + response.status);
            $scope.apptdetails = response.data.apptdetails;
            $scope.totalItems = $scope.apptdetails.length;
        }).catch(function (response) {
            $scope.alertType = "alert alert-danger";
            if(response !=null && response.data !=null && response.data.message ==="jwt malformed"){
                $scope.responseMessage = "Unable to get appointment details because of invalid security token";
            }
            if(response !=null && response.data !=null && response.data.message.indexOf("appointment detail") >= 0){
                $scope.responseMessage = response.data.message;
            }
            else{
                $scope.responseMessage = "Unable to get appointment details";
            }
            console.log('Error occurred:', response.status, response.data.message);
        }).finally(function () {
            console.log("Task Finished");
        });
    };

    $scope.ApptSearch = function()
    {
        console.log('Selected date: ' + $scope.cust.ApptDateText);
        $scope.apptdetails = [];
        $scope.responseMessage = "";
        var url = $scope.baseUrl + "/api/appt/ls-appointmentbydate";
        data = {
            apptdate:$scope.cust.ApptDateText
        };
        $http.post(url, data).then(successDetailsCallback, errorDetailsCallback);
    }

    var successDetailsCallback = function(response){
        console.log("status:" + response.status);
        $scope.apptdetails = response.data.apptdetails;
        $scope.totalItems = $scope.apptdetails.length;
    }

    var errorDetailsCallback = function(response){
        $scope.alertType = "alert alert-danger";
        if(response !=null && response.data !=null && response.data.message ==="jwt malformed"){
            $scope.responseMessage = "Unable to get appointment details because of invalid security token";
        }
        if(response !=null && response.data !=null && response.data.message.indexOf("appointment detail") >= 0){
            $scope.responseMessage = response.data.message;
        }
        else{
            $scope.responseMessage = "Unable to get appointment details";
        }
        console.log('Error occurred:', response.status, response.data.message);
    }

    $scope.Search = function (item) {
        if ($scope.cust.SearchText === "" || $scope.cust.SearchText == undefined) {
            return true;
        }
        else {
            if (item.lastName.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                item.firstName.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                item.WirelessPhone.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                item.AptStatusText.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                (item.IsSmsSent != null && item.IsSmsSent.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1) ||
                (item.DateTimeSent != null && item.DateTimeSent.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1) ||
                new Date(item.AptDateTime).getTime() === new Date($scope.cust.SearchText).getTime()) {
                return true;
            }
            return false;
        }
    };


    $scope.downloadExcel = function (id) {
        console.log("Id: " + id);
    };

    $scope.resetValues = function () {
        $scope.TreatmentPlanDetails = [];
        $scope.FullName = "";
        $scope.PatientId = "";

        $scope.TotalFees = 0;
        $scope.PrimaryInsurance = 0;
        $scope.SecondayInsurance = 0;
        $scope.InsurancePayment = 0;
        $scope.PatientCost = 0;
    };

    //SMS
    $scope.sendReminder = function(patient, type){
        if(type === 'fb' && (patient.Confirmed !== 21 && patient.AptConfirmedStatusValue !== 'Appointment Confirmed')){
            alert('Treatment is yet to be completed to send the feedback');
            return false;
        }
        var url = $scope.baseUrl + type == 'sms' ?  '/api/comm/ls-remindsmsaptnum' : '/api/comm/ls-sendfeedbackreminder';
        data = {
            apptdetail:patient,
            id:patient.id,
            apptNumber:patient.AptNum,
            phone:patient.WirelessPhone,
        };

        $http.post(url, data).then(successCallback, errorCallback);
    }
    var successCallback = function(response)
    {
        $scope.ApptSearch();
        if(response.data.status && response.data.status == "true"){
            $scope.responseMessage = response.data.message;
            $scope.alertType = "alert alert-success";
            console.log(response);
            $scope.resetControls();
        }
        else{
            $scope.alertType = "alert alert-danger";
            $scope.responseMessage = response.data.message;
            console.log(response);
            $scope.resetControls();
        }
    }
    var errorCallback = function(response)
    {
        $scope.alertType = "alert alert-danger";
        $scope.responseMessage = response.data.message;
        console.log(response);
    }

    $scope.resetControls = function()
    {

    }    

    $scope.navigatedate = function(t){

        $scope.cust.ApptDateText = dateService.navigatedate(t, $scope.cust.ApptDateText);
        $scope.ApptSearch();
    }

    $scope.reloadAppointment = function(){
        $scope.ApptSearch();
    };
    
    //$scope.allAppointmentDetail();
    $scope.ApptSearch();
    

}
app.controller('mkmController', ['$scope', '$http', '$window', 'DateService', mainController]);

app.filter('startFrom', function () {
    return function (data, start) {
        return data.slice(start);
    }
});
app.filter('doSearch', function () {
    return function (data, searchText) {
        var scope = angular.element(document.getElementById("MainWrap")).scope();
        if (searchText === "" || searchText == undefined) {
            scope.totalItems = data != null ? data.length : 0;
            return data;
        }
        var list = [];
        angular.forEach(data, function (v) {
            if (v.lastName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                v.firstName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                v.WirelessPhone.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                v.AptStatusText.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                v.IsSmsSent.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                v.DateTimeSent.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                new Date(v.AptDateTime).getTime() === new Date(searchText).getTime()) {
                list.push(v);
            }
        });
        scope.totalItems = list.length;
        return list;
    }
});

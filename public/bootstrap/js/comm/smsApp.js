var mainController = function ($scope, $http, $window, $location) {
    $scope.acct = {};
    $scope.acct.SMSMessage = "";
    $scope.acct.Phone = "";
    $scope.acct.Id = "";
    $scope.acct.CountryCode = "+1";
    $scope.alertType = "";
    $scope.responseMessage = "";
    $scope.baseUrl = "";

    $scope.sendSms = function(){
        var url = $scope.baseUrl + '/api/comm/ls-sendsms';
        data = {
            Message:$scope.acct.SMSMessage,
            PhoneNumber:$scope.acct.Phone,
            countryCode:$scope.acct.CountryCode
        };

        $http.post(url, data).then(successCallback, errorCallback);

    }

    $scope.sendReminder = function(id){
        console.log('calling...');
        return false;
        var url = $scope.baseUrl + '/api/comm/ls-remindsms';
        data = {
            Id:$scope.acct.id,
        };

        $http.post(url, data).then(successCallback, errorCallback);

    }

    var successCallback = function(response)
    {
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
        $scope.acct.SMSMessage = "";
        $scope.acct.Phone = "";
    }
}
app.controller('mkmController', ['$scope', '$http', '$window', '$location', mainController]);

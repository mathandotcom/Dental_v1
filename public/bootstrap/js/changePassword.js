var changePasswordController = function ($scope, $http, $location, $window) {
    $scope.acctpass = {};
    $scope.passMessage = 'wwww';
    $scope.passMessageStatus = 'wwww';
    $scope.result = "color-default";
    $scope.isViewLoading = false;

    $scope.acctpass.UserId = '';
    $scope.acctpass.UserEmail = ''; // Email
    $scope.acctpass.CurrentPassword = '';
    $scope.acctpass.NewPassword = '';
    $scope.acctpass.ConfirmPassword = '';
    $scope.acctpass.FirstName = '';
    $scope.acctpass.LName = '';
    $scope.acctpass.Gender = '';
    $scope.acctpass.DOB = '';
    $scope.acctpass.RoleId = '';

    $scope.updatePassword = function()
    {
        var url = "/api/auth/changePassword";
        var postData = {
			id:$scope.acctpass.UserId,
			useremail:$scope.acctpass.UserEmail,
			userpassword: $scope.acctpass.CurrentPassword,
			newpassword: $scope.acctpass.NewPassword,
			confirmpassword: $scope.acctpass.ConfirmPassword,
        };
        
        $http.post(url, postData)
        .then(function successCallback(response){
            $scope.passMessageStatus = "";
            $('#password_container').hide();
            $('#btnChangepassword').hide();
            $scope.passMessage = response.data.message;

        },function errorCallback(response){
            $scope.passMessageStatus = "alert alert-danger";
			if(response.status <= -1){
				$scope.passMessage = "Api server is not available";
				console.log($scope.passMessage);	
			}
			else if(response.status >= 400 ){
				$scope.passMessage = response.data.message; //response.statusText + ' - ' +
				console.log($scope.passMessage);	
			}
			else if(response.data !== null && response.data.data !== null && response.data.data.length >0){
				$scope.passMessage = response.data.data[0].msg;
				console.log($scope.passMessage);	
			}
        });
        

    }
}
app.controller('mkmController', ['$scope', '$http', '$location', '$window', changePasswordController]);
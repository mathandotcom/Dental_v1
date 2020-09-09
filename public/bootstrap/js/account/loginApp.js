
var mainController1 = function($scope) {
    $scope.name = "Mohan";
    $scope.message = "Success";
};

var loginService = function()
{
	this.login = function()
	{
		return "loginsample.html";
	};
	
	this.signup = function()
	{
		return "registration.html";
	};
	
	this.verify = function()
	{
		return "verifyuser.html";
	};
	
	this.registrationbasic = function()
	{
		return "registration_more.html";
	};

	this.registrationother = function()
	{
		return "registrationother.html";
	};
};
app.service('loginService',loginService);

var mainController = function ($scope, $http, $location, $window, loginService) {
	$scope.cust = {};
	$scope.cust.status = false;
	$scope.cust.message = '';
    $scope.message = '';
    $scope.result = "color-default";
    $scope.isViewLoading = false;
	$scope.cust.Email = '';
	$scope.cust.Password = '';
	$scope.cust.CountryCode = '1';
	$scope.cust.Otp = '';
	$scope.baseUrl = "";

	$scope.$watch('cust', function(newValue){
        if(newValue.Email === ''){
            console.log('Empty ' + newValue.Email);
        } else {
            console.log('Has content ' + newValue.Email);
        }
    });
	
	$scope.loginUser = function(){
		var url = $scope.baseUrl + "/api/auth/login";
		var postData = {
			useremail:$scope.cust.Email,
			userpassword: $scope.cust.Password
		};
		
		$http.post(url,postData)
		.then(function successCallback(response){
			$scope.messageStatus = "alert alert-success";
			if(response.data != null)
			{
				$scope.cust.status = response.data.status;
				$scope.cust.message = response.data.message;
				$scope.cust.user = response.data.user;

				if($scope.cust.status){
					$http.post('/api/auth/data', response.data.user)
					.then(
						function successCallback(authresponse){
							if(authresponse.data !=null && authresponse.data.status){
								console.log('Data posted successfully');
								localStorage.setItem('token',response.data.token);
								$scope.RedirectToURL('/');
							}
					},  function errorCallback(errorresponse){
						console.log(errorresponse.data);
					});
				}
			}
		}, function errorCallback(response){
			if(response.status <= -1){
				$scope.cust.message = "Api server is not available";
				console.log($scope.message);	
			}
			else if(response.data !== null){
				$scope.cust.message = response.data.message;
				console.log($scope.cust.message);	
			}
		});

		$scope.RedirectToURL = function(landingUrl) {
			var host = $window.location.host;
			$window.location.href = landingUrl;
		  };
	}
    
	$scope.signin = function(){
		window.location = loginService.login();
	};
	$scope.signup = function(){
		window.location = loginService.signup();
	};
	$scope.verify = function(){
		window.location = loginService.verify();
	};
	$scope.registrationbasic = function(){
		window.location = loginService.registrationbasic();
	};	
	$scope.registrationother = function(){
		window.location = loginService.registrationother();
	};	
};
var noDirtyCheck = function() {
    // Interacting with input elements having this directive won't cause the
    // form to be marked dirty.
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$pristine = false;
            ctrl.$dirty = true;
        }
    }
};
app.controller('mkmController', ['$scope', '$http', '$location', '$window','loginService', mainController]);
//app.directive('noDirtyCheck', noDirtyCheck);

app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
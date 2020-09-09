
var mainController1 = function($scope, $http) {
    $scope.name = "Mohan";
    $scope.message = "Success";
};

var loginService = function()
{

	
};
app.service('signupService',loginService);

var signupController = function ($scope, $http, $location, $window) {
    $scope.acct = {};
	$scope.message = '';
	$scope.messageStatus = '';
    $scope.result = "color-default";
    $scope.isViewLoading = false;
	
	$scope.acct.Id = '';
    $scope.acct.Email = '';
	$scope.acct.Password = '';
	$scope.acct.CurrentPassword = '';
	$scope.acct.NewPassword = '';
    $scope.acct.ConfirmPassword = '';
    $scope.acct.FirstName = '';
	$scope.acct.LName = '';
	$scope.acct.Gender = '';
	$scope.acct.DOB = '';
	$scope.acct.RoleId = '';
	
	$scope.acct.MaritalStatus = 'umd';
	$scope.acct.Qualification = '1';
	$scope.acct.College = '';
	$scope.acct.WorkingWith = '1';
	$scope.acct.WorkingAs = '1';
	$scope.acct.Income = '1';
	
	$scope.acct.Country = '1';
	$scope.acct.State = '1';
	$scope.acct.City = '1';
	$scope.acct.GenderType = '';
	$scope.baseUrl = "";

	$scope.registerUser = function(){
		var url = $scope.baseUrl + "/api/auth/signup";
		if($scope.acct.Id !='' && parseInt($scope.acct.Id) > 0)
		{
			url = $scope.baseUrl + "/api/auth/update";
		}
		var postData = {
			id:$scope.acct.Id,
			useremail:$scope.acct.Email,
			userpassword: $scope.acct.Password,
			firstname: $scope.acct.FirstName,
			lastname: $scope.acct.LastName,
			phone: $scope.acct.Phone,
			roleId: $scope.acct.RoleId ?  $scope.acct.RoleId : 0
		};
		
		$http.put(url,postData)
		.then(function successCallback(response){
			$scope.messageStatus = "";
			if(response.status === 201)
			{
				$('#form_container').hide();
				$('#success_container').show();
				$('#btnUpdate').hide();
				$scope.message = response.data.message;
			}
		}, function errorCallback(response){
			$scope.messageStatus = "alert alert-danger";
			if(response.status <= -1){
				$scope.message = "Api server is not available";
				console.log($scope.message);	
			}
			else if(response.data !== null && response.data.data !== null && response.data.data.length >0){
				$scope.message = response.data.data[0].msg;
				console.log($scope.message);	
			}
		});
	}

	$scope.updateUser = function(){
		var url = $scope.baseUrl + "/api/auth/update";
		var postData = {
			id:$scope.acct.Id,
			useremail:$scope.acct.Email,
			userpassword: $scope.acct.Password,
			firstname: $scope.acct.FirstName,
			lastname: $scope.acct.LastName,
			phone: $scope.acct.Phone,
			roleId: $scope.acct.RoleId ?  $scope.acct.RoleId : 0
		};
		
		$http.put(url,postData)
		.then(function successCallback(response){
			$scope.messageStatus = "";
			if(response.status === 201)
			{
				$('#form_container').hide();
				$('#success_container').show();
				$('#btnUpdate').hide();

				$('#firstName').html($scope.acct.FirstName);
				$('#lastName').html($scope.acct.LastName);
				$('#loggedUserName').html($scope.acct.FirstName + ' ' + $scope.acct.LastName)
				$('#phoneNumber').html($scope.acct.Phone);

				$scope.message = response.data.message;
			}
		}, function errorCallback(response){
			$scope.messageStatus = "alert alert-danger";
			if(response.status <= -1){
				$scope.message = "Api server is not available";
				console.log($scope.message);	
			}
			else if(response.status == 500 ){
				$scope.message = response.statusText + ' - ' + response.data.message;
				console.log($scope.message);	
			}
			else if(response.data !== null && response.data.data !== null && response.data.data.length >0){
				$scope.message = response.data.data[0].msg;
				console.log($scope.message);	
			}
		});
	}
	
	$scope.updatePassword = function()
    {	
		$scope.passMessageStatus = "alert alert-danger";
        var url = "/api/auth/changePassword";
        
		var postData = {
			id:$scope.acct.Id,
			useremail:$scope.acct.Email,
			userpassword: $scope.acct.CurrentPassword,
			newpassword: $scope.acct.NewPassword,
			confirmpassword: $scope.acct.ConfirmPassword,
		};
        
        $http.post(url, postData)
        .then(function successCallback(response){
			if(response.data != null && response.data.status){
				$scope.passMessageStatus = "";
				$('#password_container').hide();
				$('#btnChangepassword').hide();
				}
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

	
	$scope.registrationother = function(){
		window.location = "registrationother.html";
	};
	
	$scope.activateRegForm = function (fId, tId, mode)
	{
		console.log('from Id :' + fId + ' To id: ' + tId + ' mode: ' + mode  );
		console.log('li class :' + $("#lItem_"+fId).closest("li").attr('class'));
		$("#lItem_"+fId).hide('500');
		if(mode === "ng")
		{
			$("#lItem_"+fId).closest("li").removeClass("active").addClass("wrong");
		}
		else
		{
			$("#lItem_"+fId).closest("li").removeClass("active").addClass("done");
		}
		
		
		$("#lItem_"+tId).show('slow');
		$("#lItem_"+tId).closest("li").addClass("active").removeClass("done").removeClass("wrong");
	}

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
app.controller('mkmController', ['$scope', '$http', '$location', '$window', signupController]);
//app.directive('noDirtyCheck', noDirtyCheck);

var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
             
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};
 
app.directive("compareTo", compareTo);



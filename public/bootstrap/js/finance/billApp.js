

var mainController = function ($scope, $http, $window) {
    $scope.message = '';
    $scope.cust = {};
    $scope.cust.SearchText = '';

    $scope.pageSize = 5;
    $scope.maxSize = 5;
    $scope.currentPage = 1;
    $scope.patients = [];
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
    $scope.showPatientSummaryDialog = new ShowSummaryDialogModel();

    $scope.allPatients = function () {
        var url = $scope.baseUrl + "/api/patient/ls-all";
        $http.get(url, {
           headers:{
               Authorization: 'Bearer ' + localStorage.getItem('token')
           }
        })
        .then(function (response) {
            console.log("status:" + response.status);
            $scope.patients = response.data.productList;
            $scope.totalItems = $scope.patients.length;
        }).catch(function (response) {
            $scope.alertType = "alert alert-danger";
            if(response !=null && response.data !=null && response.data.message ==="jwt malformed"){
                $scope.responseMessage = "Unable to get patient details because of invalid security token";
            }
            else{
                $scope.responseMessage = "Unable to get patient details";
            }
            console.log('Error occurred:', response.status, response.data.message);
        }).finally(function () {
            console.log("Task Finished");
        });
    };


    $scope.patients1 = [
        { lastName: "John", firstName: "Tosle", dob: new Date("11/23/1980"), phone: "(696) 993-6490" },
        { lastName: "Cordell", firstName: "Kluesner", dob: new Date("9/3/1972"), phone: "(357) 411-6101" },
        { lastName: "Roger", firstName: "Ashworth", dob: new Date("4/3/1985"), phone: "(265) 535-2536" },
        { lastName: "Desirae", firstName: "Illingworth", dob: new Date("8/23/1988"), phone: "(960) 916-7452" },
        { lastName: "Joseph", firstName: "Michalek", dob: new Date("1/17/1960"), phone: "(507) 360-1237" },
        { lastName: "Calandra", firstName: "Carbin", dob: new Date("2/28/1967"), phone: "(956) 793-5188" },
        { lastName: "Carmine", firstName: "Lampley", dob: new Date("10/20/1990"), phone: "(280) 207-0632" },
        { lastName: "Gearldine", firstName: "Purdie", dob: new Date("9/19/1993"), phone: "(791) 352-7202" },
        { lastName: "Katherin", firstName: "Cordle", dob: new Date("8/10/1970"), phone: "(564) 394-5574" },
        { lastName: "Tawny", firstName: "Drey", dob: new Date("5/31/1982"), phone: "(467) 566-8740" },
        { lastName: "Piedad", firstName: "Mcguire", dob: new Date("8/30/1985"), phone: "(960) 637-8141" },
        { lastName: "Rosalina", firstName: "Monzon", dob: new Date("11/22/1989"), phone: "(456) 326-9179" },
        { lastName: "Blondell", firstName: "Marcinek", dob: new Date("1/29/2001"), phone: "(508) 306-4032" },
        { lastName: "Teddy", firstName: "Greve", dob: new Date("12/12/2005"), phone: "(754) 958-7216" },
        { lastName: "Rachell", firstName: "Riera", dob: new Date("3/15/2002"), phone: "(931) 233-8799" },
        { lastName: "Rosanna", firstName: "Lyall", dob: new Date("5/17/1999"), phone: "(236) 385-3217" },
        { lastName: "Nikita", firstName: "Mcclard", dob: new Date("6/12/1993"), phone: "(474) 348-5976" },
        { lastName: "Kelvin", firstName: "Ford", dob: new Date("12/21/1998"), phone: "(690) 344-6037" },
        { lastName: "Criselda", firstName: "Allbright", dob: new Date("4/3/1976"), phone: "(784) 964-8487" },

    ];

    $scope.Search = function (item) {
        if ($scope.cust.SearchText === "" || $scope.cust.SearchText == undefined) {
            return true;
        }
        else {
            if (item.lastName.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                item.firstName.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                item.homePhone.toLowerCase().indexOf($scope.cust.SearchText.toLowerCase()) !== -1 ||
                new Date(item.dob).getTime() === new Date($scope.cust.SearchText).getTime()) {
                return true;
            }
            return false;
        }
    };

    $scope.showFinanceOption = function (id) {
        console.log("Id: " + id);
        $scope.PatientId = id;
        $scope.resetValues();
        var dataObj = { id: id };
        $http.get('api/Patient/ls-trearplan/' + id, {
            headers:{
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
         })
            .then(function (response) {
                console.log("status:" + response.status);
                if (response.data != null) {
                    $scope.TreatmentPlanDetails = response.data.treatmentPlanDetails;
                    $scope.FullName = response.data.treatmentPlanDetails[0].fName + " " + response.data.treatmentPlanDetails[0].lName;
                    angular.forEach(response.data.treatmentPlanDetails, function (plan) {
                        $scope.TotalFees += plan.procFee;
                        $scope.PrimaryInsurance += plan.insPayEst;
                        $scope.SecondayInsurance += 0;
                        $scope.InsurancePayment += plan.insPayAmt;
                        $scope.PatientCost += plan.patientEst;
                    });
                }
                $scope.totalItems = $scope.TreatmentPlanDetails.length;
            }).catch(function (response) {
                console.error('Error occurred:', response.status, response.data);
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
        $scope.PatientId = "";

        $scope.TotalFees = 0;
        $scope.PrimaryInsurance = 0;
        $scope.SecondayInsurance = 0;
        $scope.InsurancePayment = 0;
        $scope.PatientCost = 0;
    };

    //SMS
    $scope.sendReminder = function(id){
        var url = $scope.baseUrl + '/api/comm/ls-remindsms';
        data = {
            id:id,
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

    $scope.getPatientSummary = function(patient){
        console.log(patient.firstName);
        $scope.patientGender = patient.gendertext;
        $scope.patientFirstName = patient.firstName;
        $scope.patientLastName = patient.lastName;
        $scope.patientDob = patient.dob;
        $scope.patientPhone = patient.homePhone;
        $scope.patientEmail = patient.email;
        $scope.patientAddress = patient.address;
        $scope.patientAddress2 = patient.address2;
        $scope.patientCity = patient.city;
        $scope.patientState = patient.state;
    }
    
    $scope.allPatients();
    
}
app.controller('mkmController', ['$scope', '$http', '$window', mainController]);

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
                v.homePhone.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
                new Date(v.dob).getTime() === new Date(searchText).getTime()) {
                list.push(v);
            }
        });
        scope.totalItems = list.length;
        return list;
    }
});
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.directive('showSummaryDialog', [function() {
    return {
      restrict: 'E',
      scope: {
        model: '=',
      },
      link: function(scope, element, attributes) {
        scope.$watch('model.visible', function(newValue) {
          var modalElement = element.find('.modal');
          modalElement.modal(newValue ? 'show' : 'hide');
        });
        
        element.on('shown.bs.modal', function() {
          scope.$apply(function() {
            scope.model.visible = true;
          });
        });
  
        element.on('hidden.bs.modal', function() {
          scope.$apply(function() {
            scope.model.visible = false;
          });
        });
        
      },
      templateUrl: 'patient-summary.html',
    };
  }]);

var ShowSummaryDialogModel = function(){
    this.visible = false;        
};
ShowSummaryDialogModel.prototype.open = function(person) {
    this.person = person;
    this.visible = true;
};
ShowSummaryDialogModel.prototype.close = function() {
    this.visible = false;
};
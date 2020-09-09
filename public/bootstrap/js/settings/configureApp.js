var mainController = function ($scope, $http, $window, $location) {
    $scope.system = {};
    $scope.frmClinic = {};
    $scope.reminder = {};
    $scope.system.ODImagePath = "";
    $scope.system.Id = "";
    $scope.responseMessage = "";
    $scope.frmClinic.Id = "";
    $scope.frmClinic.ClinicName = "";
    $scope.frmClinic.DoctorName = "";
    $scope.frmClinic.Phone = "";
    $scope.frmClinic.Address1 = "";
    $scope.frmClinic.Address1 = "";
    $scope.frmClinic.City = "";
    $scope.frmClinic.State = "";
    $scope.frmClinic.ZipCode = "";

    $scope.reminder.ReminderMessage = "Dental appointment reminder from Brook Hollow Family Dentistry\n";
    $scope.reminder.ReminderMessage += "{firstName} - appointment is on {AptDateTime}. Please reply as either C or Confirm to confirm.\n";
    $scope.reminder.ReminderMessage += "If you have any questions, please call {clinicNumber}.\n\n";
    $scope.reminder.ReminderMessage += "Reply STOP to opt out of all text messages";
    $scope.reminder.FirstReminder = 2;
    $scope.reminder.FirstReminderMode = "d";
    $scope.reminder.SecondReminder = 1;
    $scope.reminder.SecondReminderMode = "d";

    
}    

app.controller('mkmController', ['$scope', '$http', '$window', '$location', mainController]);

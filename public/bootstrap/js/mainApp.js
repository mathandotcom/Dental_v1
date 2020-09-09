var app = angular.module('mkmApp', ['ngMessages']);

app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.service("DateService", dateService);
function dateService() {

    this.getDateTime = function (repType) {
        var currDate = new Date();
        var sDay = currDate.getDate();
        var sMonth = (currDate.getMonth() + 1);
        var sYear = currDate.getFullYear();
        var sHour = currDate.getHours();
        var sMinute = currDate.getMinutes()
        var sSecond = currDate.getSeconds();

        var ampm = sHour >= 12 ? 'PM' : 'AM';

        if (sDay.toString().length === 1) sDay = '0' + sDay;
        if (sMonth.toString().length === 1) sMonth = '0' + sMonth;

        if (sHour.toString().length === 1) sHour = '0' + sHour;
        if (sMinute.toString().length === 1) sMinute = '0' + sMinute;
        if (sSecond.toString().length === 1) sSecond = '0' + sSecond;

        return sMonth + '/' + sDay + '/' + sYear + ' ' + sHour + ':' + sMinute + ':' + sSecond;// + ' ' + ampm;

    };
    this.getDate = function (repType) {
        var currDate = new Date();
        var sDay = currDate.getDate();
        var sMonth = (currDate.getMonth() + 1);
        var sYear = currDate.getFullYear();

        if (sDay.toString().length === 1) sDay = '0' + sDay;
        if (sMonth.toString().length === 1) sMonth = '0' + sMonth;

        return sMonth + '/' + sDay + '/' + sYear;

    };
    this.getDateTimeFormat = function (currDate) {
        var sDay = currDate.getDate();
        var sMonth = (currDate.getMonth() + 1);
        var sYear = currDate.getFullYear();
        var sHour = currDate.getHours();
        var sMinute = currDate.getMinutes()
        var sSecond = currDate.getSeconds();

        var ampm = sHour >= 12 ? 'PM' : 'AM';

        if (sDay.toString().length === 1) sDay = '0' + sDay;
        if (sMonth.toString().length === 1) sMonth = '0' + sMonth;

        if (sHour.toString().length === 1) sHour = '0' + sHour;
        if (sMinute.toString().length === 1) sMinute = '0' + sMinute;
        if (sSecond.toString().length === 1) sSecond = '0' + sSecond;

        return sMonth + '/' + sDay + '/' + sYear + ' ' + sHour + ':' + sMinute + ':' + sSecond; // + ' ' + ampm;
    };

    this.getDateFormat = function(anyDate){
        var sDay = anyDate.getDate();
        var sMonth = (anyDate.getMonth() + 1);
        var sYear = anyDate.getFullYear();

        if (sDay.toString().length === 1) sDay = '0' + sDay;
        if (sMonth.toString().length === 1) sMonth = '0' + sMonth;

        return sMonth + '/' + sDay + '/' + sYear;
    };

    this.navigatedate = function(t, anyDate){
        var setDate = new Date(anyDate);
        var newDate = new Date(setDate);
        if(t === 'l'){
            newDate.setDate(newDate.getDate() - 1)
        } 
        else if(t === 'r'){
            newDate.setDate(newDate.getDate() + 1)
        }
        
        return this.getDateFormat(newDate);
    }

    this.getServerDate = function (serverDate) {
        var currDate = new Date(serverDate);
        return this.getDateTimeFormat(currDate);
    };

    this.addDays = function (date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    this.parsedDate = function (jsonDate) {
        return jsonDate.replace('/Date(', '').replace(')/', '');
    };
}

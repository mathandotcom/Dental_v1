$(document).ready(function () {
    $('.dropdown-toggle').dropdown();
    $('#sandbox-container input').datepicker({
        startDate: "today-1",
        maxViewMode: 3,
        todayBtn: "linked",
        keyboardNavigation: false,
        //autoclose:true
    });
    $("#txtAptDate1").val(getCurrentDate());
    $("#txtAptDate").on("keypress", function(evt){
        var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
        if(keyCode == 13){
            evt.preventDefault();
            alert("asasasa");
            return false; 
        }
    });

    $("#btnApptSearch").click(function(){
        //alert("AASAS");
    });


});

function getCurrentDate()
{
    var currDate = new Date();
    var sDay = currDate.getDate();
    var sMonth = (currDate.getMonth() + 1);
    var sYear = currDate.getFullYear();

    if (sDay.toString().length === 1) sDay = '0' + sDay;
    if (sMonth.toString().length === 1) sMonth = '0' + sMonth;

    return sMonth + '/' + sDay + '/' + sYear;
}
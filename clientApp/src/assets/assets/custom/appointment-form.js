!function($) {
    "use strict";
  
    var AdvancedForm = function() {};
    
    AdvancedForm.prototype.init = function() {
        //$('#mdate').val(new Date);
        // MAterial Date picker    
        $('#mdate').bootstrapMaterialDatePicker({
            weekStart : 0, 
            time: false,
            format : 'MM/DD/YYYY',
            
        });       
        $('#mdate').bootstrapMaterialDatePicker().on('change',function(e, date){
            console.log(date._d);
        });
        //setDate (String|Date|Moment)
        //https://www.jqueryscript.net/time-clock/Pretty-Date-Time-Picker-Plugin-For-Bootstrap-Material.html
        /*
        $('#date-start').bootstrapMaterialDatePicker({ weekStart : 0 }).on('change', function(e, date)
        {
            $('#date-end').bootstrapMaterialDatePicker('setMinDate', date);
        });
        */
        
    },
  //init
  $.AdvancedForm = new AdvancedForm, $.AdvancedForm.Constructor = AdvancedForm
}(window.jQuery),

//initializing
function ($) {
  "use strict";
  $.AdvancedForm.init();
}(window.jQuery);        
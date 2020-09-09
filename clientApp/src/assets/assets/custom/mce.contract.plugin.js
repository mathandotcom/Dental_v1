    if ($("#emailbody").length > 0) {
        tinymce.PluginManager.add('placeholder', function (editor, url) {
            editor.ui.registry.addMenuButton('placeholder', {
                text: "Placeholder",
                fetch: function (callback) {
                    var items = [
                        {
                            type: "menuitem",
                            "text": "Patient First Name",
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#FirstName", "#0058E0"));
                            }
                        }, {
                            type: 'menuitem',
                            text: 'Patient Last Name',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#LastName", "#D70026"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Appointment Datetime',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#ApptDatetime", "#6C00EC"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Doctor Name',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#DoctorName", "#0E7104"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Clinic Contact',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#ClinicContact", "#0E7104"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Clinic Name',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#ClinicName", "#F25C00"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Clinic Address',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#ClinicAddress", "#F25C00"));
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Total Payment',
                            onAction: function (_) {
                                editor.insertContent(mceContractFragment("#Payamount", "#F25C00"));
                            }
                        },
                    ]; //Create MenuItem[]
                    callback(items);
                }
            });
        });

        function mceContractFragment(text, color) {
            color = typeof color === "undefined" ? "#007bff" : color;
            // return "<span class='contract mceNonEditable' style='font-size : 14px; font-weight : bold; inline:block; background-color: "
            //     + color + "; color : #fff; padding : 3px 5px; border-radius : 3px;'>"
            //     + text
            //     + "</span> ";
                return `[${text}]`;
        }
        
    }

(function() {

    $(document).ready(function() {
        $(document).foundation({
            abide: {
                validators: {
                    passwordStrongEnough: function(el, required, parent) {
                        var number = new RegExp("[0-9]");
                        var non_alpha_numeric = /\W/;
                        var text = el.value;
                        var len = text.length;
                        if(len > 6) {
                            return true;
                        } else {
                            return (len > 10 && number.test(text) && non_alpha_numeric.test(text));
                        }
                    }
                }
            }
        });
        console.log("Foundation set-up and ready :)");
        $('#registrationForm').on('valid.fndtn.abide', function() {
            var username = $('#username').val();
            var password = $('#password').val();
            var data = {
                username: username,
                password: password
            };
            console.log(data);
        });

    });

})();/**
 * Created by Inzamam on 12/15/2014.
 */

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
                        if(len > 20) {
                            return true;
                        } else {
                            return (len > 10 && number.test(text) && non_alpha_numeric.test(text));
                        }
                    }
                }
            }
        });
        console.log("Foundation set-up and ready :)");

        // Place stuff related to form validation

    });

})();/**
 * Created by Inzamam on 12/15/2014.
 */

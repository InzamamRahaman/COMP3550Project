/**
 * Created by Inzamam on 12/16/2014.
 */
(function() {

    $(document).ready(function() {


        // Handle profile form submission here
        $(document).foundation();
        console.log("Foundation ready :)");

        // Grab user's twitter name and load in into webpage
        var twitterNameGetApi = "/api/get/user/twitter";
        $.get(twitterNameGetApi, function(data)  {
           console.log(data);
            var twitt = data.data.twitterName;
            $('#twitterHandle').val(twitt);
        });


        $('#profileForm').on('valid.fndtn.abide', function() {
           console.log("Ready to submit form!");

            var password = $('#password').val();
            var twitterHandle = $('#twitterHandle').val();
            submit_new_password(password);
            submit_new_twitter_handle(twitterHandle);


        });


        // Functions for form submission

        function submit_new_password(newPassword) {
            var password_api = "/api/update/user/password";
            if(newPassword.length > 0) {
                console.log("Changing password to " + newPassword);
                $.put(password_api, {password: newPassword}, function(res) {
                    console.log("new password set");
                    console.log(res);
                });
            }
        }

        function submit_new_twitter_handle(newTwitterHandle) {
            var twitter_handle_api = "/api/update/user/twittername/" + newTwitterHandle;
            if(newTwitterHandle.length > 0) {
                console.log("Changing twitterHandle to " + newTwitterHandle);
                $.put(twitter_handle_api, {}, function(res) {
                    console.log("Twitter handle set");
                    console.log(res);
                });
            }
        }

    })

})();
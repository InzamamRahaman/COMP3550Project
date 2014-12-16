/**
 * Created by Inzamam on 12/16/2014.
 */
(function() {

    $.each(['put', 'delete'], function(idx, http_method) {

        $[http_method] = function(url, data, success_callback) {
            var ajax_obj = {
                url: url,
                type: http_method,
                data: data,
                success: success_callback
            };

            $.ajax(ajax_obj);

        }
    });


})();
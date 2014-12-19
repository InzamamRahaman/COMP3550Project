/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    $(document).ready(function() {
        console.log('set up ticker');
        $('#ticker').newsTicker({
            row_height: 60,
            max_rows: 5,
            duration: 7000,
            prevButton: $('#ticker-prev'),
            nextButton: $('#ticker-next')
        });
    });

})();
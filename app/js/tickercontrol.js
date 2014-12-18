/**
 * Created by Inzamam on 12/18/2014.
 */
(function() {

    $(document).ready(function() {
        console.log('set up ticker');
        $('#ticker').newsTicker({
            row_height: 2000,
            max_rows: 10,
            duration: 4000,
            prevButton: $('#ticker-prev'),
            nextButton: $('#ticker-next')
        });
    });

})();
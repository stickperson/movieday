$(document).ready(function(){
    $('#search').on('click', function(){
        console.log('hello');
        zip = $('#zip').val();
        data = {
            zip: zip
        }
        $.post('/search', data, function(response){
            theaters = JSON.parse(response);
            console.log(theaters);
            $('#container').html(Mustache.render($('#results').html(), theaters));
        });
    });
    $('body').on('click', '#theater-link', function(){
        // GET everything from session, set to variable
        // Extract theater name
        // Loop through session data for name
        // Display showtimes?
        $.ajax({
            url: '/session',
            dataType: 'JSON',
            type: 'GET',
            success: function(data){
                theaters = data
            }
        })
    });
});
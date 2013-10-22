$(document).ready(function(){
    $('#search').on('click', function(){
        console.log('hello');
        zip = $('#zip').val();
        data = {
            zip: zip
        }
        $.post('/search', data, function(response){
            theaters = JSON.parse(response);
            console.log(theaters)
            for (var i=0; i<theaters.length; i++){
                console.log(theaters[i]['name']);
                for (var l=0; l<theaters[i]['movies'].length; l++){
                    movie = theaters[i]['movies'][l]['name'];
                    console.log(movie + ' ' + movie.length);
                }
            }
            $('#container').html(Mustache.render($('#results').html(), theaters));
        });
    });
});
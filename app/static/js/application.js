$(document).ready(function(){
    // Scrapes movie data after entering zip code
    $('#search').on('click', function(){
        console.log('hello');
        zip = $('#zip').val();
        data = {
            zip: zip
        }
        $.post('/search', data, function(response){
            theaters = JSON.parse(response);
            for (var i=0; i<theaters.length; i++){
                theaters[i]['id'] = i
                console.log(theaters[i]['name']);
            }
            console.log(theaters);
            $('#container').html(Mustache.render($('#results').html(), theaters));
        });
    });

    // Shows all movies at a particular theater
    $('body').on('click', '.theater-link', function(){
        theater_id = Number($(this).attr('id'));
        theater = theaters[theater_id];
        for (var i=0; i<theater['movies'].length; i++){
            theater['movies'][i]['id'] = i
        }
        $('#container').html(Mustache.render($('#theater').html(), theater));
    });

    var selected_movies = new Array();

    // Adds movie ids to an array
    $('body').on('click', '.movie-checkbox', function(){
        movie_id = Number($(this).attr('id'));
        selected_movies.push(movie_id);
    });

    // POST movies and theater id
    $('body').on('click', '#select-movies', function(){
        // For Django
        movies = JSON.stringify(selected_movies);
        data = {
            theater: theater_id,
            movies: movies
        }
        $.post('/selected', data, function(data){
            console.log('POST working');
        });

        // For frontend
        var results = new Array ();
        for (var i=0; i<selected_movies.length; i++){
            var movie = _.findWhere(theater['movies'], {id: selected_movies[i]});
            results.push(movie);
        }
    });
});
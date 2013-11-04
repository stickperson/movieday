var apikey = 'nupxubc8tbpecvuq8gqdsyv2'
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var moviesSearchUrl = baseUrl + '/movies.json?apikey=' + apikey;


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
            console.log(theaters);
            $('#content').html(Mustache.render($('#results').html(), theaters));
        });
    });

    // Shows all movies at a particular theater
    $('body').on('click', '.theater-link', function(){
        theater_id = Number($(this).attr('id'));
        theater = theaters[theater_id];
        console.log('theater id: ' + theater_id)
        for (var i=0; i<theaters[theater_id]['movies'].length; i++){
            console.log('test');
            var query = theaters[theater_id]['movies'][i]['name']
            $.ajax({
                url: moviesSearchUrl + '&q=' + encodeURI(query),
                dataType: "jsonp",
                success: function(data){
                console.log('dfadfads');
                console.log(data);
                },
            });
        }

        $('#content').html(Mustache.render($('#theater').html(), theater));
    });

    var selected_movies = new Array();

    // Adds movie ids to an array
    $('body').on('click', '.movie-checkbox', function(){
        movie_id = Number($(this).attr('id'));
        console.log('movie id: ' + movie_id)
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
        var titles = new Array ();
        for (var i=0; i<results.length; i++){
            titles.push(results[i]['name']);
        }
        $('#content').html(Mustache.render($('#graph').html(), results));
    });
});
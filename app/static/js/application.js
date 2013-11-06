// Rotten Tomatoes info
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var inTheaters = '/lists/movies/in_theaters.json?apikey='
var apikey = 'nupxubc8tbpecvuq8gqdsyv2'


$(document).ready(function(){
    // Get movies currently in theaters from Rotten Tomatoes API
    $.ajax({
        url: baseUrl + inTheaters + apikey,
        dataType: "jsonp",
        success: function(data){
            rt_info = data['movies']
            console.log(rt_info);
            for (var i=0; i<data['movies'].length; i++){
                var poster_url = data['movies'][i]['posters']['profile'];
                var score = data['movies'][i]['ratings']['critics_score'];
                var img = '<img src="' + poster_url + '"/>';
                var div = '<div class="tile col-md-2">'+img+'<span class="banner">'+score+'</span></div>';
                $('.intheaters').append(div);
            }
        },
    });

    // Scrapes movie data after entering zip code
    $('#search').on('click', function(){
        console.log('hello');
        zip = $('#zip').val();
        data = {
            zip: zip
        }
        $('#content').html('<div class="container text-center"><img src="static/images/status.gif" /></div>');
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
        console.log('theater id: ' + theater_id);

        // Old view. Save until new view is working
        $('#content').html(Mustache.render($('#theater').html(), theater));

        //New view with pictures

        // $('#content').html(Mustache.render($('#theater-new').html(), theater));
        // var movies = theater['movies'];
        // for (var i=0; i<rt_info.length; i++){
        //     var title = rt_info[i]['title'];
        //     for (var x=0; x<movies.length; x++){
        //         var name = movies[x]['name']
        //         if (name.indexOf(title) > -1){
        //             var poster_url = rt_info[i]['posters']['profile'];
        //             var score = rt_info[i]['ratings']['critics_score'];
        //             var img = '<img src="' + poster_url + '"/>';
        //             var div = '<div class="tile col-md-2">'+img+'<span class="banner">'+score+'</span></div>';
        //             $('.intheaters').append(div);
        //         }
        //     }
        // }
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
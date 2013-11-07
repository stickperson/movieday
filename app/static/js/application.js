// Rotten Tomatoes info
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var inTheaters = '/lists/movies/in_theaters.json?apikey='
var apikey = 'nupxubc8tbpecvuq8gqdsyv2'
var perPage = '&page_limit=50'


$(document).ready(function(){
    var csrftoken = $.cookie('csrftoken');
    console.log(csrftoken);
    // Get movies currently in theaters from Rotten Tomatoes API
    $.ajax({
        url: baseUrl + inTheaters + apikey + perPage,
        dataType: "jsonp",
        success: function(data){
            rt_info = data['movies']
            console.log(rt_info);
            console.log(baseUrl+inTheaters+apikey);
            $('#movies').html(Mustache.render($('#intheaters_template').html(), rt_info));
        }
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
            $('#content').html(Mustache.render($('#zip_results').html(), theaters));
        });
    });

    // Shows all movies at a particular theater
    $('body').on('click', '.theater-link', function(){
        theater_id = Number($(this).attr('id'));
        theater = theaters[theater_id];
        console.log('theater id: ' + theater_id);

        //New view with pictures

        var movies = theater['movies'];
        for (var i=0; i<rt_info.length; i++){
            var title = rt_info[i]['title'];
            for (var x=0; x<movies.length; x++){
                var name = movies[x]['name'];
                if (name.indexOf(title) > -1){
                    var poster_url = rt_info[i]['posters']['profile'];
                    movies[x]['poster'] = poster_url;
                    var score = rt_info[i]['ratings']['critics_score'];
                    movies[x]['score'] = score;
                    movies[x]['synopsis'] = rt_info[i]['synopsis'];
                }
            }
        }
        console.log(movies);
        $('#content').html(Mustache.render($('#theater_template').html(), movies));
    });

    var selected_movies = new Array();
    $('body').on('click', '#choose', function(){
        $('input:checked').each(function(){
            if ($(this).is(':checked')){
                console.log('checked');
                var movie_id = Number($(this).attr('value'));
                selected_movies.push(movie_id);
            }
        });
        console.log(selected_movies);
        showSelected(selected_movies)
    });
});

function showSelected(choices){
    
    // For Django
    movies = JSON.stringify(choices);
    data = {
        theater: theater_id,
        movies: movies
    }
    $.post('/selected', data, function(data){
        console.log('POST working');
    });

    // For frontend
    var results = new Array ();
    for (var i=0; i<choices.length; i++){
        var movie = _.findWhere(theater['movies'], {id: choices[i]});
        results.push(movie);
    }
    var titles = new Array ();
    for (var i=0; i<results.length; i++){
        titles.push(results[i]['name']);
    }
    $('#content').html(Mustache.render($('#graph').html(), results));
}
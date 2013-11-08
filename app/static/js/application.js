// Rotten Tomatoes info
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var inTheaters = '/lists/movies/in_theaters.json?apikey='
var apikey = 'nupxubc8tbpecvuq8gqdsyv2'
var perPage = '&page_limit=50'

// ------------------------------------------------------- //
//                      Globals                            //
// ------------------------------------------------------- //

var zip;
var theater_id;
var theater;
var theaters;

$(document).ready(function(){

    // navbar back to theater option
    $('ul.nav li a#goto-theaters').on('click', function() {
        if (zip) {
            getTheaters(zip);
        } else {
            console.log('no zipcode selected yet');
        }
    });

    // navbar back to movies option
    $('ul.nav li a#goto-movies').on('click', function() {
        if (theater) {
            showMovies(theater);
        } else {
            window.location = '/';
        }
    });

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
        setupCSRF();
        var user_zip = $('#zip').val();
        var data = {
            'zip': user_zip
        }
        zip = data;
        getTheaters(zip);
    });

    // Shows all movies at a particular theater
    $('body').on('click', '.theater-link', function(){
        theater_id = Number($(this).attr('id'));
        theater = theaters[theater_id];
        console.log('theater id: ' + theater_id);

        //New view with pictures
        showMovies(theater);
    });

    // change button color on click
    $('#content').on('change', 'div.tile label', function() {
        if ($(this).hasClass('btn-success')) {
            $(this).removeClass('btn-success');
            $(this).addClass('btn-primary');
        } else {
            $(this).removeClass('btn-primary');
            $(this).addClass('btn-success');
        }
    });

    var selected_movies = new Array();
    $('body').on('click', '#choose', function(){
        var count = 0;
        $('input:checked').each(function(){
            count += 1;
            if ($(this).is(':checked')){
                console.log('checked');
                var movie_id = Number($(this).attr('value'));
                selected_movies.push(movie_id);
            }
        });
        if (count<2){
            // Popover not working
            // $('#choose').popover({title:'test'});
            alert('choose more than 1 movie');
        }
        else {
            showSelected(selected_movies)
        }
    });
});

function showMovies(theater) {
    movies = theater['movies'];
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
}

function getTheaters(data) {
    $('#content').html('<div class="container text-center"><img src="static/images/status.gif" /></div>');
    if (theaters) {
        $('#content').html(Mustache.render($('#zip_results').html(), theaters));
    } else {
        $.post('/search', data, function(response){
            theaters = JSON.parse(response);
            console.log(theaters);
            $('#content').html(Mustache.render($('#zip_results').html(), theaters));
        });
    }
}

function showSelected(choices){
    
    // For Django
    selected = JSON.stringify(choices);
    var data = {
        theater: theater_id,
        movies: selected
    }
    $.post('/selected', data, function(data){
        console.log('POST working');
        var results = JSON.parse(data);
        results[0]['first_poster'] = movies[results[0]['first_id']]['poster']
        results[0]['second_poster'] = movies[results[0]['second_id']]['poster']
        console.log(results);
        console.log(typeof(results))
        $('#content').html(Mustache.render($('#final_template').html(), results));
    });
}

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function setupCSRF(){
    var csrftoken = $.cookie('csrftoken');
    console.log(csrftoken);

    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}
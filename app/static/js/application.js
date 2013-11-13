// Rotten Tomatoes info
var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0";
var inTheaters = '/lists/movies/in_theaters.json?apikey='
var apikey = 'nupxubc8tbpecvuq8gqdsyv2'
var perPage = '&page_limit=40'

// ------------------------------------------------------- //
//                          Date                           //
// ------------------------------------------------------- //

var d = new Date();
console.log(d);
var current_year = d.getFullYear();
var current_month = d.getMonth() + 1;
var current_date = d.getDate();
var current_day = d.getDay();
var current_hour = d.getHours();
var current_minute = d.getMinutes();
var weekday=new Array(7);
weekday[0]="Sun.";
weekday[1]="Mon.";
weekday[2]="Tues.";
weekday[3]="Wed.";
weekday[4]="Thurs.";
weekday[5]="Fri.";
weekday[6]="Sat.";

var month=new Array(12);
month[0]="Jan.";
month[1]="Feb.";
month[2]="Mar.";
month[3]="Apr.";
month[4]="May";
month[5]="Jun.";
month[6]="Jul.";
month[7]="Aug.";
month[8]="Sept.";
month[9]="Oct.";
month[10]="Nov.";
month[11]="Dec.";

// ------------------------------------------------------- //
//                      Globals                            //
// ------------------------------------------------------- //

var zip;
var theater_id;
var theater;
var theaters;
var start_hour = current_hour;
var start_minute = current_minute;
var start_time = current_hour + ':' + current_minute + ':00';
var start_date = current_month + '/' + current_date + '/' + current_year;

$(document).ready(function(){
    console.log(start_time);
    setDay();
    setHours();

    // update date/time buttons on click
    $('ul#time li').on('click', function(){
        console.log('time clicked');
        var time = $(this).html();
        start_time = $(this).attr('id') + ':00:00';
        var span = ' <span class="caret"></span>'
        $('#chosen-time').html(time + span);
    });

    $('ul#day li').on('click', function(){
        var day = $(this).html();
        start_date = $(this).attr('id');
        span = ' <span class="caret"></span>'
        $('#chosen-date').html(day + span);
        if (day != 'Today'){
            console.log('not today!');
            resetTime();
            listenToTime();
        }
    });

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
        $(this).html('Loading...');
        setupCSRF();
        var user_zip = $('#zip').val();
//        var a_date = $('button#chosen-date').html().trim().split(' ');
//        var a_time = $('button#chosen-time').html().trim().split(' ');

        var data = {
            'zip': user_zip,
            'start_time': start_time,
            'start_date': start_date
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

    $('body').on('click', '#choose', function() {
        var selected_movies = new Array();
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
            $('#choose').popover({title:'test'});
            // alert('choose more than 1 movie');
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
        if (results[0]['error']){
            console.log(results);
            console.log('error reached!');
            var message = results[0]['error'];
            $('#error').empty();
            $('#error').append('<div class="alert alert-danger alert-disassemble"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+message+'</div>');
        }
        else {
            console.log(movies[results[0]['first_id']]);
            console.log(typeof(results[0]['first_start']));
            var difference_seconds = results[0]['time_difference'];
            var minutes = difference_seconds/60;
            results[0]['first_poster'] = movies[results[0]['first_id']]['poster'];
            results[0]['second_poster'] = movies[results[0]['second_id']]['poster'];
            results[0]['first_synopsis'] = movies[results[0]['first_id']]['synopsis'];
            results[0]['second_synopsis'] = movies[results[0]['second_id']]['synopsis'];
            results[0]['first_score'] = movies[results[0]['first_id']]['score'];
            results[0]['second_score'] = movies[results[0]['second_id']]['score'];
            results[0]['minutes'] = minutes;
            console.log(results);
            console.log(typeof(results))
            $('#content').html(Mustache.render($('#final_template').html(), results));
        }
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

function setDay(){
    for (var i=0; i<3; i++){
        var thisDateObj = addDays(d, i);
        var thisDay = thisDateObj.getDate();
        var thisDayName = thisDateObj.getDay();
        var thisMonth = thisDateObj.getMonth()+1;
        var thisYear = thisDateObj.getFullYear();

        if (i==0){
            $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">Today</li>');
        }
        else if (i==1){
            $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">Tomorrow</li>');
        }
        else {
            $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">' + thisDateObj.toLocaleDateString() +  '</li>');
        }
    }
}

function setHours(){
    for (var i=current_hour; i<24; i++){
        if (i==0){
            var midnight = i;
            $('#time').append('<li id="' + i + '">' + midnight + ':00am' + '</li>');
        }
        else if (i < 12){
            $('#time').append('<li id="' + i + '">' + i + ':00am' + '</li>');
        }
        else {
            var pm = i % 12;
            $('#time').append('<li id="' + i + '">' + pm + ':00pm' + '</li>');
        }
    }
}

function addDays(dateObj, days) {
    return new Date(dateObj.getTime() + days*86400000);
}

function resetTime(){
    console.log('new day hours running');
    $('ul#time').empty();
    var span = ' <span class="caret"></span>';
    $('#chosen-time').html('9:00am'+span);
    for (var i=9; i<24; i++){
        if (i < 12){
            $('#time').append('<li id="' + i + '">' + i + ':00am' + '</li>');
        }
        else if (i==12){
            $('#time').append('<li id="' + i + '">' + i + ':00pm' + '</li>');
        }
        else {
            var pm = i % 12;
            $('#time').append('<li id="' + i + '">' + pm + ':00pm' + '</li>');
        }
    }
}

function listenToTime(){
    $('ul#time li').on('click', function(){
        console.log('time clicked');
        var time = $(this).html();
        start_time = $(this).attr('id') + ':00:00';
        span = ' <span class="caret"></span>';
        $('#chosen-time').html(time + span);
    });
}


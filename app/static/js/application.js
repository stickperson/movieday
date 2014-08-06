
var movieday = (function (){
    var d = new Date();
        current_year = d.getFullYear(),
        current_month = d.getMonth() + 1,
        current_date = d.getDate(),
        current_day = d.getDay(),
        current_hour = d.getHours(),
        current_minute = d.getMinutes(),
        weekday = new Array(7),
        month = new Array(12);
        weekday[0]="Sun.";
        weekday[1]="Mon.";
        weekday[2]="Tues.";
        weekday[3]="Wed.";
        weekday[4]="Thurs.";
        weekday[5]="Fri.";
        weekday[6]="Sat.";
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

    return {
        start_hour: current_hour,
        start_minute: current_minute,
        start_time: current_hour + ':' + current_minute + ':00',
        start_date: current_month + '/' + current_date + '/' + current_year,
        zip: undefined,
        theater: undefined,
        theaters: undefined,
        theater_id: undefined,
        addDays: function(dateObj, days) {
            return new Date(dateObj.getTime() + days*86400000);
        },
        setHours: function(){
            var i,
                midnight,
                pm;
            for (i = current_hour; i < 24; i++){
                if (i === 0){
                    midnight = i;
                    $('#time').append('<li id="' + i + '">' + midnight + ':00am' + '</li>');
                }
                else if (i < 12){
                    $('#time').append('<li id="' + i + '">' + i + ':00am' + '</li>');
                }
                else {
                    pm = i % 12;
                    $('#time').append('<li id="' + i + '">' + pm + ':00pm' + '</li>');
                }
            }
        },
        setDay: function(){
            var i,
                thisDateObj,
                thisDay,
                thisDayName,
                thisMonth,
                thisYear;
            for (i = 0; i < 3; i++){
                thisDateObj = movieday.addDays(d, i);
                thisDay = thisDateObj.getDate();
                thisDayName = thisDateObj.getDay();
                thisMonth = thisDateObj.getMonth()+1;
                thisYear = thisDateObj.getFullYear();

                if (i === 0){
                    $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">Today</li>');
                }
                else if (i==1){
                    $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">Tomorrow</li>');
                }
                else {
                    $('#day').append('<li id="' + thisMonth + '/' + thisDay + '/' + thisYear + '">' + thisDateObj.toLocaleDateString() +  '</li>');
                }
            }
        },
        getTheaters: function (data) {
            if (movieday.theaters) {
                $('#content').html(Mustache.render($('#zip_results').html(), movieday.theaters));
            } else {
                $.post('/search', data, function(response){
                    movieday.theaters = JSON.parse(response);
                    $('#content').html(Mustache.render($('#zip_results').html(), movieday.theaters));
                });
            }
        },
        showMovies: function(theater, rt) {
            var i,
                x,
                title,
                name,
                poster_url,
                score;
            movies = theater['movies'];
            for (i = 0; i < rt.rt_info.length; i++){
                title = rt.rt_info[i]['title'];
                for (x = 0; x<movies.length; x++){
                    name = movies[x]['name'];
                    if (name.indexOf(title) > -1){
                        poster_url = rt.rt_info[i]['posters']['profile'];
                        movies[x]['poster'] = poster_url;
                        score = rt.rt_info[i]['ratings']['audience_score'];
                        movies[x]['score'] = score;
                        movies[x]['synopsis'] = rt.rt_info[i]['synopsis'];
                    }
                }
            }
            $('#content').html(Mustache.render($('#theater_template').html(), movies));
        },
        listenToTime: function(){
            // $('ul#time li').on('click', function(){
            $('body').on('click', 'ul#time li', function(){
                var time = $(this).html();
                movieday.start_time = $(this).attr('id') + ':00:00';
                span = ' <span class="caret"></span>';
                $('#chosen-time').html(time + span);
            });
        },
        listenToDay: function(){
            $('ul#day li').on('click', function(){
                var day = $(this).html();
                movieday.start_date = $(this).attr('id');
                span = ' <span class="caret"></span>';
                $('#chosen-date').html(day + span);
                if (day != 'Today'){
                    resetTime();
                    movieday.listenToTime();
                }
            });
        },
        showSelected: function(choices){
            // For Django
            selected = JSON.stringify(choices);
            var data = {
                theater: movieday.theater_id,
                movies: selected
            };
            $.post('/selected', data, function(data){
                var results = JSON.parse(data);
                if (results[0]['error']){
                    var message = results[0]['error'];
                    $('#error').empty();
                    $('#error').append('<div class="alert alert-danger alert-disassemble"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+message+'</div>');
                }
                else {
                    var difference_seconds = results[0]['time_difference'];
                    var minutes = difference_seconds/60;
                    results[0]['first_poster'] = movies[results[0]['first_id']]['poster'];
                    results[0]['second_poster'] = movies[results[0]['second_id']]['poster'];
                    results[0]['first_synopsis'] = movies[results[0]['first_id']]['synopsis'];
                    results[0]['second_synopsis'] = movies[results[0]['second_id']]['synopsis'];
                    results[0]['first_score'] = movies[results[0]['first_id']]['score'];
                    results[0]['second_score'] = movies[results[0]['second_id']]['score'];
                    results[0]['minutes'] = minutes;
                    $('#content').html(Mustache.render($('#final_template').html(), results));
                }
            });
        }
    };
}());


var rottentomatoes = (function () {
    return {
        baseUrl: "http://api.rottentomatoes.com/api/public/v1.0",
        inTheaters: '/lists/movies/in_theaters.json?apikey=',
        apikey: 'nupxubc8tbpecvuq8gqdsyv2',
        perPage: '&page_limit=40',
        rt_info: undefined
    };
}());

$(function () {
    var md = movieday,
        rt = rottentomatoes;
    md.setDay();
    md.setHours();
    md.listenToTime();
    md.listenToDay();

    // Scrapes movie data after entering zip code
    $('#search').on('click', function(){
        var user_zip,
            data;
        $(this).html('Loading...');
        setupCSRF();
        user_zip = $('#zip').val();
        data = {
            'zip': user_zip,
            'start_time': md.start_time,
            'start_date': md.start_date
        };
        md.zip = data;
        md.getTheaters(md.zip);
    });

    // navbar back to theater option
    $('ul.nav li a#goto-theaters').on('click', function() {
        if (md.zip) {
            md.getTheaters(zip);
        } else {
            console.log('no zipcode selected yet');
        }
    });

    // navbar back to movies option
    $('ul.nav li a#goto-movies').on('click', function() {
        if (md.theater) {
            md.showMovies(md.theater, rt);
        } else {
            window.location = '/';
        }
    });

    // Get movies currently in theaters from Rotten Tomatoes API
    $.ajax({
        url: rt.baseUrl + rt.inTheaters + rt.apikey + rt.perPage,
        dataType: "jsonp",
        success: function(data){
            rt.rt_info = data['movies'];
            $('#movies').html(Mustache.render($('#intheaters_template').html(), rt.rt_info));
        }
    });


    // Shows all movies at a particular theater
    $('body').on('click', '.theater-link', function(){
        md.theater_id = Number($(this).attr('id'));
        md.theater = md.theaters[md.theater_id];

        //New view with pictures
        md.showMovies(md.theater, rt);
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
        var selected_movies = new Array(),
            count = 0,
            movie_id;
        $('input:checked').each(function(){
            count += 1;
            if ($(this).is(':checked')){
                movie_id = Number($(this).attr('value'));
                selected_movies.push(movie_id);
            }
        });
        if (count<2){
            // Popover not working
            $('#choose').popover({title:'test'});
            // alert('choose more than 1 movie');
        }
        else {
            md.showSelected(selected_movies);
        }
    });
});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function setupCSRF(){
    var csrftoken = $.cookie('csrftoken');

    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

function resetTime(){
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

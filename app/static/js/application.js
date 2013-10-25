$(document).ready(function(){
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
    $('body').on('click', '.theater-link', function(){
        id = $(this).attr('id');
        console.log(id)
        theater = theaters[id];
        for (var i=0; i<theater['movies'].length; i++){
            theater['movies'][i]['id'] = i
        }
        console.log(theater);
        $('#container').html(Mustache.render($('#theater').html(), theater));
        // Once user clicks on theater, show movies playing (js and mustache)
        // Prompt user to select movies (checkboxes)
        // Once submitted, graph movies (find JS library)
    });
    var selected = new Array();
    $('body').on('click', 'input', function(){
        console.log('input checked');
        
    })
});
$(function(){

    var lat1,lon1;
    var map;

    ////////////////
    /////MODELS/////
    ////////////////

    var Beer = Backbone.Model.extend({
        urlRoot: '/api/v1/nearby/',

        url: function() {
            beer_url = Backbone.Model.prototype.url.apply(this);
            console.log(this);
            console.log(beer_url);
            if (lat1 && lon1) {
                beer_url += '?lat=' + lat1 + '&lng=' + lon1;
                if (name){
                    beer_url += '&name__icontains=' + name
                }
            }
            name = ''
            return beer_url;
        },

        initialize: function(){
        },

        set: function(attrs) {
            if (attrs.bars) {
                attrs['barCollection'] = new BarCollection(attrs.bars);
            }
            return Backbone.Model.prototype.set.apply(this,[attrs]);
        },

        get_num_bars: function() {
            return this.get('bars').length;
        },

        get_name: function(){
            return this.get('name');
        },

        get_markers: function(){
            for (i in this.get('bars')){
                var lat = this.get('bars')[i]['lat'];
                var lng = this.get('bars')[i]['lng'];
                position = new google.maps.LatLng(lat,lng);
                marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: this.get('bars')[i]['name']
                });
            }
        },
    });

    var Bar = Backbone.Model.extend({
        urlRoot: '/api/v1/bars',

        initialize: function() {
            this.set_distance();
            // var add = new RequestsAddCollection({'barId': this.get('id')});
            // add.fetch();
            // this.set({
            //     'addRequests': add
            // });
        },

        get_num_beers: function(){
            return this.get('beers').length;
        },

        set: function(attrs) {
            if (attrs.beers) {
                attrs['beerCollection'] = new BeerCollection(attrs.beers);
            }
            return Backbone.Model.prototype.set.apply(this,[attrs]);
        },

        set_distance: function(){
            var lat2 = this.get('lat'),
                lon2 = this.get('lng');
            var R = 3958; // Radius of the earth in mi
            var dLat = (lat2-lat1)*(Math.PI/180);
            var dLon = (lon2-lon1)*(Math.PI/180);
            var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +Math.cos((lat1)*(Math.PI/180)) * Math.cos((lat2)*(Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c; // Distance in miles (hopefully)
            var numb = d.toFixed(1);
            this.set({ distance: numb });
        },

        getStaticMapUrl: function(){
            var address = this.get('address') + this.get('city') + this.get('state');
            var url = 'http://maps.googleapis.com/maps/api/staticmap?',
                options = {
                    zoom: 15,
                    size: '320x150',
                    sensor: false,
                    visual_refresh: true,
                    key: 'AIzaSyAb6i213xvc72RrJBPH6ItGjlw0I1AJjZU'
                }
                if (address){
                    options.markers = address;
            } else {
                options.markers = 'San Francisco, CA';
                options.center = options.markers;
            }
            for (var i in options){
                url += i + '=' + encodeURI(options[i]) + '&';
            }
            return url;
        }
    });

    var AllBeer = Backbone.Model.extend({
        urlRoot: '/api/v1/beer/',

        initialize: function(){
            console.log('add beer init');
        }
    });


    //////////////////
    ///COLLECTIONS////
    //////////////////

    var NearbyBeers = Backbone.Tastypie.Collection.extend({

        setTerm: function(term){
            name = term;
            return name
        },

        url: function() {
            // return '/api/vi/nearby/?term=' + term
            beer_url = '/api/v1/nearby/?lat=' + lat1 + '&lng=' + lon1
            if (name){
                beer_url += '&name__icontains=' + name
            }
            name = '';
            return beer_url
        },

        model: Beer,

        // what do you pass into a comparator?
        comparator: function(beer){
            return beer.get('barCollection').getClosestBar().get('distance') + '' + beer.get('name');
        }
    });

    var BarCollection = Backbone.Tastypie.Collection.extend({
        model: Bar,

        comparator: function(bar) {
            return bar.get('distance') + ' ' + bar.get('name');
        },

        getClosestBar: function() {
            return this.at(0);
        }
    });

    var BeerCollection = Backbone.Tastypie.Collection.extend({
        model: Beer,

        comparator: function(beer) {
            return beer.get('name');
        },
    });

    /////////////////
    //////VIEWS//////
    ////////////////

    var BeerView = Backbone.View.extend({
        tagName: 'li',
        beerTemplate: _.template($('#beer-template').html()),
        initialize: function(){
            this.$el = $('.all-elements');
            this.listenTo(this.model,'sync',this.render);
        },

        events: {
            'click #want': 'setPreferences',
            'click #favorite': 'setPreferences',
            'click .back': 'goBack'
        },

        setPreferences: function(ev){
            console.log(ev);
            beer = this.model.get('id');
            if (ev['currentTarget']['id'] == 'want'){
                data = {
                    'beer': beer,
                    'type': 1
                }
                $.post('/set_preferences', data, function(data){
                });
            }
            else {
                data = {
                    'beer': beer,
                    'type': 2
                }
                $.post('/set_preferences', data, function(data){
                });
            }
        },

        goBack: function(){
            console.log('clicked');
            window.history.back();
        },

        render: function(){
            this.$el.html(this.beerTemplate({ 'beer': this.model }));
            $(window).scrollTop(0);
            return this
        }
    });    

    //////////////////
    //////ROUTER//////
    //////////////////

    var Workspace = Backbone.Router.extend({
        routes: {
            '*path':                        'home'
        },
        initialize: function(){
        },

        home: function() {
            console.log('view init');
            var beers = new NearbyBeers();
            beers.fetch();
            console.log(beers);
            var nearbyView = new NearbyView({
               collection: beers
            });
        }
    });

//    Initialize router
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            lat1 = position.coords.latitude;
            lon1 = position.coords.longitude;
            var router = new Workspace;
            Backbone.history.start();
        });
    }
    else {
        lat1 = 37.5555;
        lon1 = -122.1;
        var router = new Workspace;
        Backbone.history.start();
    }

});
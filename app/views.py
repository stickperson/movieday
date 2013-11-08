from django.http import HttpResponse
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from datetime import date, datetime, time, timedelta
from time import strptime
from time import mktime
from django.views.decorators.csrf import ensure_csrf_cookie
import requests
import re
import json
import pprint
from bs4 import BeautifulSoup
from graph import Node, Graph

pp = pprint.PrettyPrinter(indent=4)

@ensure_csrf_cookie
def home(request):
    c = {}
    c.update(csrf(request))
    return render_to_response('index.html', c)

# def home(request):
#     return render(request, 'index.html')


def chart(request):
    return render(request, 'chart.html')
    

def convert_to_military(time_str):
    if 'a' in time_str and '12' in time_str:
        hour, minutes = time_str.split(':')
        hour = 0
        result = str(hour) + ':' + minutes[:len(minutes)-1]
    elif 'a' in time_str:
        result = time_str[:len(time_str)-1]
    elif 'p' and '12' in time_str:
        result = time_str[:len(time_str)-1]
    else:
        hour, minutes = time_str.split(':')
        hour = int(hour) + 12
        result = str(hour) + ':' + minutes[:len(minutes)-1]
    print '{} converted to {}'.format(time_str, result)
    return result


def calc_end_time(mtime, dur_hours, dur_minutes):
    duration = timedelta(hours=dur_hours, minutes=dur_minutes)
    start_hour, start_min = [int(t) for t in mtime.split(':')]
    start_time = time(start_hour, start_min)
    dt_end = datetime.combine(date.today(), start_time) + duration
    return dt_end


def calc_start_time(mtime):
    start_hour, start_min = [int(t) for t in mtime.split(':')]
    start_time = time(start_hour, start_min)
    dt_start = datetime.combine(date.today(), start_time)
    return dt_start


def get_nearby(request):
    print request.POST
    start_date = request.POST['start_date']
    zip = request.POST['zip']
    r = requests.get('http://www.fandango.com/{}_movietimes?{}'.format(zip, start_date))
    t = r.text
    soup = BeautifulSoup(t)
    theaters = soup.find_all('div', class_='theaterWrapper')
    results = []
    theater_id = 0
    for theater in theaters:
        t = {}
        t['id'] = theater_id
        theater_id += 1
        # all theaters name
        theater_div = theater.find('div', class_='theater')
        info_div = theater_div.find('h3')
        theater_name = info_div.find('a').contents[0]
        t['name'] = theater_name
        t['movies'] = []
        # all movies names and showtimes at theater
        movie_div = theater.find('ul', class_='showtimes')
        if movie_div == None:
            pass
        else:
            title_divs = movie_div.find_all('div', class_='title')
            print type(title_divs)
            print len(title_divs)
            movie_id = 0
            for title_div in title_divs:
                m = {}
                m['id'] = movie_id
                movie_id += 1
                movie_name = title_div.find('h4').find('a').contents[0].strip()
                # quick fix for getting duration of "NEW!" movies
                span_tags = title_div.find_all('span')
                if len(span_tags) == 1:
                    dur_span = span_tags[0]
                else:
                    dur_span = span_tags[1]
                # also accounts for movies without duration listed
                if dur_span.contents[0].strip() == '':
                    duration = '0 hr 0 min'
                else:
                    rating_duration = dur_span.contents[0].strip().encode('ascii', 'ignore')
                    duration = rating_duration.split(",")[1]
                
                duration_numb = re.sub("[^0-9]", "", duration)
                dur_hours = int(duration_numb[0])
                dur_minutes = int(duration_numb[1:])
                minutes = dur_hours * 60 + dur_minutes
                m['duration'] = duration
                m['minutes'] = minutes
                m['name'] = movie_name
                m['showtimes'] = []
                siblings = title_div.next_siblings # returns a generator
                x = list(siblings) # turns generator into a list 
                showtime_links = x[1].find_all('a', class_='showtime_itr')
                for showtime_link in showtime_links:
                    time = showtime_link.contents[0]
                    time = convert_to_military(time)
                    start_time = calc_start_time(time)
                    end_time = calc_end_time(time, dur_hours, dur_minutes)
                    m['showtimes'].append((start_time, end_time))
                t['movies'].append(m)
            results.append(t)
    data = json.dumps(results, cls=DjangoJSONEncoder)
    # putting encoded data in session b/c of a strange error with 
    # beautiful soup objects
    request.session['results'] = data
    return HttpResponse(data)


def get_session(request):
    data = request.session['results']
    return HttpResponse(data)


def selected(request):
    theater_id = int(request.POST['theater'])
    movie_ids = request.POST['movies']
    # movie_ids was a single unicode element, 
    # needed to re-encode as a utf-8 list and typecast as int for comparison later
    movie_ids = [int(i.encode('utf-8')) for i in movie_ids.strip('[]').split(',')]
    # print out the users selections here
    results = json.loads(request.session['results'])
    user_picks = []
    theater_selection = results[theater_id]
    for movie in theater_selection['movies']:
        if movie['id'] in movie_ids:
            user_picks.append(movie)
    print 'user picks **********************'
    print pp.pprint(user_picks)
    g = Graph()
    for movie in user_picks:
        for i in range(0,len(movie['showtimes'])):
            # now we have to deserialize timestamp data and make datetime obj
            showtime = make_datetime(movie['showtimes'][i])
            print 'showtime'
            print showtime
            g.add_node(movie, showtime)
    # Trying to find a way to loop through all nodes and try to add children
    count = 0
    for main_node in g.node_list:
        # TODO: I think we can make this part better
        for sub_node in g.node_list:
            count += 1
            print '--'*20
            print 'comparison number {}: {} (ending at {}) and {} (starting at {})'.format(count, main_node.name, main_node.end, sub_node.name, sub_node.start)
            g.add_edge(main_node, sub_node)
    for node in g.node_list:
        print '--'*20
        print '{} starting at {} has {} connections and {} unique movies ({})'.format(node.name, node.start, len(node.connected), len(node.unique_movies), node.unique_movies)
    answer = g.get_double_feature()
    print '****final result*****'
    print answer
    data = {}
    data['first_name'] = answer.parent.name
    data['first_id'] = answer.parent.id
    data['first_start'] = answer.parent.start
    data['second_name'] = answer.child.name
    data['second_id'] = answer.child.id
    data['second_start'] = answer.child.start
    data['time_difference'] = answer.weight.seconds
    final_movies = []
    final_movies.append(data)
    final = json.dumps(final_movies, cls=DjangoJSONEncoder)
    return HttpResponse(final)


def make_datetime(timestamps):
    start_timestamp = timestamps[0]
    end_timestamp = timestamps[1]
    start_time_struct = strptime(start_timestamp, "%Y-%m-%dT%H:%M:%S")
    end_time_struct = strptime(end_timestamp, "%Y-%m-%dT%H:%M:%S")
    start_dt = datetime.fromtimestamp(mktime(start_time_struct))
    end_dt = datetime.fromtimestamp(mktime(end_time_struct))
    return (start_dt, end_dt)

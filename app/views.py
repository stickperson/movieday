from django.http import HttpResponse
from django.shortcuts import render
import requests
import re
import json
import pprint
from bs4 import BeautifulSoup

pp = pprint.PrettyPrinter(indent=4)


def home(request):
    return render(request, 'index.html')


# some spans return NEW!
def is_not_new(string):
    if string == 'NEW!':
        return False

    return True

def convert_to_military(time_str):
    if 'a' in time_str:
        result = time_str[:len(time_str)-1]
    elif 'p' and '12' in time_str:
        result = time_str[:len(time_str)-1]
    elif 'a' and '12' in time_str:
        hour, minutes = time_str.split(':')
        hour = 0
        result = str(hour) + ':' + minutes[:len(minutes)-1]
    else:
        hour, minutes = time_str.split(':')
        hour = int(hour) + 12
        result = str(hour) + ':' + minutes[:len(minutes)-1]
    return result

def get_nearby(request):
    zip = request.POST['zip']
    r = requests.get('http://www.fandango.com/{}_movietimes'.format(zip))
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
        title_divs = movie_div.find_all('div', class_='title')
        print type(title_divs)
        print len(title_divs)
        print title_divs[1]
        movie_id = 0
        for title_div in title_divs:
            m = {}
            m['id'] = movie_id
            movie_id += 1
            movie_name = title_div.find('h4').find('a').contents[0].strip()
            rating_duration = title_div.find('span').contents[0].strip().encode('ascii', 'ignore')
            if is_not_new(rating_duration):
                duration = rating_duration.split(",")[1]
                duration_numb = re.sub("[^0-9]", "", duration)
                minutes = int(duration_numb[0])*60 + int(duration_numb[1:])
                m['duration'] = duration
                m['minutes'] = minutes
            m['name'] = movie_name
            m['showtimes'] = []
            siblings = title_div.next_siblings # returns a generator
            x = list(siblings) # turns generator into a list 
            showtime_links = x[1].find_all('a', class_='showtime_itr')
            for showtime_link in showtime_links:
                time = showtime_link.contents[0]
                # convert to military time
                time = convert_to_military(time)
                m['showtimes'].append(time)
            t['movies'].append(m)
        results.append(t)
    data = json.dumps(results)
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
    data = {}
    data['theater'] = theater_id
    data['movies'] = movie_ids
    # print out the users selections here
    results = json.loads(request.session['results'])
    user_picks = []
    theater_selection = results[theater_id]

    for movie in theater_selection['movies']:
        if movie['id'] in movie_ids:
            user_picks.append(movie)

    print 'user picks **********************'
    print pp.pprint(user_picks)
    return HttpResponse(data)

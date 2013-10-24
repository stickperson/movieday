from django.http import HttpResponse
from django.shortcuts import render
import requests
import re
import json
from bs4 import BeautifulSoup


def home(request):
    return render(request, 'index.html')


# some spans return NEW!
def is_not_new(string):
    if string == 'NEW!':
        return False

    return True


def get_nearby(request):
    zip = request.POST['zip']
    r = requests.get('http://www.fandango.com/{}_movietimes'.format(zip))
    t = r.text
    soup = BeautifulSoup(t)
    theaters = soup.find_all('div', class_='theaterWrapper')
    results = []
    for theater in theaters:
        t = {}
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
        for title_div in title_divs:
            m = {}
            movie_name = title_div.find('h4').find('a').contents[0]
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
                m['showtimes'].append(time)
            t['movies'].append(m)
        results.append(t)
    data = json.dumps(results)
    request.session['results'] = data
    return HttpResponse(data)


def get_session(request):
    data = request.session['results']
    return HttpResponse(data)

from django.http import HttpResponse
from django.shortcuts import render
import requests
import json
from bs4 import BeautifulSoup


def home(request):
    return render(request, 'index.html')


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
        print theater_name
        # all movies names and showtimes at theater
        movie_div = theater.find('ul', class_='showtimes')
        title_divs = movie_div.find_all('div', class_='title')

        for title_div in title_divs:
            movie_name = title_div.find('h4').find('a').contents[0]
            m = {}
            m['name'] = movie_name
            m['showtimes'] = []
            siblings = title_div.next_siblings # returns a generator
            x = list(siblings) # turns generator into a list 
            showtime_links = x[1].find_all('a', class_='showtime_itr')
            # print '%s is playing at %s at the following times: ' % (movie_name, theater_name)
            for showtime_link in showtime_links:
                time = showtime_link.contents[0]
                m['showtimes'].append(time)
                # print time
            t['movies'].append(m)
        results.append(t)
    data = json.dumps(results)
    print type(data)
    print type(results)
    return HttpResponse(data)

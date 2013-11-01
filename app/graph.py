from datetime import date, datetime, time, timedelta


class Vertex(object):
    def __init__(self, movie, showtime):
        self.neighbors = {}
        self.id = movie['id']
        self.name = movie['name']
        self.start = showtime[0]
        self.end = showtime[1]

    # Returns weight in seconds. We are not passing in a day, so if the next movie starts before a movie ends
    # this method would still return a positive number (because of datetime)
    # e.g. self vertex ends at 1:00 and neighbor starts at 12:30. This would return 23:30
    # Set cutoff to 12 hours for now
    def calc_weight(self, neighbor):
        print 'calculating weight'
        fmt = '%H:%M'
        t = datetime.strptime(neighbor.start, fmt) - datetime.strptime(self.end, fmt)
        seconds = t.seconds
        hours = seconds//3600
        if hours > 12:
            return False
        print '{} has a neighbor {} whose weight is {}'.format(self.name, neighbor.name, seconds)
        return seconds

    def different_movie(self, neighbor):
        if neighbor.id == self.id:
            print 'same movie'
            return False
        else:
            print 'different movie!'
            return True

    def add_neighbor(self, neighbor):
        print 'adding neighbor'
        if self.different_movie(neighbor):
            weight = self.calc_weight(neighbor)
            self.neighbors[neighbor] = weight


class Graph(object):
    def __init__(self):
        self.vert_list = {}
        self.num_verts = 0

    def add_vert(self, movie, showtime):
        vertex = Vertex(movie, showtime)

        # Rethink following line. What if there are duplicate keys?
        self.vert_list[showtime[0]] = vertex
        self.num_verts += 1
        return vertex

    def add_edge(self, start_vert, end_vert):

        # Duplicate keys may be a problem here.
        self.vert_list[start_vert.start].add_neighbor(end_vert)

# Sample movie list
# movies = [{
#     'id': 0,
#     'name': 'Movie 1',
#     'showtimes':[(1200, 1330), (1245, 1415), (1330, 1500)]
# }, {
#     'id': 1,
#     'name': 'Movie 2',
#     'showtimes': [(1240, 1400),(1340, 1500)]
# }]

# Sample graph
# g = Graph()
# for movie in movies:
#     for i in range(0,len(movie['showtimes'])):
#         start = movie['showtimes'][i][0]
#         end = movie['showtimes'][i][1]
#         g.add_vert(movie, movie['showtimes'][i])



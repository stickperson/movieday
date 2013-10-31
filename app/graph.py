from datetime import date, datetime, time, timedelta


class Vertex(object):
    def __init__(self, movie, showtime):
        self.neighbors = {}
        self.id = movie['id']
        self.name = movie['name']
        self.start = showtime[0]
        self.end = showtime[1]

    # Returns weight in seconds. We are not passing in a day, so if the next movie starts before a movie ends
    # this method would still return a positive number 
    # e.g. self vertex ends at 1:00 and neighbor starts at 12:30. This would return 23:30
    # Set cutoff to 12 hours for now
    def calc_weight_seconds(self, neighbor):
        fmt = '%H:%M'
        t = datetime.strptime(neighbor.start, fmt) - datetime.strptime(self.end, fmt)
        seconds = t.seconds
        hours = seconds//3600
        if hours > 12:
            return False
        return seconds

    def different_movie(self, neighbor):
        if neighbor['id'] == self.id:
            return False
        else:
            return True

    # will fix weight calculation
    def add_neighbor(self, neighbor):
        if self.different_movie(neighbor):
            weight = self.calc_weight(self, neighbor)
            self.neighbors[neighbor] = weight


class Graph(object):
    def __init__(self):
        self.vert_list = {}
        self.num_verts = 0

    def add_vert(self, movie, showtime):
        vertex = Vertex(movie, showtime)
        self.vert_list[showtime[0]] = vertex
        self.num_verts += 1
        return vertex

    def add_edge(self, start_vert, end_vert):
        # need to pass in showtime in if/else statements
        if start_vert not in self.vert_list:
            vertex = self.add_vert(start_vert)
        elif end_vert not in self.vert_list:
            vertex = self.add_vert(end_vert)
        self.vert_list[start_vert].add_neighbor(end_vert)

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



class Vertex(object):
    def __init__(self, movie, showtime):
        self.neighbors = {}
        self.id = movie['id']
        self.name = movie['name']
        self.start = showtime[0]
        self.end = showtime[1]

    def different_movie(self, neighbor):
        if neighbor['id'] == self.id:
            return False
        else:
            return True

    # will fix weight calculation
    def add_neighbor(self, neighbor):
        if different_movie():
            weight = self.end - neighbor.start
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
        if start_vert not in self.vert_list:
            vertex = self.add_vert(start_vert)
        if end_vert not in self.vert_list:
            vertex = self.add_vert(end_vert)
        self.vert_list[start_vert].add_neighbor(end_vert)


movies = [{
    'id': 0,
    'name': 'Movie 1',
    'showtimes':[(1200, 1330), (1245, 1415), (1330, 1500)]
}, {
    'id': 1,
    'name': 'Movie 2',
    'showtimes': [(1240, 1400),(1340, 1500)]
}]

g = Graph()
for movie in movies:
    for i in range(0,len(movie['showtimes'])):
        start = movie['showtimes'][i][0]
        end = movie['showtimes'][i][1]
        g.add_vert(movie, movie['showtimes'][i])

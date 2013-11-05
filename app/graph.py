from datetime import date, datetime, time, timedelta


class Node(object):
    def __init__(self, movie, showtime):
        self.unique_movies = []
        self.connected = []
        self.id = movie['id']
        self.name = movie['name']
        self.start = showtime[0]
        self.end = showtime[1]
        self.unique_key = '{} - {}'.format(self.id, self.start)
        
    def calc_weight(self, child):
        print 'calculating weight'
        # in timedelta format
        weight = child.start - self.end
        return weight

    def different_movie(self, child):
        if child.id == self.id:
            print 'same movie'
            return False
        else:
            print 'different movie!'
            return True

    def is_unique(self, name):
        if name in self.unique_movies:
            return False
        else:
            return True

    def add_child(self, child):
        if self.different_movie(child):
            weight = self.calc_weight(child)
            # time between movies must be more than 5 minutes
            # maybe have it initially at 0 and give users an option?
            if weight > timedelta(minutes=5): 
                if self.is_unique(child.name):
                    self.unique_movies.append(child.name)
                print 'adding child' 
                print '{} has a child {} whose weight is {}'.format(self.name, child.name, weight) 
                self.connected.append(Weight(child, weight))

    def __repr__(self):
        return '{} - ({}:{} - {}:{})'.format(self.name, self.start.hour, self.start.minute, self.end.hour, self.end.minute)


class Weight(object):
    def __init__(self, node, weight):
        self.node = node
        self.weight = weight

    def __repr__(self):
        return '{} - {}'.format(self.node.name, self.weight)


class Graph(object):
    def __init__(self):
        self.node_list = []
        self.num_nodes = 0

    def add_node(self, movie, showtime):
        node = Node(movie, showtime)
        self.node_list.append(node)
        self.num_nodes += 1
        return node

    def add_edge(self, start_node, end_node):
        # Duplicate keys may be a problem here.
        if start_node not in self.node_list:
            self.node_list.append(start_node.add_child(end_node))
        else:
            start_node.add_child(end_node)


    def get_double_feature(self):
        time_now = datetime.now()
        hour_from_now = time_now + timedelta(hours=1)
        start_movies = filter(None, [node if node.start < hour_from_now else '' for node in self.node_list])
        for movie in start_movies:
            print '{} has children: {}'.format(movie.name, movie.connected)
        print start_movies

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



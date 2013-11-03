from datetime import date, datetime, time, timedelta


class Node(object):
    def __init__(self, movie, showtime):
        self.connected = []
        self.id = movie['id']
        self.name = movie['name']
        self.start = showtime[0]
        self.end = showtime[1]
        self.unique_key = '{} - {}'.format(self.id, self.start)

    # Returns weight in seconds. We are not passing in a day, so if the next movie starts before a movie ends
    # this method would still return a positive number (because of datetime)
    # e.g. self node ends at 1:00 and child starts at 12:30. This would return 23:30
    # Set cutoff to 12 hours for now
    def calc_weight(self, child):
        print 'calculating weight'
        # in timedelta format
        weight = child.start - self.end
        print '{} has a child {} whose weight is {}'.format(self.name, child.name, weight)
        if int(weight.total_seconds()) < 0:
            return False
        return weight

    def different_movie(self, child):
        if child.id == self.id:
            print 'same movie'
            return False
        else:
            print 'different movie!'
            return True

    def add_child(self, child):
        print 'adding child'
        if self.different_movie(child):
            if self.calc_weight(child):
                weight = self.calc_weight(child)
                # time between movies must be more than 5 minutes
                # maybe have it initially at 0 and give users an option?
                if weight > timedelta(minutes=5):   
                    self.connected.append(Weight(child, weight))


class Weight(object):
    def __init__(self, node, weight):
        self.node = node
        self.weight = weight


class Graph(object):
    def __init__(self):
        self.node_list = {}
        self.num_nodes = 0

    def add_node(self, movie, showtime):
        node = Node(movie, showtime)
        self.node_list[node.unique_key] = node
        self.num_nodes += 1
        return node

    def add_edge(self, start_node, end_node):

        # Duplicate keys may be a problem here.
        self.node_list[start_node.unique_key].add_child(end_node)

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



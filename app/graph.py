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
                self.connected.append(Weight(self, weight, child))

    def __repr__(self):
        return '{} - ({}:{} - {}:{})'.format(self.name, self.start.hour, self.start.minute, self.end.hour, self.end.minute)


class Weight(object):
    def __init__(self, parent, weight, child):
        self.parent = parent
        self.weight = weight
        self.child = child

    def __repr__(self):
        return '{} - {} - {}'.format(self.parent.name, self.weight, self.child.name)


class Graph(object):
    def __init__(self):
        self.node_list = []
        self.num_nodes = 0
        self.time_now = datetime.now()

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

    def get_min_child(self, start_movies):
        double_features = []
        # for each movie that has connections, returns the connection with the smallest weight
        # movie.connected is a list of weight objects, each with the parent and child nodes
        for movie in start_movies:
            if movie.connected != []:
                print '{} has children: {}'.format(movie.name, movie.connected)
                min_node = movie.connected[0]
                for m in movie.connected:
                    if (m.weight < min_node.weight):
                        min_node = m
        
                double_features.append(min_node)
        print '**************'
        min_node = double_features[0]
        for feature in double_features:
            print feature
            # there can be more than one option with the same weight
            # need to modify this function to deal with that
            if feature.weight < min_node.weight:
                min_node = feature
        return min_node
        # now recurse
        # I think we need to implement a stack or queue here in order to 
        # keep track of where we have been as we traverse the graph
        #if min_node.connected != []

    def get_double_feature(self):
        # this line won't work for looking at tomorrow's movies
        # start_movies = filter(None, [node if node.start < (self.time_now + timedelta(hours=1)) else '' for node in self.node_list])
        min_node = self.get_min_child(self.node_list)
        print "The Best Option is: {}".format(min_node)


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



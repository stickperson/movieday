from datetime import date, datetime, time, timedelta
from django.utils import timezone


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
        #print 'calculating weight'
        # in timedelta format
        weight = child.start - self.end
        return weight

    def different_movie(self, child):
        if child.id == self.id:
            #print 'same movie'
            return False
        else:
            #print 'different movie!'
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
                #print 'adding child'
                #print '{} has a child {} whose weight is {}'.format(self.name, child.name, weight)
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
        print self.time_now
        # print tzinfo.tzname

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
                #print '{} has children: {}'.format(movie.name, movie.connected)
                min_node = movie.connected[0]
                for m in movie.connected:
                    #print 'printing weights'
                    #print m.weight
                    #print min_node.weight
                    if (m.weight < min_node.weight):
                        min_node = m
                double_features.append(min_node)
            else:
                print "SELECTED MOVIES HAVE NO CHILDREN"
        print '**************'
        print 'double_features'
        print double_features
        if len(double_features) == 0:
            return None
        else:
            min_node = double_features[0]
            for feature in double_features:
                # there can be more than one option with the same weight
                # need to modify this function to deal with that
                if feature.weight < min_node.weight:
                    min_node = feature
            return min_node
            # now recurse
            # I think we need to implement a stack or queue here in order to
            # keep track of where we have been as we traverse the graph
            #if min_node.connected != []

    def get_double_feature(self, dt_user_start):
        # TODO: should these be prioritized at all by what is closest to the target time
        start_movies = filter(None, [node if node.start < (dt_user_start + timedelta(hours=2)) and node.start > dt_user_start else '' for node in self.node_list])
        print '********START MOVIES*********'
        print start_movies
        print '******************************'
        if len(start_movies) == 0:
            return None
        else:
            min_node = self.get_min_child(start_movies)
            print "The Best Option is: {}".format(min_node)
            return min_node



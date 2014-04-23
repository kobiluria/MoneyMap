# coding: utf-8


####################### To Do list ##################################

#####################################################################



__author__ = 'kobi_luria'

import requests
import objects
import tools
import pymongo
import json
import pickle


################## END_POINTS  #################################:

NOMINATIM = 'http://nominatim.openstreetmap.org/search?accept-language=en-us&q='
NOMINATIM_FORMAT = '&format=json&polygon_geojson=1&addressdetails=1'
API = 'http://staging.openmuni.org.il/'
VERSION = 'v1/'
ENTITIES = 'entities/'

#################################################################


# establish a connection to the database
# note this uses the now deprecated Connection class, as we did in the lecture.
# MongoClient is the preferred way of connecting.
connection = pymongo.Connection("mongodb://localhost", safe=True)

# get a handle to the school database
db = connection.entitydb
entities = db.entities


def get_geojson_for_muni(search_string):
    """
    this funcction gets the geo GIS coordinate for each entity.
    the function currently calles the NOMINATIM server with a search string.
    The only case which a result is picked is if the osm-type is a relation i.e its
    a entity in the open street map system.
    :param search_string: the search string that the nominatim server should run.
    :return: if a entity is found a polygon json is returned else None.
    """
    #TODO i think we can run a for loop in the results in case their is more then one.
    url = NOMINATIM + search_string + NOMINATIM_FORMAT
    result = requests.get(url)

    data = json.loads(result.text)

    if len(data) == 0:
        return None  # their were no results from the nominatim server.
    data = data[0]

    if data['geojson'] and data['osm_type'] == 'relation':
        polygon = data['geojson']
        return polygon  # found a hit
    else:
        return None  # the search results didn't come up with a entity.


def get_entity_polygon(entity):
    """
    this is a caller function which sends a search request to the muni finder. and iterates on all search strings.
    if found a match it will return a entity geojson feature. o
    this funciton will print the search results which were found and not found.
    A file with all entitys not found will be proccesed in the higher level.

    :param entity: the entity which is searched for in the GIS databases
    :return: True if found and added the feature to the object , False otherwise.
    """
    for name in entity.search_list:
        polygon = get_geojson_for_muni(name)
        if polygon:
            print '****************** found : ' + name + '*********************************'

            entity.add_polygon(polygon)
            return True
        else:
            print '******************** did not find ************    ' + name + '  ********** '

    return False



def get_district_and_muni(url, entity_list):
    """
    This is the district and muni finder main() .
    it searchs a url from the open-muni API for all results and finds all
    Gis data it can find using these results.

    :param url: the url which is the lookup for all muni's in the open-muni API
    :param entity_list: the entity_list this is mostly here because of the recursive behivior of the function.
    :return: returns a entity dictionary which has all entity's found and all which aren't.
    """
    print url
    data = tools.get_data_as_dict(url)
    next_page = ''
    if data['next']:
        next_page = data['next']
    results_list = data['results']
    for result in results_list:
        if not result['name_en']:
            #TODO add support for results with no english keyword
            continue  # if their is no name in english. i can't store the files for now so continue.
        entity = objects.entity(result)
        if get_entity_polygon(entity):
            entity_list['found'].append(entity)  # if found add to the entity list
            # add it to the mongodb :
            #TODO check for an update or an insert , if update add a timestap

            succses = entities.findOne({'code':entity.code , 'polygon':entity.polygon},{entity.get_json})
            if(succses):
                continue
            else:
                entities.insert


        else:
            entity_list['not_found'].append(entity)
    if next_page:
        get_district_and_muni(next_page, entity_list)
    return entity_list


###############################        driver :    ####################################




# this creates a list of found and unfound entitys in the open street database.
entity_list = get_district_and_muni(API + VERSION + ENTITIES + '?domains=1', {'found': [], 'not_found': []})
# i pickle it for backup and for static writes to files .
pickle.dump(entity_list, open('/home/kobi/projects/MoneyMap/static/MoneyMapPickle', 'wb'))


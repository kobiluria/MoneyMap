__author__ = 'kobi'

import json
import pickle
import os


DIR_PROJECT = '/home/kobi/projects/MoneyMap'
DIR = '/home/kobi/projects/MoneyMap/static/maps'
GEO_JSON = '.geojson'


def make_feature(json_polygon, json_properties):
    """
    make a feature geojson from a json-polygon object.
    this function just wrappes the polygon and the feature properties
    into the the json feature. the properties can then be viewed in any map!
    :param json_polygon: the polygon of a muni or district.
    :param json_properties: the properties which are added on to the coordinate polygon.
    :return: the feature which is a coordinates and properties.
    """
    feature = {'type': 'Feature', 'geometry': json_polygon, 'properties': json_properties}
    return feature


def create_features_for_entites(entity_list):
    for entity in entity_list:
        properties = {'name_en': entity.name_en, 'id': entity.id, 'code': entity.code,
                          'division_id' : entity.division_id,
                          'copyright': 'ODBL , http://www.openstreetmap.org/copyright'}
        feature = make_feature(entity.polygon, properties)
        entity.add_geojson_feature(feature)



def write_to_file(parent_path, name_en, json_object):
    """
    write a polygon object which is a muni or district to file. this method will produce all
    the folders and file for the single muni and district files.

    :param parent_path: the parent path to write this file
    :param name_en: the name of the file or object.
    :param json_object: the json object which is written to file.
    :return:
    """
    dir_path = os.path.join(DIR, parent_path).rstrip(name_en).replace(' ', '_').lower()
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    path = os.path.join(dir_path, name_en + GEO_JSON).replace(' ', '_').lower()
    f = open(path, 'w+')
    json.dump(json_object, f)
    f.close()


def write_entities_to_file(entity_list):
    """
    Write all entites from a list of entity objects to file.
    the file which the entity will be writen to is depended on the file path and parent's name of the entity.
    i.e each muni , if the muni has a district the muni will be placed under the district.
    :param entity_list: the entity list to add to folders and files.
    """
    print 'writing ' + str(len(entity_list)) + ' to file'
    for entity in entity_list:
        write_to_file(entity.parent_path, entity.name_en, entity.geojson)




entity_list = pickle.load(open('/home/kobi/projects/MoneyMap/static/MoneyMapPickle', 'rb'))
create_features_for_entites(entity_list['found']) # create features for all the entites found.
print 'amount found : ' + str(len(entity_list['found']))
print 'amount not found : ' + str(len(entity_list['not_found']))
write_entities_to_file(entity_list['found'])
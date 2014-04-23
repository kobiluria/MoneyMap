
import pymongo
import sys
import json
import pickle
import datetime


# establish a connection to the database
# note this uses the now deprecated Connection class, as we did in the lecture.
# MongoClient is the preferred way of connecting.
connection = pymongo.Connection("mongodb://localhost", safe=True)

# get a handle to the school database
db = connection.entitydb
entities = db.entities

cursor = entities.find()
for item in cursor:
    entities.remove(item)
    entities.insert({'_id':'23.08.2013.'+item['code'],'code':item['code'],'coordinates':item['coordinates'],'name_en':item['name_en']})
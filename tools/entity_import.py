
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
    #entities.remove(item)
    print item['code']
    if item['code'] == '':
        entities.remove(item)
        continue
#TODO we need to remove duplicets
    else:
        entities.remove(item)
        code = entities.insert({'code':int(item['code'].lstrip('0')),'coordinates':item['coordinates'],'name_en':item['name_en']})
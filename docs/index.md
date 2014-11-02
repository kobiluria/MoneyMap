
# MoneyMap
A REST API and GUI for GeoJSON of cities

---

## Overview

**MoneyMap** is a REST API and GUI for presenting Polygon [GeoJSON](http://geojson.org/) of cities.

**MoneyMap** is also a web API for querying budget data by geospatial data.

**MoneyMap** is written in JavaScript and is open source software released under a BSD license.

**MoneyMap** is a sub-project of the [OpenBudget](https://github.com/openbudgets/openbudgets) project , a web app and web API for storing, accessing, visualizing and comparing budgetary data.

**MoneyMap** and [OpenBudget](https://github.com/openbudgets/openbudgets) are projects of the [Public Knowledge Workshop](http://www.hasadna.org.il/en/), a non-profit organization in Israel dedicated to data transparency in government.

---

## Version

Very Alpha 1.0

---

## API-ENDPOINTS

###API-Head :  
The head of this API

[API-Head](http://api-moneymap.rhcloud.com/api). ``` GET http://api-moneymap.rhcloud.com/api```

###API-Entities
The Entities / Cities EndPoint.

This API Endpoint will return all
entities in the system with relevent URL's.

[Entities](http://api-moneymap.rhcloud.com/api/entities) : ```GET http://api-moneymap.rhcloud.com/api/entities```


###API-Maps
All queries from this endpoint will get a GeoJSon response which could be used in any Map Client.
[MAPS](http://api-moneymap.rhcloud.com/api/maps/<Options>) : ``` GET http://api-moneymap.rhcloud.com/api/maps```

#### List of Options for maps endpoint:

1. *Query by Id* - Query using a Open Muni ID, use the Open Muni API to get a id you want to map 
 ```GET http://api-moneymap.rhcloud.com/api/maps/:id```

2. *Query by muni code* - Query using an Offical muni-code.```muni_code``` ```GET http://api-moneymap.rhcloud.com/api/maps/?muni_code=<muni_code>```

3. *Query by lat lng coordinates* - Get the nearst cities to a geo point. you need a
```lat``` and ```lng``` info plus please provide a limit ```limit``` to the query.
currently a limit of 5 object will be returned in the max scenario
 ```GET http://api-moneymap.rhcloud
 .com/api/maps/?spatial=true&lat=<lat>&lng=<lng>&limit=<limit>```


###API-Spatial
Get info and distance of current city from a ```lat``` ```lng``` point. This Query will
return a list of entities and their distance from the point.
```GET http://api-moneymap.rhcloud.com/api/spatial/?lat=<lat>&lng=<lng>```

___

## GUI-ENDPOINTS
All GUI results will be presented using Leflet.js Map client.

[GUI](http://api-moneymap.rhcloud.com/gui/maps/<Options>) : ```http://api-moneymap.rhcloud.com/gui/maps/```
### List of Options:
*Gui by Id* - Query using a Open Muni ID, use the Open Muni API to get a id you want to
 map
 ```http://api-moneymap.rhcloud.com/gui/maps/:id```

*Gui by lat lng coordinates* - Get the nearst cities to a geo point. you need a
```lat``` and ```lng``` info plus please provide a limit ```limit``` to the query.
currently a limit of 5 object will be returned in the max scenario
 ```http://api-moneymap.rhcloud
 .com/gui/maps/?spatial=true&lat=<lat>&lng=<lng>&limit=<limit>```

---
## API-ENDPOINTS For Collaborators
(*Note you need to sign in Github and be a Collaborator*)

Auth is done to limit the overhead of the openshift server and keep maintenance clean
and sensible. This operation uses passport.js and Github Auth2.0.
use Login before you query

### API-Login
Hit this url before you use the other ones.

[API-Login](http://api-moneymap.rhcloud.com/api/login) : ``` GET http://api-moneymap.rhcloud.com/api/login```

### API-mapAll
get a GeoJSON for all the enitites in the system. note that you will get
back about 6MB.

[API-mapAll] (http://api-moneymap.rhcloud.com/api/mapAll) : ``` GET http://api-moneymap.rhcloud.com/api/mapAll```

###API-add 
add a enitity by supplying a ```omuni_id``` the id used in the Open Muni API and a ```osm_id``` a corresponding id from Open Street Map. Note that this is a ```POST``` Operation.

[API-add](http://api-moneymap.rhcloud.com/api/add) : ```POST
http://api-moneymap.rhcloud.com/api/add ```

###API-upload 
add a list of entities by supplying a csv file. one column
of```omuni_id```  the id used in the Open Muni API and a ```osm_id``` a corresponding id from Open Street Map in the in the other column . Note that this is a ```POST``` operation.
``` POST http://api-moneymap.rhcloud.com/api/upload ```

## Tech

MoneyMap uses a number of open source projects to work properly:

[node.js](http://nodejs.org) - evented I/O for the backend.

[Express](http://expressjs.com) - fast node.js network app framework.

[MongoDB](http://www.mongodb.org/) - best DB ever.

[MkDocs](http://www.mkdocs.org) - markdown to html. see [license](http://www.mkdocs.org/about/license/#included-projects)

---

## License

BSD

**Free Software, Hell Yeah!**

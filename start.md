

the MoneyMap project has two main objectives:

#### RESTful API
A city or municeplity in the system is called a entity. 
A entity is an object which could be expended or could represent a conty or 
country and therfore is called a entity. the server collects and stores polygon
 data of entities. the database includes polygon history data in order to keep
a record of cities  borders during history. 
    
In this project the polygon data is scripted using the Nominatim - 
Open Street Map engine.
    
Data is inputed by a tuple of 
```(city_code:osm_id) ```

Becuase the project is a sub project of the ***open budget*** project
the```(city_code)``` used is the same as the ```entity_id``` in the open budget
project database. The choice to use the ```entity_id``` is for simplicty issues. 
In genral most cities have offical country codes. City codes could be 
identified by their offical code too. 
    
    
the API includes a few operations :
    
1. **Admin** operations = adding and updating entities in the database. 
2. **Query by ID** = query polygon data by suplying an id. 
3. **Query by size** = query cities by thier size, computed with thier polygon repersntion. 
4. Query by location =  query either by closet to the user. or by lan,lat coordinates. 
    
    

#### A Github client for data 
 
the most updated data of polygons will be arranged on a github repo as JSONP
 objects which could be
accsesd via gh-pages branch. the client will download all of the polygon data 
using Github pages. and 
give a user a option of query data using a client side JS mapping framework.
    
functionaly will include:
    
1. query by size of polygon;
2. query by i.d.
3. upload a CSV with a table of scores and obtain a MAP with a heatmap by cities
scores. 

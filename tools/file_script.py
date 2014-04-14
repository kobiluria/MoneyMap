# coding: utf-8


__author__ = 'kobi'
import csv
import string
import json

colorCode = {10:'#990000',9:'#993300',8:'#996600',7:'#996633',6:'#996666',5:'#996699',4:'#9966cc',3:'#9966ff',2:'#9999ff',1:'#99ccff'}

year = {}
for i in range(0,9):
    csv_file = open('/home/kobi/projects/open_gis/tools/tax.csv' ,"r+")
    csv_reader = csv.reader(csv_file)
    csv_reader.next()
    tax_index = {}
    for line in csv_reader:
        if(line[0] == '#N/A'):
            continue
        tax_index[int(line[0])] = line[1+i]

    year[2003+i] = tax_index
    csv_file.close()
print year[2009]

for i in range(0,9):
    geo_json_file = open('/home/kobi/projects/open_gis/the_map/THEMAP.geojson',"r+")
    geo_json_data = json.load(geo_json_file)
    tax_year = open('/home/kobi/projects/open_gis/tax_map/' + str(int(2003+i)) + '.geojson' , 'w+' )
    features = geo_json_data['features']
    new_features= []
    for feature in features:
        str_code = feature['properties']['code']
        code = string.lstrip(str_code,'0')
        if code == '':
            continue
        code = int(code)
        if not year[2003+i].has_key(code):
            continue
        code = year[2003+i][code]

        if code == '':
            continue

        code = int(code)

        feature['properties']['fill'] = colorCode[code]
        feature['properties']["fill-opacity"] = 0.95
        new_features.append(feature)
    geo_json_data['features'] = new_features
    json.dump(geo_json_data,tax_year)
    geo_json_file.close()

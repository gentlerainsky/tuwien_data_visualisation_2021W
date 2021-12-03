import pandas as pd
from shapely.geometry import shape, GeometryCollection, Point
import json

data_df = pd.read_csv('./data/2021-06-metropolitan-stop-and-search.csv')

# handle Self-defined ethnicity column
ethnicity_set = set()

for row in data_df['Self-defined ethnicity'].str.split('/'):
    if type(row) is list:
        ethnicity_set = ethnicity_set.union(set(row))
eth_dict = {}
for eth in ethnicity_set:
    eth_dict[eth] = []

index = 0
for row in data_df['Self-defined ethnicity'].str.split('/'):
    for eth in ethnicity_set:
        eth_dict[eth].append(0)
    if type(row) is list:
        for item in row:
            eth_dict[item][index] = 1
    index += 1

eth_df = pd.DataFrame(eth_dict)
eth_df = pd.concat([data_df, eth_df], axis=1)

# reverse geo-coding
with open('./data/london_boroughs.json', 'r') as f:
    js = json.load(f)
borough_df = eth_df.copy()
borough_df['borough_id'] = 0
borough_df['borough_name'] = ''

for index, row in borough_df.iterrows():
    point = Point(row.Longitude, row.Latitude)
    for feature in js['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(point):
            borough_df.loc[row.name, 'borough_id'] = feature['properties']['id']
            borough_df.loc[row.name, 'borough_name'] = feature['properties']['name']
            continue

# Save the file
borough_df[[
    'Date',
    'Type',
    'Latitude',
    'Longitude',
    'borough_id',
    'borough_name',
    'Gender',
    'Age range',
    'Self-defined ethnicity',
    'Officer-defined ethnicity',
    'Legislation',
    'Object of search',
    'Outcome',
    'Multiple ethnic groups - White and Black African',
    'Black British - African', 'White - English',
    'Multiple ethnic groups - White and Asian',
    'Other ethnic group - Not stated', 'African',
    'White - Any other White background',
    'Asian British - Any other Asian background', 'Asian British - Indian',
    'Other ethnic group - Any other ethnic group', 'Black',
    'Black British - Any other Black',
    'Multiple ethnic groups - Any other Mixed', 'Caribbean', 'Asian',
    'Multiple ethnic background', 'White - Irish',
    'Asian British - Bangladeshi', 'British', 'Scottish',
    'Asian British - Pakistani', 'Mixed', 'Welsh',
    'Black British - Caribbean', 'Northern Irish',
    'Asian British - Chinese',
    'Multiple ethnic groups - White and Black Caribbean',
    'Caribbean background'
]].to_csv('./data/police.csv', index=False)

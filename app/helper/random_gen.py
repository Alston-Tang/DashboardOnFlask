__author__ = 'tang'


import random


def area_random(data):
    b = float(data[0]['close'])
    bb = float(data[0]['close'])
    for item in data:
        item['close'] = float(item['close'])+random.random()*160-80
        item['close'] = (b + bb + item['close'])/3
        if item['close'] < 0:
            item['close'] = 0
        bb = b
        b = item['close']
    return data


def pie_random(data):
    if 'size' in data:
        data['size'] += int(random.random()*1000-500)
        return data
    elif 'children' in data:
        for sublayer in data['children']:
            pie_random(sublayer)
        return data
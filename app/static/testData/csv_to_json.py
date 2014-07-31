import csv, json

data = []

with open('test.tsv', 'r') as tsv:
    first = True
    for line in csv.reader(tsv, dialect='excel-tab'):
        if first:
            first = False
        else:
            data.append({'date': line[0], 'close': line[1]})

    print (json.dumps(data))
from flask import render_template, url_for
from app import app
import json


@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")


@app.route('/<page_name>')
def page(page_name):
    return render_template(page_name+'.html')


@app.route('/chart/<chart_id>')
def chart_request_handle(chart_id):
    print(chart_id)
    if chart_id == 'b':
        from app.helper import random_gen
        from app.data import area
        area = random_gen.area_random(area)
        return json.dumps(area)
    elif chart_id == 'a':
        from app.data import pie
        from app.helper import random_gen
        pie = random_gen.pie_random(pie)
        return json.dumps(pie)
    elif chart_id == 'c':
        from app.data import trace
        return json.dumps(trace[0:100])
from flask import render_template, url_for, request
from app import app
import json


@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")


@app.route('/dashboard/<page_name>')
def page(page_name):
    return render_template(page_name+'.html')


@app.route('/manage/<page_name>')
def manage(page_name):
    return render_template(page_name+'_management.html')


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


@app.route('/test', methods=['GET', 'POST', 'DELETE', 'PUT'])
def test():
    print request.values
    if request.method == 'POST':
        return json.dumps({'success': True, 'id': 1})
    if request.method == 'DELETE':
        return json.dumps({'success': True, 'id': 1})
    if request.method == 'PUT':
        return json.dumps({'success': True, 'id': 1})


@app.route('/scene', methods=['GET', 'POST', 'DELETE', 'PUT'])
def scene_handle():
    print request.values
    if request.method == 'GET':
        return json.dumps({'success': True, 'data': [{'id': 1, 'location': 'Beijing',
                           'name': 'Test Scene', 'desc': 'Hello',
                           'cameras': {1: {'source_url': 'rtmp://10.62.98.123/live/test', 'name': 'Cam1',
                                       'desc': 'Test camera 1', 'location': 'Where is my camera'}},
                           'apps': ['camera_monitoring', 'anomaly_detection', 'trajectory_analytics']}]})
    if request.method == 'POST':
        return json.dumps({'success': True, 'id': 2})
    return 'hello'


@app.route('/scene/camera', methods=['GET', 'POST', 'DELETE', 'PUT'])
def scene_camera_handle():
    return 'hello'


@app.route('/scene/application', methods=['GET', 'POST', 'DELETE', 'PUT'])
def scene_application_handle():
    return 'hello'


@app.route('/rest', methods=['GET','POST'])
def rest():
    print request.values
    return 'hello'
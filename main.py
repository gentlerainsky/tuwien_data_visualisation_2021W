from flask import Flask
from flask import render_template, jsonify, request
from core.data_manager import DataManager
import config
import json


app = Flask(__name__)

data_manager = DataManager(config.POLICE_FILE_PATH)

@app.route('/')
def main(name=None):
    return render_template('dashboard.html', name=name)

@app.get('/api/data')
def line():
    params = request.args.to_dict()
    options = json.loads(params['options'])
    result = data_manager.get_data(options)
    return jsonify(result)

from flask import Flask
from flask import render_template, jsonify
from core.data_manager import DataManager
import config


app = Flask(__name__)

data_manager = DataManager(config.POLICE_FILE_PATH)

@app.route('/')
def hello(name=None):
    return render_template('dashboard.html', name=name)

@app.get('/api/demo')
def api_demo():
    return jsonify(data_manager.data_df.iloc[:10].to_dict(orient='records'))

@app.get('/api/choropleth')
def choropleth():
    return jsonify(data_manager.get_choropleth_data())

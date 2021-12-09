# Police Stop & Search Data Visualisation

The visualisation can be accessed online on Heroku free-tier (Until it is taken down.)

[Visualisation on Heroku](https://police-stop-search-vis.herokuapp.com/)
(Note. Heroku closes a running app after interactive for a while, so it might need some time to load up of the first try.)

[Github Repository](https://github.com/gentlerainsky/tuwien_data_visualisation_2021W)

## Development Detail Overview

The app is developed with Python version 3.8 and Ubuntu (20.04.3 LTS) on Window 10 via WSL.
The web interface is tested on Microsoft Edge Version 96.0.1054.43 (Official build) (64-bit)
with a screen size of approximately 1700 x 960. (The layout might break on a smaller screen size.)

Software Stack used are Flask, JQuery, Bootstrap and D3.js as describe in `Pipfile` and `requirement.txt`.

## Installation

1. Using Pipenv (Preferred Method)
```bash
pipenv install
pipenv shell
python wsgi.py
# or
make run
```

2. Using Pip
```bash
pip install -r ./requirements.txt
python wsgi.py
# or
make run
```

## Project Structure

- `wsgi.py` is used for running the application as a server.
- `Procfile` is used for Heroku deployment.
- `main.py` is used as an entry point of the application.
- `./core` stores backend processing code.
- `./data` stores the dataset file. `police.csv` is the cleaned and preprocessed data used by the application.
- `./templates` is a folder for [Jinja](https://jinja.palletsprojects.com/en/3.0.x/) HTML template.
- `./static/js` stores the core visualisation and interactivity code.
- `./static/geojson` stores Geojson file for London Borough.
- `./script/transform.py` can be used for data preprocessing. The script look for a data file at `./data`.


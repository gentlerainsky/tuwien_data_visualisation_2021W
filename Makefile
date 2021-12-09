run:
	FLASK_APP=main flask run --host=0.0.0.0

start:
	 heroku ps:scale web=1 -a police-stop-search-vis

stop:
	 heroku ps:scale web=0 -a police-stop-search-vis

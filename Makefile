.PHONY: setup install migrate collectstatic run all

# Create virtual environment
setupmac:
	python3 -m venv .venv
	source .venv/bin/activate

setupwindows:
	python -m venv .venv
	.\.venv\Scripts\activate

# Activate venv and install dependencies
install:
	pip install --upgrade pip && pip install -r requirements.txt

# Run migrations
migrate:
	cd pde && python manage.py makemigrations tvt && python manage.py migrate

# Collect static files
stat:
	cd pde && python manage.py collectstatic --noinput

# Run the development server
run:
	cd pde && python manage.py runserver

# Do everything in order
all: install migrate stat run

reset: migrate stat run

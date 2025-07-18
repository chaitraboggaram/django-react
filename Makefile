setupmac:
	python3 -m venv .venv
	source .venv/bin/activate

setupwindows:
	python -m venv .venv
	.\.venv\Scripts\activate

install:
	pip install --upgrade pip && pip install -r requirements.txt

migrate:
	cd pde && python manage.py makemigrations tvt && python manage.py migrate

stat:
	cd pde && python manage.py collectstatic --noinput

django:
	cd pde && python manage.py runserver

shell:
	cd pde && python manage.py shell

react:
	cd pde && cd frontend && npm run dev

npm:
	cd pde && cd frontend && npm install
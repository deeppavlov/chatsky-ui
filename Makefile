install_front: 
	cd df_designer_front && npm install

build_front: 
	cd df_designer_front && npm run build

start_front: 
	cd df_designer_front && npm start

frontend_dev:
	make install_front
	make start_front

frontend: 
	make install_front
	make build_front

backend:
	poetry install && poetry shell

app: 
	make frontend
	make backend

dev:
	make frontend_dev
	make backend


install_front: 
	cd df_designer_front && npm install

build_front: 
	cd df_designer_front && npm run build

frontend: 
	make install_front
	make build_front

backend:
	poetry install && poetry shell

app: 
	make frontend
	make backend
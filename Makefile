build:
	docker compose build --no-cache --force-rm
up:
	docker compose up
upd:
	docker compose up -d
stop:
	docker compose stop
down:
	docker compose down --remove-orphans
down-v:
	docker compose down --remove-orphans --volumes
restart:
	@make down
	@make upd
destroy:
	docker compose down --remove-orphans --volumes --rmi all
logs:
	docker compose logs -f
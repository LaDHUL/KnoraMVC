container=knoramvc
container_prev=knoramvc-prev
image=platec/knoramvc-0.0
network=knoramvc
alias=knoramvc

network:
	docker network create $(network)
	
check:
	docker ps | grep $(container)

stop:
	docker kill $(container)

stop-prev:
	docker kill $(container_prev)

start-prev:
	docker start $(container_prev)

rm:
	docker rm $(container)

rmi:
	docker rmi $(image)

build:
	docker build -f Dockerfile -t $(image) .

run:
	docker run --net=$(network) --net-alias=$(alias) -d  -p 8091:3000 -p 8454:3443 --name=$(container) $(image)

run-debug-no-net:
	docker run -e "DEBUG=req,app,login,logout,resources,knora" -d  -p 8091:3000 -p 8454:3443 --name=$(container) $(image)

run-demo:
	docker run -e "NODE_ENV=demo" -d  -p 8091:3000 -p 8454:3443 --name=$(container) $(image)

start:
	docker start $(container)
	
attach:
	docker attach $(container)

logs:
	docker logs $(container)

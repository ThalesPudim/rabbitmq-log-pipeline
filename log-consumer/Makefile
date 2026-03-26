.PHONY: start stop restart logs

PID_SERVER  := storage/app/server.pid
PID_WORKER  := storage/app/worker.pid
PID_REVERB  := storage/app/reverb.pid

start:
	# Servidor HTTP
	php artisan serve --host=0.0.0.0 --port=8002 &
	echo $$! > $(PID_SERVER)
	# Worker da fila (consome RabbitMQ)
	php artisan queue:work --tries=3 --timeout=60 &
	echo $$! > $(PID_WORKER)
	# Laravel Reverb (WebSocket na 8081)
	php artisan reverb:start --host=127.0.0.1 --port=8081 &
	echo $$! > $(PID_REVERB)

stop:
	@for f in $(PID_SERVER) $(PID_WORKER) $(PID_REVERB); do \
		if [ -f $$f ]; then kill $$(cat $$f) && rm $$f; fi; \
	done
	# Sinaliza ao artisan queue para parar graciosamente
	php artisan queue:restart || true

restart: stop start

logs:
	tail -f storage/logs/laravel.log
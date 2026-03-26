.PHONY: start stop restart logs

# Ajuste o PID file se usar um processo diferente
PID_FILE := storage/app/server.pid

start:
	php artisan serve --host=0.0.0.0 --port=8001 &
	echo $$! > $(PID_FILE)

stop:
	@if [ -f $(PID_FILE) ]; then \
		kill $$(cat $(PID_FILE)) && rm $(PID_FILE); \
	fi

restart: stop start

logs:
	tail -f storage/logs/laravel.log
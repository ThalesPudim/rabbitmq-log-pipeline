.PHONY: start stop restart build
 
PID_FILE := .vite-preview.pid
 
build:
	npm run build
 
start: build
	npx vite preview --host 0.0.0.0 --port 4173 &
	echo $$! > $(PID_FILE)
 
stop:
	@if [ -f $(PID_FILE) ]; then \
		kill $$(cat $(PID_FILE)) && rm $(PID_FILE); \
	fi
 
restart: stop start
 
genzip:
	git archive -o intalk.zip master

serve:
	python -m http.server
install:
	rm -rf node_modules yarn.lock
	yarn install

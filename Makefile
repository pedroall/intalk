genzip:
	git archive -o intalk.zip master

serve:
	python -m http.server

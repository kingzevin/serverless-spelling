all: update

update: 
	./rezip.sh spelling
	wsk -i action update /guest/sharelatex/spelling spelling.zip --kind  nodejs:z --web true



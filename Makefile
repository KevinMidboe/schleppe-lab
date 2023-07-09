default: install

all: install build

h help:
	@grep '^[a-z]' Makefile

install:
	bundle config --local path vendor/bundle
	bundle install

s serve:
	bundle exec jekyll serve --trace --livereload

build:
	JEKYLL_ENV=production bundle exec jekyll build --trace

upgrade:
	bundle update

build-dev:
	bundle exec jekyll build


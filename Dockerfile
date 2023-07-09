FROM ruby:3.1-slim-bullseye as jekyll

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt

COPY . .

RUN make install
RUN make build

ENTRYPOINT [ "jekyll" ]

CMD [ "--help" ]

# build from the image we just built with different metadata
FROM nginx:alpine

WORKDIR /app

COPY nginx.conf /etc/nginx
COPY --from=jekyll /opt/_site .


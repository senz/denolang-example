FROM denoland/deno

EXPOSE 8000

WORKDIR /app

ADD . /app

RUN apt-get update && apt-get install -y curl

RUN deno cache main.ts

CMD ["run", "--allow-all", "main.ts"]
HEALTHCHECK --interval=1m --timeout=3s CMD /usr/bin/curl -f http://localhost:8000/ping || exit 1

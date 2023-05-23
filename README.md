# Description
mermaid diagram sor involved components

api docs

request examples

# How to setup local dev environment

Copy config `cp .env.dist .env`

VsCode:


1. Reopen in container
2. Deno: cache depenencies

App is started in watch mode. Logs are in VsCode Terminal.

Some app setting are set in devcontainer.json.

## Debugging
To start debugging session use Attach to remote.
If you need to debug bootstrap, kill terminal process and start with `denon run --allow-all --inspect-brk=127.0.0.1:9229 main.ts` then 'Attach to remote'.

# How to deploy

https://dev.to/roeland/use-import-maps-in-deno-with-vscode-and-denon-25c1
https://github.com/denodrivers/mysql

docker run -p 3306:3306 --name some-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:8.0

need to use native password because sha is not supported in deno https://github.com/denodrivers/mysql/issues/128
docker run -p 127.0.0.1:3306:3306 --name some-mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=true -e MYSQL_USER=user -e MYSQL_PASSWORD=my-secret-pw -e MYSQL_DATABASE=employees -e MYSQL_ROOT_HOST=% -e MYSQL_ROOT_PASSWORD=my-secret-pw -v $PWD/sqls:/docker-entrypoint-initdb.d -d mysql:8.0 --default-authentication-plugin=mysql_native_password


denon start

docker build -t deno-container .

helm install deno ./deno-chart

  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=deno-chart,app.kubernetes.io/instance=deno" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8081 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8081:$CONTAINER_PORT
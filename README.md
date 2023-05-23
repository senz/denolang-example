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

`helm install deno ./deno-chart`

Port fowarding of app container:
```bash
export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=deno-chart,app.kubernetes.io/instance=deno" -o jsonpath="{.items[0].metadata.name}")
export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
echo "Visit http://127.0.0.1:8081/ping to use your application"
kubectl --namespace default port-forward $POD_NAME 8081:$CONTAINER_PORT
```

# Test requests
located in test.http file. Supported by [rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) vscode extension
https://dev.to/roeland/use-import-maps-in-deno-with-vscode-and-denon-25c1
https://github.com/denodrivers/mysql

# Features
[✅] parse payload, transform
[✅] store payload in mysql/maria
[✅] hande syntax errors in payload as 400 json excpetion
[✅] endopoint for supervisor from storage
[✅] devcontainer, readme.md
[✅] tests !
[✅] basic auth !!
[✅] helm for mysql and service !!!
[] todo service to mysql connection in k8s !!!!
[] todo move secrets from values to separate file that could be encrypted with sops
[✅] healthcheck handler

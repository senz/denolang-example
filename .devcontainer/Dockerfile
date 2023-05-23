# [Choice] Debian OS version: bullseye, buster
ARG VARIANT=bullseye
FROM mcr.microsoft.com/devcontainers/base:0-${VARIANT}

ENV DENO_INSTALL=/deno
ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno
ARG DENO_VERSION=1.33.4

# https://github.com/LukeChannings/deno-arm64
# amd64 emulation will fail https://github.com/docker/for-mac/issues/6174
RUN mkdir -p /deno \
    && curl -o /tmp/install -s https://gist.githubusercontent.com/LukeChannings/09d53f5c364391042186518c8598b85e/raw/ac8cd8c675b985edd4b3e16df63ffef14d1f0e24/deno_install.sh \
        && chmod +x /tmp/install \
        && /tmp/install v${DENO_VERSION} \
    && deno install --root $DENO_INSTALL -Af --unstable https://deno.land/x/denon/denon.ts \
    && chown -R vscode /deno


# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#    && apt-get -y install --no-install-recommends <your-package-list-here>

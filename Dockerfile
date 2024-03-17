# INIT -------------------------------------------------------------------------
#  - Install all dependencies including dev
#  - build artifacts
# ------------------------------------------------------------------------- INIT
FROM node:18-buster as INIT

ARG MODE=production

RUN --mount=type=cache,target=/var/cache/apt apt-get update \
    && apt-get install -y jq curl --no-install-recommends
    # \ && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app
ENV NODE_ENV=${MODE} BLUEBIRD_DEBUG=0

# install dependencies first, so they can be cached
COPY --chown=node:node package.json package-lock.json ./

# RUN --mount=type=cache,target=/opt/app/.npm \
#     npm ci --cache /opt/app/.npm --include=dev --loglevel info --no-audit
#     # \&& npm cache clean --force
RUN npm ci --include=dev --loglevel info --no-audit
    # \&& npm cache clean --force

# copy sources afterwards
COPY --chown=node:node . .
# build artifacts
RUN npm run build
# remove dev dependencies + caches after build
RUN npm prune --production
 # && rm -rf /home/node/.cache /home/node/.npm
USER node


ENTRYPOINT [ "/opt/app/entrypoint.sh" ]

CMD ["start"]

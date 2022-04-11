# ------------------------------------------------------------------------- INIT
FROM node:16-alpine

ARG SERVICE
ARG MODE=development

RUN apk update && apk add --no-cache tini jq curl
# RUN npm install -g npm@8.3.1

WORKDIR /opt/app

ENV NODE_ENV=development \
    BLUEBIRD_DEBUG=0 \
    SERVICE=${SERVICE}

COPY --chown=node:node package*.json ./
COPY --chown=node:node lerna.json .
COPY --chown=node:node packages/ ./packages
COPY --chown=node:node services/${SERVICE} ./services/${SERVICE}
RUN npm ci --loglevel info --no-audit

ENV BLUEBIRD_DEBUG=0 \
    NODE_ENV=${MODE} \
    SERVICE=${SERVICE} 


HEALTHCHECK --interval=30s \
    --timeout=2s \
    --retries=10 \
    CMD node services/${SERVICE}/bin/healthcheck.js

USER node

 ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "--prefix", "services/${SERVICE}", "start"]

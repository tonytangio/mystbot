FROM node:12-alpine as base
WORKDIR /mystbot


# ---- PRE-REQS ----
FROM base as prereq

COPY package*.json ./

# Next two commands are for building and installing node-canvas
# See https://github.com/Automattic/node-canvas/issues/1486
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev
RUN npm i canvas --build-from-source

RUN npm install --only=production --quiet --unsafe-perm --no-progress --no-audit


# ---- DEVELOPMENT ----
FROM prereq as development

RUN npm install --only=development --quiet --unsafe-perm --no-progress --no-audit


# ---- PRODUCTION ----
FROM prereq as production

COPY . .

# ---- BASE ----
FROM node:10 as base
WORKDIR /mystbot


# ---- PREREQ ----
FROM base as prereq

COPY package*.json ./

# Next two commands are for building and installing node-canvas
# See https://github.com/Automattic/node-canvas/issues/1486
# RUN apk add --update --no-cache \
#     make \
#     g++ \
#     jpeg-dev \
#     cairo-dev \
#     giflib-dev \
#     pango-dev
# RUN npm install canvas --build-from-source

# RUN apk add --no-cache --virtual .build-deps \
#     make gcc g++ python pkgconfig pixman-dev cairo-dev pango-dev libjpeg-turbo-dev giflib-dev \
#     # Install node.js dependencies
#     && npm install canvas --build-from-source \
#     # Clean up build dependencies
#     && apk del .build-deps

RUN npm install --only=production --quiet --unsafe-perm --no-progress --no-audit


# ---- DEVELOPMENT ----
FROM prereq as development

RUN npm install --only=development --quiet --unsafe-perm --no-progress --no-audit


# ---- PRODUCTION ----
FROM prereq as production

WORKDIR /mystbot
COPY . .

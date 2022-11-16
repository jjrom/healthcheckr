FROM node:17-alpine

WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install --production

# Install curl for healthcheck
RUN apk --update --no-cache add curl

# Copy src and config
COPY ./app.js /app/app.js
COPY ./config.js /app/config.js
COPY ./app /app/app

CMD [ "npm", "start" ]
FROM node:boron

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
RUN npm install

# Bundle app source
COPY bin/    /app/bin
COPY certs/  /app/certs
COPY config/ /app/config
COPY kapi/   /app/kapi
COPY models/ /app/models
COPY routes/ /app/routes
COPY app.js  /app

EXPOSE 3000 3443

CMD [ "npm", "start" ]

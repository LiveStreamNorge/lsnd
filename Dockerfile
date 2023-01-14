FROM node:18
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn --production
# Bundle app source
COPY . .

RUN /tmp/apt-install-chrome-dependencies.sh

EXPOSE 80

CMD [ "node", "index.js" ]

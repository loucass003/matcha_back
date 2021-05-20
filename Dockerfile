FROM node:15

RUN mkdir /home/node/app
RUN mkdir -p /home/node/app/src/uploads
RUN chmod 755 -R /home/node/app/src/uploads
WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
COPY .eslintrc.js .
COPY tsconfig.json .

COPY ./src src/
RUN npm config set unsafe-perm true
RUN npm install


CMD npm run watch
# CMD npm run start

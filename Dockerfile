FROM node:latest

RUN mkdir parse

ADD . /parse
WORKDIR /parse

RUN yarn install
RUN npm install pm2 -g

EXPOSE 1337
VOLUME /parse/cloud               

CMD [ "yarn", "start-server-node" ]

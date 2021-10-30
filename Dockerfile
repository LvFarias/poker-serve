FROM node:15-alpine

WORKDIR /api/

COPY . .

RUN npm install

EXPOSE 9777

ENTRYPOINT ["npm", "run", "local"]
FROM node:lts

COPY writers-block /app/writers-block

WORKDIR /app/writers-block

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]

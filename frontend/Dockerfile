FROM node:10.15.3
WORKDIR /code
COPY . .
RUN yarn install
RUN yarn run build
RUN yarn global add serve
CMD ["serve", "-p", "3000", "-s", "build/"]

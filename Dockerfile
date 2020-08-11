# create build
FROM node:12.16.1-alpine as builder
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm run ng build --prod


# deploy on nginx
FROM nginx:1.19.1-alpine

COPY --from=builder /usr/src/app/dist/corona-safe-route /var/www
COPY nginx.conf /usr/local/etc/nginx/nginx.conf

EXPOSE 3000

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
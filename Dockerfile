FROM node:12.16.1-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist/corona-safe-route/. /usr/local/Cellar/nginx/1.19.1/html/
# COPY nginx.conf /usr/local/etc/nginx/nginx.conf
# EXPOSE 80
# CMD [ "nginx", "-g", "daemon off;" ]
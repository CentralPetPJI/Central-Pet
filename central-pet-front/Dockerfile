FROM node:20.11.0 AS build

WORKDIR /app

# COPY .. ./shared/

COPY ./dist ./dist/

# WORKDIR /app/central-pet-front

# RUN npm install

#RUN npm run build

FROM httpd:2.4.62

COPY --from=build /app/dist/ /usr/local/apache2/htdocs/




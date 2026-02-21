FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY dist  ./dist
COPY public ./public


FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=build /app .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
ENV PORT=3000
EXPOSE $PORT
CMD ["yarn", "start"]
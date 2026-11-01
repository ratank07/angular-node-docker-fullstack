FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --chown=node:node server.js ./

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]
FROM node:18-alpine

RUN apk add --no-cache tzdata

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production --no-audit --no-fund

COPY . .

RUN mkdir -p logs

RUN addgroup -S frshure && adduser -S frshure -G frshure
RUN chown -R frshure:frshure /usr/src/app
USER frshure

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]

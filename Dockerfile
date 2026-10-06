FROM node:22-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_PUBLIC_SITE_URL=https://pardailab.ru
RUN npm run build && rm -rf .next/cache

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]

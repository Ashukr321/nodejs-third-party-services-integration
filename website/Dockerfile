# syntax=docker/dockerfile:1
# Build context is the REPO ROOT (the guides live next to website/):
#   docker build -f website/Dockerfile -t node-integrations ..        (from website/)
#   docker compose up --build                                        (from website/)

FROM node:22-alpine AS deps
WORKDIR /app/website
COPY website/package.json website/package-lock.json website/.npmrc ./
# --ignore-scripts: skip the husky "prepare" hook, there is no .git in the image
RUN npm ci --ignore-scripts

FROM node:22-alpine AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/website/node_modules ./website/node_modules
WORKDIR /app/website
ENV NEXT_TELEMETRY_DISABLED=1
# Public URL used in canonical links, sitemap and Open Graph tags
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/website/.next/standalone ./
COPY --from=build --chown=node:node /app/website/.next/static ./.next/static
COPY --from=build --chown=node:node /app/website/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null || exit 1
CMD ["node", "server.js"]

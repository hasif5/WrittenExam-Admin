# File: Dockerfile
# Production image for the Admin Panel SPA: build the Vite bundle with Node, then
# serve the static output with nginx (SPA fallback). Built for Coolify.
# Author: Hasif Ahmed <xmart@live.com> (www.hasif.info)
# Created: 2026-06-30

# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies from the lockfile (cached unless the manifests change).
COPY package.json package-lock.json ./
RUN npm ci

# Vite inlines VITE_* vars at build time, so the API base URL must be present
# during the build. Coolify passes it as a build argument.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine AS runtime

# SPA-aware config (history fallback + asset caching).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

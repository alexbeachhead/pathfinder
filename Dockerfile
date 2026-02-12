# Node 22 + full Bookworm so we can install Playwright system deps (libnss3, libgbm, etc.)
FROM node:22-bookworm

WORKDIR /app

# Install deps and Playwright browser + system libraries (required for Chromium at runtime)
COPY package.json package-lock.json ./
RUN npm ci
ENV PLAYWRIGHT_BROWSERS_PATH=/app/playwright-browsers
RUN npx playwright install chromium --with-deps --only-shell

# Build the app
COPY . .
RUN npm run build

EXPOSE 8080
ENV PORT=8080
CMD ["npm", "run", "start"]

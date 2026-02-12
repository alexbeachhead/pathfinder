# Node 22 + full Bookworm so we can install Playwright system deps (libnss3, libgbm, etc.)
FROM node:22-bookworm

WORKDIR /app

# Install deps and Playwright browser + system libraries (required for Chromium at runtime)
COPY package.json package-lock.json ./
RUN npm ci
ENV PLAYWRIGHT_BROWSERS_PATH=/app/playwright-browsers
RUN npx playwright install chromium --with-deps --only-shell

# Build the app (NEXT_PUBLIC_* must be available so Next.js inlines them into the client bundle)
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
RUN npm run build

EXPOSE 8080
ENV PORT=8080
CMD ["npm", "run", "start"]

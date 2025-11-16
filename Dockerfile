# Dev base image for Vite + React + TS
FROM node:24-alpine
RUN corepack enable
WORKDIR /workspace/app
EXPOSE 3000

# Default to idle; compose will provide the run command
CMD ["sh", "-lc", "sleep infinity"]
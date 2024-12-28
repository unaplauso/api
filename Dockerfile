FROM node:alpine AS base

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY drizzle.config.ts ./
COPY .env ./
COPY apps ./apps
COPY libs ./libs

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false
RUN pnpm run build gateway
RUN pnpm run build auth
RUN pnpm run build audit

FROM base AS unaplauso-gateway
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist/apps/gateway /app/dist
ARG GATEWAY_PORT=3000
ENV GATEWAY_PORT=${GATEWAY_PORT}
EXPOSE ${GATEWAY_PORT}
CMD [ "node", "dist/main" ]

FROM base AS unaplauso-auth
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist/apps/auth /app/dist
ARG AUTH_PORT=3001
ENV AUTH_PORT=${AUTH_PORT}
EXPOSE ${AUTH_PORT}
CMD [ "node", "dist/main" ]

FROM base AS unaplauso-audit
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist/apps/audit /app/dist
CMD [ "node", "dist/main" ]
FROM node:alpine AS base


#t
#xd

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV NODE_ENV=${NODE_ENV} PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable 

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch -P

FROM base AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json webpack.config.js ./
COPY apps apps
COPY libs libs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false --prefer-offline
RUN pnpm run build gateway & \
  pnpm run build auth & \
  pnpm run build audit & \
  pnpm run build file & \
  wait

FROM base AS prod-deps
ENV POSTGRES_HOST='unaplauso-db' REDIS_HOST='unaplauso-redis'
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline -P
COPY --from=build /app/libs/database/migrations libs/database/migrations

FROM prod-deps AS unaplauso-audit
COPY --from=build /app/dist/apps/audit dist
CMD ["node", "dist/main"]

FROM prod-deps AS unaplauso-auth
COPY --from=build /app/dist/apps/auth dist
EXPOSE ${AUTH_PORT}
CMD ["node", "dist/main"]

FROM prod-deps AS unaplauso-file
COPY --from=build /app/dist/apps/file dist
CMD ["node", "dist/main"]

FROM prod-deps AS unaplauso-gateway
COPY --from=build /app/dist/apps/gateway dist
EXPOSE ${GATEWAY_PORT}
CMD ["node", "dist/main"]

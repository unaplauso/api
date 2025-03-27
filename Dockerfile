FROM node:alpine AS base

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV NODE_ENV=${NODE_ENV} PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm fetch -P

FROM base AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json webpack.config.js ./
COPY apps apps
COPY libs libs
RUN pnpm install --frozen-lockfile --prod=false --prefer-offline
RUN pnpm nest build --all

FROM base AS prod-deps
ENV POSTGRES_HOST='db' REDIS_HOST='redis'
RUN pnpm install --frozen-lockfile --offline -P
COPY --from=build /app/libs/database/migrations libs/database/migrations

FROM prod-deps AS audit
COPY --from=build /app/dist/apps/audit dist
CMD ["node", "dist/main"]

FROM prod-deps AS auth
COPY --from=build /app/dist/apps/auth dist
EXPOSE ${AUTH_PORT}
CMD ["node", "dist/main"]

FROM prod-deps AS event
COPY --from=build /app/dist/apps/event dist
CMD ["node", "dist/main"]

FROM prod-deps AS file
COPY --from=build /app/dist/apps/file dist
CMD ["node", "dist/main"]

FROM prod-deps AS gateway
COPY --from=build /app/dist/apps/gateway dist
EXPOSE ${GATEWAY_PORT}
CMD ["node", "dist/main"]

FROM prod-deps AS open
COPY --from=build /app/dist/apps/open dist
CMD ["node", "dist/main"]

FROM prod-deps AS payment
COPY --from=build /app/dist/apps/payment dist
CMD ["node", "dist/main"]

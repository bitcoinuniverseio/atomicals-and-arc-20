# The read-only HTTP adapter the lab exposes on 127.0.0.1:3043.
# Node from the same pinned line the repository builds with.
FROM node:24.19.0-bookworm-slim
WORKDIR /srv
COPY proxy/adapter.mjs ./adapter.mjs
EXPOSE 3043
CMD ["node", "adapter.mjs"]

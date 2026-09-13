# 主应用（Vue3 + Vite）：多阶段构建，产物交给 nginx
FROM node:22-alpine AS build
WORKDIR /app

# 先装依赖，利用层缓存
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
# vite build 会读取 .env.production（同源相对路径）
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

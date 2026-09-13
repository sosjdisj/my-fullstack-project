# 音乐微应用（Vue3 + Vite）：静态站点，以 /app-a/ 为 base 构建后由 nginx 托管
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
# --base=/app-a/ 让静态资源引用带上微应用前缀，经主应用 nginx 同源代理
RUN npm run build -- --base=/app-a/

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

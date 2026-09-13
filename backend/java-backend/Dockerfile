# Spring Boot（Java 24 + Maven）：容器内多阶段构建
FROM maven:3.9-eclipse-temurin-24 AS build
WORKDIR /app

# 先下依赖，利用层缓存
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

COPY src ./src
RUN mvn package -DskipTests -B -q

FROM eclipse-temurin:24-jre
WORKDIR /app
ENV TZ=Asia/Shanghai
COPY --from=build /app/target/*.jar app.jar
EXPOSE 3001 3002
ENTRYPOINT ["java", "-jar", "app.jar"]

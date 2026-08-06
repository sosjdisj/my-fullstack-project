package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.example.demo.repository.mongo")
public class Demo1Application {

    /** 应用程序入口，启动 Spring Boot 服务 */
    public static void main(String[] args) {
        SpringApplication.run(Demo1Application.class, args);
    }

}

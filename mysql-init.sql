-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: myblog
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `myblog`
--

/*!40000 DROP DATABASE IF EXISTS `myblog`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `myblog` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `myblog`;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(20) NOT NULL COMMENT '用户名',
  `role_id` varchar(24) DEFAULT NULL COMMENT '角色ID（MongoDB ObjectId）',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希值',
  `signature` varchar(200) DEFAULT '这个人很赖，什么都没有留下~' COMMENT '个性签名',
  `publish_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建账户时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '修改信息时间',
  `cover` varchar(500) DEFAULT NULL COMMENT '用户头像',
  `account_status` enum('ACTIVE','DISABLED','BLACKLISTED') NOT NULL DEFAULT 'ACTIVE' COMMENT '账号状态（正常/禁用/拉黑）',
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `deleted` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'zhangsan','69be0504eeb8e6106b1787fb','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','这个人很赖，什么都没有留下~','2026-01-10 08:30:00','2026-01-10 08:30:00','https://example.com/avatars/zhangsan.jpg','ACTIVE',NULL,0),(2,'lisi','69be0504eeb8e6106b1787fb','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','这个人很赖，什么都没有留下~','2026-01-15 14:20:00','2026-01-15 14:20:00','https://example.com/avatars/lisi.png','ACTIVE',NULL,0),(3,'wangwu','69be0504eeb8e6106b1787fb','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','这个人很赖，什么都没有留下~','2026-02-01 10:15:00','2026-02-01 10:15:00',NULL,'ACTIVE',NULL,0),(4,'zhaoliu','69be0504eeb8e6106b1787fb','$2y$10$tSSMuOxqqPA5a3ZvV/WM/uIqGD7fkE6SvqKHdIHTFcAPzcTLmk1Gq','这个人很赖，什么都没有留下~','2026-02-10 16:40:00','2026-02-15 09:00:00','https://example.com/avatars/zhaoliu.jpeg','ACTIVE',NULL,0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-13 11:02:32

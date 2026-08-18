package com.example.demo.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * MyBatis-Plus 自动填充处理器
 * - insertFill: 注册用户时填充 publishTime 和 updateTime
 * - updateFill: 更新用户时强制刷新 updateTime
 * 仅对 MySQL 实体(User)生效,MongoDB 实体不在本机制范围内。
 */
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        LocalDateTime now = LocalDateTime.now();
        // 严格模式:字段为 null 才填,不覆盖业务显式传入的值
        this.strictInsertFill(metaObject, "publishTime", LocalDateTime.class, now);
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, now);
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        // 强制刷新:每次更新都重置 updateTime,避免业务遗漏 set
        this.setFieldValByName("updateTime", LocalDateTime.now(), metaObject);
    }
}

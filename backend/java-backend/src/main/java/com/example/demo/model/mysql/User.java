package com.example.demo.model.mysql;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    @TableField("user_id")
    private Integer userId;

    @TableField("username")
    private String username;

    @TableField("role_id")
    private String roleId;

    @TableField("password_hash")
    private String passwordHash;

    @TableField("signature")
    private String signature;

    @TableField("publish_time")
    private LocalDateTime publishTime;

    @TableField("update_time")
    private LocalDateTime updateTime;

    @TableField("cover")
    private String cover;

    @TableField("account_status")
    private AccountStatus accountStatus;

    @TableField("phone")
    private String phone;

    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    public enum AccountStatus {
        ACTIVE,
        BLACKLISTED
    }
}
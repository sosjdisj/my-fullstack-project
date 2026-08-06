package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.model.mysql.User;
import org.apache.ibatis.annotations.Mapper;

/** 用户表的 MyBatis-Plus Mapper，继承 BaseMapper 自动获得基础 CRUD 方法 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
}
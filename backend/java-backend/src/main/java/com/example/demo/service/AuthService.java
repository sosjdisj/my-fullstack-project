package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.demo.common.BusinessException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.mysql.User;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    public User verifyLogin(String username, String password) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        if (!BCrypt.checkpw(password, user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }
        if (user.getAccountStatus() == User.AccountStatus.BLACKLISTED) {
            throw new BusinessException(403, "账号已被封禁");
        }
        return user;
    }

    public boolean checkPhoneExists(String phone) {
        return userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getPhone, phone)
        ) > 0;
    }

    public User registerUser(String username, String password, String phone) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setPhone(phone);
        user.setDeleted(0);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        userMapper.insert(user);
        return user;
    }
}

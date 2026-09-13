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

    /** BCrypt 哈希前缀规范化：$2y$/$2b$ 与 $2a$ 算法等价（$2y$ 为 PHP 风格标识），统一转为 jBCrypt 支持的 $2a$ */
    private static String normalizeBcryptHash(String hash) {
        if (hash != null && (hash.startsWith("$2y$") || hash.startsWith("$2b$"))) {
            return "$2a$" + hash.substring(4);
        }
        return hash;
    }

    /** 校验登录凭证（用户名或邮箱）和密码，返回登录用户对象 */
    public User verifyLogin(String account, String password) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>()
                        .eq(User::getUsername, account)
                        .or()
                        .eq(User::getEmail, account)
        );
        if (user == null) {
            throw new BusinessException(401, "账号或密码错误");
        }
        if (!BCrypt.checkpw(password, normalizeBcryptHash(user.getPasswordHash()))) {
            throw new BusinessException(401, "账号或密码错误");
        }
        if (user.getAccountStatus() == User.AccountStatus.BLACKLISTED) {
            throw new BusinessException(403, "账号已被封禁");
        }
        return user;
    }

    /** 检查邮箱是否已被注册 */
    public boolean checkEmailExists(String email) {
        return userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getEmail, email)
        ) > 0;
    }

    /** 注册新用户，密码加密后入库并返回用户对象 */
    public User registerUser(String username, String password, String email) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setEmail(email);
        user.setDeleted(0);
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        userMapper.insert(user);
        return user;
    }

    /** 根据邮箱重置密码，要求该邮箱已注册 */
    public void resetPassword(String email, String newPassword) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getEmail, email)
        );
        if (user == null) {
            throw new BusinessException(400, "该邮箱未注册");
        }
        user.setPasswordHash(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userMapper.updateById(user);
    }
}

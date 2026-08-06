package com.example.demo.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SendCodeService {

    @Autowired
    private AliyunSmsService aliyunSmsService;

    private final ConcurrentHashMap<String, CodeItem> codeCache = new ConcurrentHashMap<>();

    @Data
    public static class CodeItem {
        private String code;
        private LocalDateTime expireTime;

        public CodeItem(String code, LocalDateTime expireTime) {
            this.code = code;
            this.expireTime = expireTime;
        }
    }

    /** 生成6位随机数字验证码 */
    public String generateVerifyCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    /** 将验证码以手机号为键缓存到内存 */
    public void storeCode(String phone, String code, LocalDateTime expireTime) {
        codeCache.put(phone, new CodeItem(code, expireTime));
    }

    /** 获取验证码过期时间（当前时间5分钟后） */
    public LocalDateTime getExpireTime() {
        return LocalDateTime.now().plusMinutes(5);
    }

    /** 从缓存获取验证码，过期或不存在则返回null */
    public CodeItem getCode(String phone) {
        CodeItem item = codeCache.get(phone);
        if (item == null) {
            return null;
        }
        if (LocalDateTime.now().isAfter(item.getExpireTime())) {
            codeCache.remove(phone);
            return null;
        }
        return item;
    }

    /** 从缓存移除指定手机的验证码 */
    public void removeCode(String phone) {
        codeCache.remove(phone);
    }

    /**
     * 发送验证码（生成、存储、调用阿里云短信发送）
     */
    public boolean sendCode(String phone) {
        String code = generateVerifyCode();
        storeCode(phone, code, getExpireTime());
        boolean success = aliyunSmsService.sendVerifyCode(phone, code);
        if (!success) {
            log.warn("短信发送失败，验证码已缓存: phone={}", phone);
        }
        return success;
    }
}

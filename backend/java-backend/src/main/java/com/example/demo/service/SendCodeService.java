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

    public String generateVerifyCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    public void storeCode(String phone, String code, LocalDateTime expireTime) {
        codeCache.put(phone, new CodeItem(code, expireTime));
    }

    public LocalDateTime getExpireTime() {
        return LocalDateTime.now().plusMinutes(5);
    }

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

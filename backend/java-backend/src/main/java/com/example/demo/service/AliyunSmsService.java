package com.example.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class AliyunSmsService {

    @Value("${aliyun.sms.access-key-id}")
    private String accessKeyId;

    @Value("${aliyun.sms.access-key-secret}")
    private String accessKeySecret;

    @Value("${aliyun.sms.sign-name}")
    private String signName;

    @Value("${aliyun.sms.template-code}")
    private String templateCode;

    private com.aliyun.dysmsapi20170525.Client smsClient;

    /** 初始化阿里云短信客户端 */
    @PostConstruct
    public void init() throws Exception {
        var config = new com.aliyun.teaopenapi.models.Config();
        config.setAccessKeyId(accessKeyId);
        config.setAccessKeySecret(accessKeySecret);
        config.setEndpoint("dysmsapi.aliyuncs.com");
        smsClient = new com.aliyun.dysmsapi20170525.Client(config);
    }

    /**
     * 发送短信验证码
     */
    public boolean sendVerifyCode(String phone, String code) {
        try {
            var request = new com.aliyun.dysmsapi20170525.models.SendSmsRequest();
            request.setPhoneNumbers(phone);
            request.setSignName(signName);
            request.setTemplateCode(templateCode);
            request.setTemplateParam("{\"code\":\"" + code + "\"}");

            var response = smsClient.sendSms(request);
            if (response.getBody() != null && "OK".equals(response.getBody().getCode())) {
                log.info("短信发送成功: phone={}", phone);
                return true;
            } else {
                log.error("短信发送失败: phone={}, code={}, message={}", phone,
                    response.getBody() != null ? response.getBody().getCode() : "null",
                    response.getBody() != null ? response.getBody().getMessage() : "null");
                return false;
            }
        } catch (Exception e) {
            log.error("短信发送异常: phone={}", phone, e);
            return false;
        }
    }
}

package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.service.AliyunSmsService;
import com.example.demo.service.SendCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class SendCodeController {

    @Autowired
    private SendCodeService sendCodeService;

    @Autowired
    private AliyunSmsService aliyunSmsService;

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @PostMapping("/sendCode")
    public ApiResponse<Void> sendCode(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new BusinessException(400, "手机号不能为空");
        }
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BusinessException(400, "手机号格式不正确");
        }

        boolean success = sendCodeService.sendCode(phone);
        if (!success) {
            throw new BusinessException(500, "短信发送失败，请稍后重试");
        }

        return ApiResponse.success("验证码发送成功");
    }
}

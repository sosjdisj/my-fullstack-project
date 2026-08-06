package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.common.BusinessException;
import com.example.demo.common.RateLimiter;
import com.example.demo.service.AliyunSmsService;
import com.example.demo.service.SendCodeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
public class SendCodeController {

    @Autowired
    private SendCodeService sendCodeService;

    @Autowired
    private AliyunSmsService aliyunSmsService;

    @Autowired
    private RateLimiter rateLimiter;

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    /** 发送短信验证码，含手机号格式校验和限流防护 */
    @PostMapping("/sendCode")
    public ApiResponse<Void> sendCode(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String phone = body.get("phone");
        if (phone == null || phone.isBlank()) {
            throw new BusinessException(400, "手机号不能为空");
        }
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BusinessException(400, "手机号格式不正确");
        }

        // 限流：同一手机号 60 秒内只能发一次；同一 IP 每小时最多 10 次，防止短信轰炸
        if (!rateLimiter.tryAcquire("sms:phone", phone, 1, Duration.ofSeconds(60))) {
            throw new BusinessException(429, "验证码发送过于频繁，请 60 秒后重试");
        }
        String clientIp = getClientIp(request);
        if (!rateLimiter.tryAcquire("sms:ip", clientIp, 10, Duration.ofHours(1))) {
            throw new BusinessException(429, "请求过于频繁，请稍后重试");
        }

        boolean success = sendCodeService.sendCode(phone);
        if (!success) {
            throw new BusinessException(500, "短信发送失败，请稍后重试");
        }

        return ApiResponse.success("验证码发送成功");
    }

    /**
     * 获取客户端真实 IP，优先取 X-Forwarded-For，回退到 remoteAddr
     */
    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

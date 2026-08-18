package com.example.demo.common;

import java.util.regex.Pattern;

/**
 * 入参校验工具：集中处理文本类参数的空值、长度、格式校验，避免在多个 Controller 中重复编写。
 */
public final class ValidationUtil {

    private ValidationUtil() {
    }

    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    /** 校验必填文本：非空 + 长度上限 */
    public static void checkContent(String content, int max, String name) {
        if (content == null || content.isBlank()) {
            throw new BusinessException(400, name + "不能为空");
        }
        if (content.length() > max) {
            throw new BusinessException(400, name + "不能超过" + max + "字");
        }
    }

    /** 校验选填文本：仅在非空时检查长度上限 */
    public static void checkOptionalLength(String value, int max, String name) {
        if (value == null || value.isBlank()) {
            return;
        }
        if (value.length() > max) {
            throw new BusinessException(400, name + "不能超过" + max + "字");
        }
    }

    /** 校验选填手机号：仅在非空时检查格式 */
    public static void checkOptionalPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return;
        }
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new BusinessException(400, "手机号格式不正确");
        }
    }
}

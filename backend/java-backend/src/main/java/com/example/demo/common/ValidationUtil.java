package com.example.demo.common;

import java.util.regex.Pattern;

/**
 * 入参校验工具：集中处理文本类参数的空值、长度、格式校验，避免在多个 Controller 中重复编写。
 */
public final class ValidationUtil {

    private ValidationUtil() {
    }

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

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

    /** 校验用户名：非空 + 长度上限 + 不含 @（@ 是邮箱登录标识，避免账号混淆） */
    public static void checkUsername(String username) {
        checkContent(username, 20, "用户名");
        if (username.contains("@")) {
            throw new BusinessException(400, "用户名不能包含 @ 符号");
        }
    }

    /** 校验必填邮箱：非空 + 格式 */
    public static void checkEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new BusinessException(400, "邮箱不能为空");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BusinessException(400, "邮箱格式不正确");
        }
    }

    /** 校验选填邮箱：仅在非空时检查格式 */
    public static void checkOptionalEmail(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new BusinessException(400, "邮箱格式不正确");
        }
    }
}

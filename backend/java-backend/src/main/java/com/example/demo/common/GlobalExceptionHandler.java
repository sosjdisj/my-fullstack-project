package com.example.demo.common;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 处理业务异常，按错误码返回对应的错误响应 */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("[业务异常] {} {}", request.getMethod(), request.getRequestURI(), e);
        return ResponseEntity.status(e.getCode() < 500 ? e.getCode() : 500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    /** 处理内容协商失败的异常，返回 406 状态码 */
    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<String> handleHttpMediaTypeNotAcceptable(HttpMediaTypeNotAcceptableException e, HttpServletRequest request) {
        log.error("[内容协商异常] {} {} Accept: {}", request.getMethod(), request.getRequestURI(), request.getHeader("Accept"), e);
        return ResponseEntity.status(406)
                .contentType(MediaType.TEXT_PLAIN)
                .body("Not Acceptable");
    }

    /** 兜底处理所有未捕获异常，统一返回服务器内部错误 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e, HttpServletRequest request) {
        // 仅记录日志，不向客户端返回原始异常消息，避免泄露 SQL、堆栈、内部路径等敏感信息
        log.error("[全局错误] {} {}", request.getMethod(), request.getRequestURI(), e);
        return ResponseEntity.status(500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.error(500, "服务器内部错误，请稍后重试"));
    }
}

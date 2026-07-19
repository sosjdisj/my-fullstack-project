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

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("[业务异常] {} {}", request.getMethod(), request.getRequestURI(), e);
        return ResponseEntity.status(e.getCode() < 500 ? e.getCode() : 500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<String> handleHttpMediaTypeNotAcceptable(HttpMediaTypeNotAcceptableException e, HttpServletRequest request) {
        log.error("[内容协商异常] {} {} Accept: {}", request.getMethod(), request.getRequestURI(), request.getHeader("Accept"), e);
        return ResponseEntity.status(406)
                .contentType(MediaType.TEXT_PLAIN)
                .body("Not Acceptable: " + e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e, HttpServletRequest request) {
        log.error("[全局错误] {} {}", request.getMethod(), request.getRequestURI(), e);
        return ResponseEntity.status(500)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.error(500, e.getMessage() != null ? e.getMessage() : "服务器内部错误"));
    }
}

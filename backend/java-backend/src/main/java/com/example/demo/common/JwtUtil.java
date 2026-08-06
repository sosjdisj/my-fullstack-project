package com.example.demo.common;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    /** 根据配置的密钥构造 JWT 签名密钥，长度不足时自动补齐 */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // 确保密钥长度足够（至少256位用于HS256）
        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            keyBytes = paddedKey;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /** 生成短期的 JWT 访问令牌，携带用户基本信息 */
    public String generateAccessToken(Integer userId, String username, String cover, String signature) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("userId", userId)
                .claim("username", username)
                .claim("cover", cover)
                .claim("signature", signature)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /** 生成长期的 JWT 刷新令牌，用于续签访问令牌 */
    public String generateRefreshToken(Integer userId, String username, String cover, String signature) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("userId", userId)
                .claim("username", username)
                .claim("cover", cover)
                .claim("signature", signature)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /** 一次性生成访问令牌和刷新令牌对 */
    public TokenPair generateTokenPair(Integer userId, String username, String cover, String signature) {
        String accessToken = generateAccessToken(userId, username, cover, signature);
        String refreshToken = generateRefreshToken(userId, username, cover, signature);
        return new TokenPair(accessToken, refreshToken);
    }

    /** 校验 JWT 令牌并返回用户信息，校验失败返回 null */
    public UserInfo verifyToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            UserInfo userInfo = new UserInfo();
            userInfo.setUserId(claims.get("userId", Number.class).intValue());
            userInfo.setUsername(claims.get("username", String.class));
            userInfo.setCover(claims.get("cover", String.class));
            userInfo.setSignature(claims.get("signature", String.class));
            return userInfo;
        } catch (Exception e) {
            return null;
        }
    }

    public record TokenPair(String accessToken, String refreshToken) {}

    @lombok.Data
    public static class UserInfo {
        private Integer userId;
        private String username;
        private String cover;
        private String signature;
    }
}

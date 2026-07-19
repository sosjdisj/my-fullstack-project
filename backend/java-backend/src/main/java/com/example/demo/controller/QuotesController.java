package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.QuotesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuotesController {

    @Autowired
    private QuotesService quotesService;

    @GetMapping("/daily")
    public ApiResponse<List<String>> getDailyQuotes() {
        List<String> quotes = quotesService.getDailyQuotes();
        return ApiResponse.success("获取每日语录成功", quotes);
    }
}

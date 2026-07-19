package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.TimelineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    @Autowired
    private TimelineService timelineService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getTimelineList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = timelineService.getTimelineList(page, size);
        return ApiResponse.success("获取时间线列表成功", result);
    }
}

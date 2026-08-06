package com.example.demo.service;

import com.example.demo.model.mongo.Quotes;
import com.example.demo.repository.mongo.QuotesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuotesService {

    @Autowired
    private QuotesRepository quotesRepository;

    /** 随机获取若干条每日金句 */
    public List<String> getDailyQuotes() {
        List<Quotes> quotes = quotesRepository.findRandomQuotes(20);
        return quotes.stream()
                .map(Quotes::getContent)
                .collect(Collectors.toList());
    }
}

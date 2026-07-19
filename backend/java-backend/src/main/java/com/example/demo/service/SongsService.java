package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.model.mongo.SongTags;
import com.example.demo.model.mongo.Songs;
import com.example.demo.model.mongo.UserLikeSongs;
import com.example.demo.repository.mongo.SongTagsRepository;
import com.example.demo.repository.mongo.SongsRepository;
import com.example.demo.repository.mongo.UserLikeSongsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SongsService {

    @Autowired
    private SongsRepository songsRepository;

    @Autowired
    private UserLikeSongsRepository userLikeSongsRepository;

    @Autowired
    private SongTagsRepository songTagsRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Map<String, Object> getLikeSongs(Integer userId, int page, int size) {
        List<UserLikeSongs> userLikeSongs = userLikeSongsRepository.findByUserIdAndIsLikedNot(userId, false);
        List<String> songIds = userLikeSongs.stream()
                .map(UserLikeSongs::getSongId)
                .collect(Collectors.toList());

        if (songIds.isEmpty()) {
            Map<String, Object> result = new HashMap<>();
            result.put("list", Collections.emptyList());
            result.put("total", 0);
            result.put("page", page);
            result.put("size", size);
            return result;
        }

        List<Songs> allLikedSongs = songsRepository.findByIdInAndDeletedNot(songIds, true);

        // 手动分页
        int total = allLikedSongs.size();
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, total);
        List<Songs> pagedSongs = fromIndex < total ? allLikedSongs.subList(fromIndex, toIndex) : Collections.emptyList();

        List<Map<String, Object>> songList = pagedSongs.stream().map(this::songToMap).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", songList);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public boolean getSongLikeStatus(Integer userId, String songId) {
        return userLikeSongsRepository.findByUserIdAndSongId(userId, songId)
                .map(UserLikeSongs::getIsLiked)
                .orElse(false);
    }

    @Transactional
    public Map<String, Object> likeSong(Integer userId, String songId) {
        UserLikeSongs userLikeSong = userLikeSongsRepository
                .findByUserIdAndSongId(userId, songId)
                .orElseGet(() -> {
                    UserLikeSongs newLike = new UserLikeSongs();
                    newLike.setUserId(userId);
                    newLike.setSongId(songId);
                    newLike.setIsLiked(false);
                    return newLike;
                });

        if (Boolean.TRUE.equals(userLikeSong.getIsLiked())) {
            throw new BusinessException(400, "已经点赞过了");
        }

        userLikeSong.setIsLiked(true);
        userLikeSongsRepository.save(userLikeSong);

        // 增加歌曲点赞数
        Query query = new Query(Criteria.where("_id").is(songId));
        Update update = new Update().inc("likes", 1);
        mongoTemplate.updateFirst(query, update, Songs.class);

        // 返回更新后的点赞数
        Songs song = songsRepository.findById(songId)
                .orElseThrow(() -> new BusinessException(404, "歌曲不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("likes", song.getLikes());
        return result;
    }

    @Transactional
    public Map<String, Object> unlikeSong(Integer userId, String songId) {
        UserLikeSongs userLikeSong = userLikeSongsRepository
                .findByUserIdAndSongId(userId, songId)
                .orElseThrow(() -> new BusinessException(400, "未点赞过该歌曲"));

        if (!Boolean.TRUE.equals(userLikeSong.getIsLiked())) {
            throw new BusinessException(400, "未点赞过该歌曲");
        }

        userLikeSong.setIsLiked(false);
        userLikeSongsRepository.save(userLikeSong);

        // 减少歌曲点赞数
        Query query = new Query(Criteria.where("_id").is(songId));
        Update update = new Update().inc("likes", -1);
        mongoTemplate.updateFirst(query, update, Songs.class);

        // 返回更新后的点赞数
        Songs song = songsRepository.findById(songId)
                .orElseThrow(() -> new BusinessException(404, "歌曲不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("likes", song.getLikes());
        return result;
    }

    public Map<String, Object> getSingleChartData(String tagName, boolean isNew, int limit) {
        SongTags songTag = songTagsRepository.findByNameAndDeletedAndStatus(tagName, false, "ACTIVE")
                .orElseThrow(() -> new BusinessException(404, "标签不存在"));

        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Songs> songs;
        if (isNew) {
            // 新歌榜：筛选最近时间创建的歌曲
            LocalDateTime after = LocalDateTime.now().minusMonths(1);
            songs = songsRepository.findBySongTagsAndDeletedNotAndCreatedAtAfterOrderByPlaybackDesc(
                    tagName, true, after, pageRequest);
        } else {
            songs = songsRepository.findBySongTagsAndDeletedNotOrderByPlaybackDesc(
                    tagName, true, pageRequest);
        }

        List<Map<String, Object>> songList = songs.stream().map(this::songToMap).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("tagName", songTag.getName());
        result.put("icon", songTag.getIcon());
        result.put("desc", songTag.getDesc());
        result.put("songs", songList);
        return result;
    }

    public Map<String, Object> getChartsData(String tagNames, int limit) {
        String[] tagNameArr = tagNames.split(",");
        Map<String, Object> result = new LinkedHashMap<>();
        for (String tagName : tagNameArr) {
            String trimmed = tagName.trim();
            boolean isNew = "华语".equals(trimmed);
            Map<String, Object> chartData = getSingleChartData(trimmed, isNew, limit);
            result.put(trimmed, chartData);
        }
        return result;
    }

    private Map<String, Object> songToMap(Songs song) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", song.getId());
        map.put("name", song.getName());
        map.put("singer", song.getSinger());
        map.put("cover", song.getCover());
        map.put("duration", song.getDuration());
        map.put("playback", song.getPlayback());
        map.put("playlistId", song.getPlaylistId());
        map.put("likes", song.getLikes());
        map.put("songTags", song.getSongTags());
        map.put("createdAt", song.getCreatedAt());
        return map;
    }
}

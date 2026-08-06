package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.model.mongo.SongTags;
import com.example.demo.model.mongo.Songs;
import com.example.demo.model.mongo.UserLikeSongs;
import com.example.demo.repository.mongo.SongTagsRepository;
import com.example.demo.repository.mongo.SongsRepository;
import com.example.demo.repository.mongo.UserLikeSongsRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
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

    /** 分页查询用户点赞的歌曲列表 */
    public Map<String, Object> getLikeSongs(Integer userId, int page, int size) {
        List<UserLikeSongs> userLikeSongs = userLikeSongsRepository.findByUserIdAndIsLikedNot(userId, false);
        List<String> songIds = userLikeSongs.stream()
                .map(UserLikeSongs::getSongId)
                .map(ObjectId::toString)
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

    /** 查询用户是否已点赞该歌曲 */
    public boolean getSongLikeStatus(Integer userId, String songId) {
        return userLikeSongsRepository.findByUserIdAndSongId(userId, new ObjectId(songId))
                .map(UserLikeSongs::getIsLiked)
                .orElse(false);
    }

    /** 用户点赞歌曲，更新点赞数并返回最新点赞数 */
    @Transactional
    public Map<String, Object> likeSong(Integer userId, String songId) {
        UserLikeSongs userLikeSong = userLikeSongsRepository
                .findByUserIdAndSongId(userId, new ObjectId(songId))
                .orElseGet(() -> {
                    UserLikeSongs newLike = new UserLikeSongs();
                    newLike.setUserId(userId);
                    // 新增时 songId 需转换为 ObjectId 类型存储，与查询类型保持一致
                    newLike.setSongId(new ObjectId(songId));
                    newLike.setIsLiked(false);
                    return newLike;
                });

        if (Boolean.TRUE.equals(userLikeSong.getIsLiked())) {
            throw new BusinessException(400, "已经点赞过了");
        }

        userLikeSong.setIsLiked(true);
        userLikeSongsRepository.save(userLikeSong);

        // 增加歌曲点赞数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(songId)));
        Update update = new Update().inc("likes", 1);
        mongoTemplate.updateFirst(query, update, Songs.class);

        // 返回更新后的点赞数
        Songs song = songsRepository.findById(songId)
                .orElseThrow(() -> new BusinessException(404, "歌曲不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("likes", song.getLikes());
        return result;
    }

    /** 用户取消点赞歌曲，更新点赞数并返回最新点赞数 */
    @Transactional
    public Map<String, Object> unlikeSong(Integer userId, String songId) {
        UserLikeSongs userLikeSong = userLikeSongsRepository
                .findByUserIdAndSongId(userId, new ObjectId(songId))
                .orElseThrow(() -> new BusinessException(400, "未点赞过该歌曲"));

        if (!Boolean.TRUE.equals(userLikeSong.getIsLiked())) {
            throw new BusinessException(400, "未点赞过该歌曲");
        }

        userLikeSong.setIsLiked(false);
        userLikeSongsRepository.save(userLikeSong);

        // 减少歌曲点赞数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(songId)));
        Update update = new Update().inc("likes", -1);
        mongoTemplate.updateFirst(query, update, Songs.class);

        // 返回更新后的点赞数
        Songs song = songsRepository.findById(songId)
                .orElseThrow(() -> new BusinessException(404, "歌曲不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("likes", song.getLikes());
        return result;
    }

    /** 获取单个标签下的歌曲榜单，支持新歌榜（仅最近5个月） */
    public Map<String, Object> getSingleChartData(String tagName, boolean isNew, int limit) {
        SongTags songTag = songTagsRepository.findByNameAndDeletedAndStatus(tagName, false, "ACTIVE")
                .orElseThrow(() -> new BusinessException(404, "标签不存在"));

        PageRequest pageRequest = PageRequest.of(0, limit);
        List<Songs> songs;
        if (isNew) {
            // 新歌榜：筛选最近时间创建的歌曲
            LocalDateTime after = LocalDateTime.now().minusMonths(5);
            songs = songsRepository.findBySongTagsAndDeletedNotAndCreatedAtAfterOrderByPlaybackDesc(
                    new ObjectId(songTag.getId()), true, after, pageRequest);
        } else {
            songs = songsRepository.findBySongTagsAndDeletedNotOrderByPlaybackDesc(
                    new ObjectId(songTag.getId()), true, pageRequest);
        }

        List<Map<String, Object>> songList = songs.stream().map(this::songToMap).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("tagName", songTag.getName());
        result.put("icon", songTag.getIcon());
        result.put("desc", songTag.getDesc());
        result.put("songs", songList);
        return result;
    }

    /** 批量获取多个标签的歌曲榜单数据 */
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

    /**
     * 获取歌曲歌词
     * - 歌曲 not found → 抛 404
     * - lrcPath 为空 或 文件不存在 → 返回 lrc 为空字符串（前端显示"暂无歌词"）
     * - 编码自动探测：优先 UTF-8，失败回退 GBK（兼容 Windows 记事本保存的歌词）
     */
    public Map<String, Object> getLyrics(String songId) {
        Songs song = songsRepository.findById(songId)
                .orElseThrow(() -> new BusinessException(404, "歌曲不存在"));

        String lrc = "";
        String lrcPath = song.getLrcPath();
        if (lrcPath != null && !lrcPath.isBlank()) {
            try {
                byte[] bytes = Files.readAllBytes(Path.of(lrcPath));
                lrc = decodeLyrics(bytes);
            } catch (Exception e) {
                log.warn("读取歌词文件失败: songId={}, lrcPath={}, err={}", songId, lrcPath, e.getMessage());
                lrc = "";
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("lrc", lrc);
        return result;
    }

    /**
     * 歌词文本解码：UTF-8 优先，含替换字符则回退 GBK
     */
    private String decodeLyrics(byte[] bytes) {
        String utf8 = new String(bytes, StandardCharsets.UTF_8);
        if (!utf8.contains("\uFFFD")) {
            return utf8;
        }
        return new String(bytes, Charset.forName("GBK"));
    }

    /** 将歌曲对象转为前端需要的Map结构 */
    private Map<String, Object> songToMap(Songs song) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", song.getId());
        map.put("name", song.getName());
        map.put("singer", song.getSinger());
        map.put("cover", song.getCover());
        map.put("path", song.getPath());
        map.put("duration", song.getDuration());
        map.put("playback", song.getPlayback());
        map.put("playlistId", song.getPlaylistId());
        map.put("likes", song.getLikes());
        map.put("songTags", song.getSongTags());
        map.put("createdAt", song.getCreatedAt());
        return map;
    }
}

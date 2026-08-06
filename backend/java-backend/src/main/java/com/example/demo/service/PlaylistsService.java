package com.example.demo.service;

import com.example.demo.common.BusinessException;
import com.example.demo.model.mongo.Playlists;
import com.example.demo.model.mongo.Songs;
import com.example.demo.model.mongo.UserCollectPlaylists;
import com.example.demo.model.mongo.UserLikeSongs;
import com.example.demo.repository.mongo.PlaylistsRepository;
import com.example.demo.repository.mongo.SongsRepository;
import com.example.demo.repository.mongo.UserCollectPlaylistsRepository;
import com.example.demo.repository.mongo.UserLikeSongsRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlaylistsService {

    @Autowired
    private PlaylistsRepository playlistsRepository;

    @Autowired
    private SongsRepository songsRepository;

    @Autowired
    private UserCollectPlaylistsRepository userCollectPlaylistsRepository;

    @Autowired
    private UserLikeSongsRepository userLikeSongsRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    /** 获取按播放量倒序的热门歌单列表 */
    public Map<String, Object> getPlaylist(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "playCount"));
        Page<Playlists> playlistPage = playlistsRepository.findByDeletedNotOrderByPlayCountDesc(true, pageRequest);

        List<Map<String, Object>> playlistList = playlistPage.getContent().stream()
                .map(this::playlistToMap)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", playlistList);
        return result;
    }

    /** 随机获取若干个歌单作为每日推荐 */
    public Map<String, Object> getDailyPlaylist() {
        List<Playlists> playlists = playlistsRepository.findRandomPlaylists(10);

        List<Map<String, Object>> playlistList = playlists.stream()
                .map(this::playlistToMap)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", playlistList);
        return result;
    }

    /** 获取歌单详情，包含歌曲数和用户收藏状态 */
    public Map<String, Object> getPlaylistCover(String playlistId, Integer userId) {
        Playlists playlist = playlistsRepository.findByIdAndDeletedNot(playlistId, true)
                .orElseThrow(() -> new BusinessException(404, "歌单不存在"));

        long songCount = songsRepository.countByPlaylistId(new ObjectId(playlistId));

        Map<String, Object> result = playlistToMap(playlist);
        result.put("songCount", songCount);

        if (userId != null) {
            result.put("isCollected", getUserCollectStatus(playlistId, userId));
        } else {
            result.put("isCollected", false);
        }

        return result;
    }

    /** 查询用户是否已收藏该歌单 */
    public boolean getUserCollectStatus(String playlistId, Integer userId) {
        return userCollectPlaylistsRepository.findByPlaylistIdAndUserId(new ObjectId(playlistId), userId)
                .map(UserCollectPlaylists::getIsCanceled)
                .orElse(false);
    }

    /** 分页获取歌单下的歌曲列表，附带用户点赞状态 */
    public Map<String, Object> getPlaylistSongs(String playlistId, int page, int size, Integer userId) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<Songs> songPage = songsRepository.findByPlaylistId(new ObjectId(playlistId), pageRequest);
        
        List<Map<String, Object>> songList = new ArrayList<>();
        List<String> songIds = songPage.getContent().stream()
                .map(Songs::getId)
                .collect(Collectors.toList());

        // 如果已登录，获取用户喜欢的歌曲ID
        Set<String> likedSongIds = new HashSet<>();
        if (userId != null && !songIds.isEmpty()) {
            likedSongIds = getUserLikedSongIds(userId, songIds);
        }

        for (Songs song : songPage.getContent()) {
            Map<String, Object> songMap = songToMap(song);
            songMap.put("isLiked", likedSongIds.contains(song.getId()));
            songList.add(songMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", songList);
        result.put("total", songPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /** 查询用户在指定歌曲中已点赞的歌曲ID集合 */
    public Set<String> getUserLikedSongIds(Integer userId, List<String> songIds) {
        List<ObjectId> objectIdSongIds = songIds.stream().map(ObjectId::new).collect(Collectors.toList());
        List<UserLikeSongs> userLikeSongs = userLikeSongsRepository.findByUserIdAndSongIdIn(userId, objectIdSongIds);
        return userLikeSongs.stream()
                .filter(uls -> Boolean.TRUE.equals(uls.getIsLiked()))
                .map(UserLikeSongs::getSongId)
                .map(ObjectId::toString)
                .collect(Collectors.toSet());
    }

    /** 用户收藏歌单，更新收藏数并返回最新收藏数 */
    @Transactional
    public Map<String, Object> collectPlaylist(Integer userId, String playlistId) {
        UserCollectPlaylists collect = userCollectPlaylistsRepository
                .findByPlaylistIdAndUserId(new ObjectId(playlistId), userId)
                .orElseGet(() -> {
                    UserCollectPlaylists newCollect = new UserCollectPlaylists();
                    newCollect.setUserId(userId);
                    // 新增时 playlistId 需转换为 ObjectId 类型存储，与查询类型保持一致
                    newCollect.setPlaylistId(new ObjectId(playlistId));
                    newCollect.setIsCanceled(false);
                    return newCollect;
                });

        // 复刻原始Node.js代码的逻辑：isCanceled=true表示已收藏
        // 当isCanceled已经是false时（之前取消收藏过），可以重新收藏
        if (Boolean.TRUE.equals(collect.getIsCanceled())) {
            throw new BusinessException(400, "已经收藏过了");
        }

        collect.setIsCanceled(true);
        userCollectPlaylistsRepository.save(collect);

        // 增加歌单收藏数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(playlistId)));
        Update update = new Update().inc("collects", 1);
        mongoTemplate.updateFirst(query, update, Playlists.class);

        // 返回更新后的收藏数
        Playlists playlist = playlistsRepository.findById(playlistId)
                .orElseThrow(() -> new BusinessException(404, "歌单不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("collects", playlist.getCollects());
        return result;
    }

    /** 用户取消收藏歌单，更新收藏数并返回最新收藏数 */
    @Transactional
    public Map<String, Object> uncollectPlaylist(Integer userId, String playlistId) {
        UserCollectPlaylists collect = userCollectPlaylistsRepository
                .findByPlaylistIdAndUserId(new ObjectId(playlistId), userId)
                .orElseThrow(() -> new BusinessException(400, "未收藏过该歌单"));

        // 复刻原始Node.js代码的bug：检查isCanceled，逻辑看似反转
        // 原始代码中isCanceled=true表示已收藏，检查时如果isCanceled不为true则报错
        if (!Boolean.TRUE.equals(collect.getIsCanceled())) {
            throw new BusinessException(400, "未收藏过该歌单");
        }

        collect.setIsCanceled(false);
        userCollectPlaylistsRepository.save(collect);

        // 减少歌单收藏数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(playlistId)));
        Update update = new Update().inc("collects", -1);
        mongoTemplate.updateFirst(query, update, Playlists.class);

        // 返回更新后的收藏数
        Playlists playlist = playlistsRepository.findById(playlistId)
                .orElseThrow(() -> new BusinessException(404, "歌单不存在"));
        Map<String, Object> result = new HashMap<>();
        result.put("collects", playlist.getCollects());
        return result;
    }

    /** 分页查询用户已收藏的歌单列表 */
    public Map<String, Object> getCollectsPlaylist(Integer userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        // isCanceled=true 表示已收藏（复刻原始代码的逻辑反转）
        Page<UserCollectPlaylists> collectPage = userCollectPlaylistsRepository
                .findByUserIdAndIsCanceled(userId, true, pageRequest);

        List<String> playlistIds = collectPage.getContent().stream()
                .map(UserCollectPlaylists::getPlaylistId)
                .map(ObjectId::toString)
                .collect(Collectors.toList());

        List<Playlists> playlists = playlistIds.isEmpty()
                ? Collections.emptyList()
                : playlistsRepository.findByIdInAndDeletedNot(playlistIds, true);

        List<Map<String, Object>> playlistList = playlists.stream()
                .map(this::playlistToMap)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", playlistList);
        result.put("total", collectPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /** 将歌单对象转为前端需要的Map结构 */
    private Map<String, Object> playlistToMap(Playlists playlist) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", playlist.getId());
        map.put("name", playlist.getName());
        map.put("creator", playlist.getCreator());
        map.put("creatorAvatar", playlist.getCreatorAvatar());
        map.put("description", playlist.getDescription());
        map.put("coverImage", playlist.getCoverImage());
        map.put("playCount", playlist.getPlayCount());
        map.put("collects", playlist.getCollects());
        map.put("path", playlist.getPath());
        map.put("updateTime", playlist.getUpdateTime());
        map.put("createdAt", playlist.getCreatedAt());
        return map;
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

package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.demo.common.BusinessException;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.mongo.Treehole;
import com.example.demo.model.mysql.User;
import com.example.demo.repository.mongo.TreeholeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TreeholeService {

    @Autowired
    private TreeholeRepository treeholeRepository;

    @Autowired
    private UserMapper userMapper;

    /** 获取最新的树洞消息列表，附带用户头像 */
    public List<Map<String, Object>> getMessage(int limit) {
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createTime"));
        List<Treehole> messages = treeholeRepository.findByDeletedNotAndReviewStatusOrderByCreateTimeDesc(true, "APPROVED", pageRequest);

        // 批量获取用户头像
        Set<Integer> userIds = messages.stream()
                .map(Treehole::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, User> userMap = resolveUsers(userIds);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Treehole msg : messages) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", msg.getId());
            item.put("content", msg.getContent());
            item.put("createTime", msg.getCreateTime());
            item.put("userId", msg.getUserId());
            User user = userMap.get(msg.getUserId());
            if (user != null) {
                item.put("cover", user.getCover());
            }
            result.add(item);
        }

        return result;
    }

    /** 校验用户10秒内是否发过消息，防止刷屏 */
    public void checkRecentMessage(Integer userId) {
        LocalDateTime tenSecondsAgo = LocalDateTime.now().minusSeconds(10);
        boolean recent = treeholeRepository.existsByUserIdAndCreateTimeAfterAndDeletedNotAndReviewStatus(
                userId, tenSecondsAgo, true, "APPROVED");
        if (recent) {
            throw new BusinessException(429, "发送过于频繁，请稍后再试");
        }
    }

    /** 创建树洞消息，校验频率后保存为待审核状态 */
    public void createMessage(String content, Integer userId) {
        checkRecentMessage(userId);

        Treehole message = new Treehole();
        message.setContent(content);
        message.setUserId(userId);
        message.setCreateTime(LocalDateTime.now());
        message.setReviewStatus("PENDING");
        message.setDeleted(false);
        treeholeRepository.save(message);
    }

    /** 批量根据用户ID查询用户信息映射 */
    private Map<Integer, User> resolveUsers(Set<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>().in(User::getUserId, userIds)
        );
        return users.stream().collect(Collectors.toMap(User::getUserId, u -> u, (a, b) -> a));
    }
}
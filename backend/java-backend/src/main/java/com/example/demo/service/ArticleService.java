package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.demo.common.BusinessException;
import com.example.demo.common.JwtUtil;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.mongo.Article;
import com.example.demo.model.mongo.Categories;
import com.example.demo.model.mongo.Comments;
import com.example.demo.model.mongo.Tags;
import com.example.demo.model.mongo.UserArticleInteraction;
import com.example.demo.model.mysql.User;
import com.example.demo.repository.mongo.ArticleRepository;
import com.example.demo.repository.mongo.CategoriesRepository;
import com.example.demo.repository.mongo.CommentsRepository;
import com.example.demo.repository.mongo.TagsRepository;
import com.example.demo.repository.mongo.UserArticleInteractionRepository;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Autowired
    private TagsRepository tagsRepository;

    @Autowired
    private CommentsRepository commentsRepository;

    @Autowired
    private UserArticleInteractionRepository interactionRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MongoTemplate mongoTemplate;

    /** 分页查询已发布文章列表，附带分类、标签、作者信息 */
    public Map<String, Object> getArticleList(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "published"));
        Page<Article> articlePage = articleRepository.findByDeletedNotAndStatus(true, "PUBLIC", pageRequest);

        List<Article> articles = articlePage.getContent();
        List<Map<String, Object>> articleList = new ArrayList<>();

        // 批量获取分类和标签
        Set<String> categoryIds = articles.stream()
                .map(Article::getCategory)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> tagIds = articles.stream()
                .map(Article::getTag)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, String> categoryNameMap = resolveCategoryNames(categoryIds);
        Map<String, String> tagNameMap = resolveTagNames(tagIds);

        // 批量获取作者信息
        Set<Integer> authorIds = articles.stream()
                .map(Article::getAuthor)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Integer, User> authorMap = resolveAuthors(authorIds);

        for (Article article : articles) {
            Map<String, Object> item = articleToMap(article);
            // 截断内容为40字符
            if (article.getContent() != null && article.getContent().length() > 40) {
                item.put("content", article.getContent().substring(0, 40));
            }
            // 直接用中文名替换 id
            item.put("category", categoryNameMap.getOrDefault(article.getCategory(), ""));
            item.put("tag", tagNameMap.getOrDefault(article.getTag(), ""));

            User author = authorMap.get(article.getAuthor());
            if (author != null) {
                item.put("authorName", author.getUsername());
                item.put("authorCover", author.getCover());
            }
            articleList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", articleList);
        result.put("total", articlePage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /** 根据文章ID查询文章详情，包含上下篇、评论数及用户点赞收藏状态 */
    public Map<String, Object> getArticleById(String id, Integer userId) {
        Article article = articleRepository.findByIdAndDeletedNot(id, true)
                .orElseThrow(() -> new BusinessException(404, "文章不存在"));

        // 上一篇文章
        Optional<Article> prevArticle = findPrevArticle(article.getPublished());
        Optional<Article> nextArticle = findNextArticle(article.getPublished());

        Map<String, Object> result = articleToMap(article);
        // 直接用中文名替换 id
        result.put("category", resolveCategoryNames(Set.of(article.getCategory())).getOrDefault(article.getCategory(), ""));
        result.put("tag", resolveTagNames(Set.of(article.getTag())).getOrDefault(article.getTag(), ""));

        // 评论数
        result.put("comments", commentsRepository.countByArticleId(new ObjectId(id)));

        // 作者信息
        if (article.getAuthor() != null) {
            User author = userMapper.selectById(article.getAuthor());
            if (author != null) {
                result.put("author", author.getUsername());
                result.put("avatar", author.getCover());
            }
        }

        // 上一篇/下一篇
        prevArticle.ifPresent(prev -> result.put("prev", Map.of("id", prev.getId(), "title", prev.getTitle())));
        nextArticle.ifPresent(next -> result.put("next", Map.of("id", next.getId(), "title", next.getTitle())));

        // 点赞/收藏状态
        if (userId != null) {
            result.put("isLiked", getArticleLikeStatus(id, userId));
            result.put("isCollected", getArticleCollectStatus(id, userId));
        } else {
            result.put("isLiked", false);
            result.put("isCollected", false);
        }

        return result;
    }

    /** 随机获取若干篇文章 */
    public List<Article> getRandomArticles() {
        return articleRepository.findRandomArticles(3);
    }

    /** 查询用户是否已点赞该文章 */
    public boolean getArticleLikeStatus(String articleId, Integer userId) {
        return interactionRepository.findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .map(UserArticleInteraction::getIsLiked)
                .orElse(false);
    }

    /** 查询用户是否已收藏该文章 */
    public boolean getArticleCollectStatus(String articleId, Integer userId) {
        return interactionRepository.findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .map(UserArticleInteraction::getIsCollected)
                .orElse(false);
    }

    /** 用户点赞文章，原子更新点赞数并返回最新点赞数 */
    @Transactional
    public long likeArticle(String articleId, Integer userId) {
        UserArticleInteraction interaction = interactionRepository
                .findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .orElseGet(() -> {
                    UserArticleInteraction newInteraction = new UserArticleInteraction();
                    newInteraction.setUserId(userId);
                    // 新增时 articleId 需转换为 ObjectId 类型存储，与查询类型保持一致
                    newInteraction.setArticleId(new ObjectId(articleId));
                    newInteraction.setIsLiked(false);
                    newInteraction.setIsCollected(false);
                    return newInteraction;
                });

        if (Boolean.TRUE.equals(interaction.getIsLiked())) {
            throw new BusinessException(400, "已经点赞过了");
        }

        interaction.setIsLiked(true);
        interactionRepository.save(interaction);

        // 更新文章点赞数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(articleId)));
        Update update = new Update().inc("likes", 1);
        mongoTemplate.updateFirst(query, update, Article.class);

        Article article = mongoTemplate.findOne(query, Article.class);
        return article != null ? article.getLikes() : 0;
    }

    /** 用户取消点赞文章，原子更新点赞数并返回最新点赞数 */
    @Transactional
    public long unlikeArticle(String articleId, Integer userId) {
        UserArticleInteraction interaction = interactionRepository
                .findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .orElseThrow(() -> new BusinessException(400, "未点赞过该文章"));

        if (!Boolean.TRUE.equals(interaction.getIsLiked())) {
            throw new BusinessException(400, "未点赞过该文章");
        }

        interaction.setIsLiked(false);
        interactionRepository.save(interaction);

        // 更新文章点赞数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(articleId)));
        Update update = new Update().inc("likes", -1);
        mongoTemplate.updateFirst(query, update, Article.class);

        Article article = mongoTemplate.findOne(query, Article.class);
        return article != null ? article.getLikes() : 0;
    }

    /** 用户收藏文章，原子更新收藏数并返回最新收藏数 */
    @Transactional
    public long collectArticle(String articleId, Integer userId) {
        UserArticleInteraction interaction = interactionRepository
                .findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .orElseGet(() -> {
                    UserArticleInteraction newInteraction = new UserArticleInteraction();
                    newInteraction.setUserId(userId);
                    // 新增时 articleId 需转换为 ObjectId 类型存储，与查询类型保持一致
                    newInteraction.setArticleId(new ObjectId(articleId));
                    newInteraction.setIsLiked(false);
                    newInteraction.setIsCollected(false);
                    return newInteraction;
                });

        if (Boolean.TRUE.equals(interaction.getIsCollected())) {
            throw new BusinessException(400, "已经收藏过了");
        }

        interaction.setIsCollected(true);
        interactionRepository.save(interaction);

        // 更新文章收藏数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(articleId)));
        Update update = new Update().inc("collects", 1);
        mongoTemplate.updateFirst(query, update, Article.class);

        Article article = mongoTemplate.findOne(query, Article.class);
        return article != null ? article.getCollects() : 0;
    }

    /** 用户取消收藏文章，原子更新收藏数并返回最新收藏数 */
    @Transactional
    public long uncollectArticle(String articleId, Integer userId) {
        UserArticleInteraction interaction = interactionRepository
                .findByArticleIdAndUserId(new ObjectId(articleId), userId)
                .orElseThrow(() -> new BusinessException(400, "未收藏过该文章"));

        if (!Boolean.TRUE.equals(interaction.getIsCollected())) {
            throw new BusinessException(400, "未收藏过该文章");
        }

        interaction.setIsCollected(false);
        interactionRepository.save(interaction);

        // 更新文章收藏数
        Query query = new Query(Criteria.where("_id").is(new ObjectId(articleId)));
        Update update = new Update().inc("collects", -1);
        mongoTemplate.updateFirst(query, update, Article.class);

        Article article = mongoTemplate.findOne(query, Article.class);
        return article != null ? article.getCollects() : 0;
    }

    /** 分页查询文章的评论列表，附带评论者信息 */
    public Map<String, Object> getArticleComments(String articleId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));

        Page<Comments> commentPage = commentsRepository.findByArticleIdAndDeletedNotAndReviewStatus(
                new ObjectId(articleId), true, "APPROVED", pageRequest);

        List<Map<String, Object>> commentList = new ArrayList<>();
        for (Comments comment : commentPage.getContent()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", comment.getId());
            item.put("content", comment.getContent());
            item.put("createTime", comment.getCreateTime());
            item.put("userId", comment.getUserId());

            // 获取评论者信息
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                item.put("username", user.getUsername());
                item.put("cover", user.getCover());
            }

            commentList.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", commentList);
        result.put("total", commentPage.getTotalElements());
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    /** 创建文章评论，校验频率后保存并返回评论总数 */
    public long createArticleComment(String articleId, String content, Integer userId) {
        checkRecentMessage(userId);

        Comments comment = new Comments();
        // 新增评论时 articleId 需转换为 ObjectId 类型存储，与查询类型保持一致
        comment.setArticleId(new ObjectId(articleId));
        comment.setContent(content);
        comment.setUserId(userId);
        comment.setCreateTime(LocalDateTime.now());
        comment.setReviewStatus("APPROVED");
        comment.setDeleted(false);
        commentsRepository.save(comment);

        return commentsRepository.countByArticleId(new ObjectId(articleId));
    }

    /** 校验用户1分钟内是否评论过，防止刷屏 */
    public void checkRecentMessage(Integer userId) {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        boolean recent = commentsRepository.existsByUserIdAndCreateTimeAfter(userId, oneMinuteAgo);
        if (recent) {
            throw new BusinessException(429, "评论过于频繁，请稍后再试");
        }
    }

    /** 将文章对象转为前端需要的Map结构 */
    private Map<String, Object> articleToMap(Article article) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", article.getId());
        map.put("category", article.getCategory());
        map.put("tag", article.getTag());
        map.put("cover", article.getCover());
        map.put("title", article.getTitle());
        map.put("published", article.getPublished());
        map.put("updated", article.getUpdated());
        map.put("content", article.getContent());
        map.put("pageViews", article.getPageViews());
        map.put("likes", article.getLikes());
        map.put("wordCount", article.getWordCount());
        map.put("collects", article.getCollects());
        map.put("author", article.getAuthor());
        return map;
    }

    /** 批量根据分类ID查询分类名映射 */
    private Map<String, String> resolveCategoryNames(Set<String> categoryIds) {

        if (categoryIds == null || categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Categories> categories = categoriesRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(categoryIds), true, "ACTIVE");

        return categories.stream().collect(Collectors.toMap(Categories::getId, Categories::getName, (a, b) -> a));
    }

    /** 批量根据标签ID查询标签名映射 */
    private Map<String, String> resolveTagNames(Set<String> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Tags> tags = tagsRepository.findByIdInAndDeletedNotAndStatus(
                new ArrayList<>(tagIds), true, "ACTIVE");
        return tags.stream().collect(Collectors.toMap(Tags::getId, Tags::getName, (a, b) -> a));
    }

    /** 批量根据作者ID查询作者信息映射 */
    private Map<Integer, User> resolveAuthors(Set<Integer> authorIds) {
        if (authorIds == null || authorIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>().in(User::getUserId, authorIds)
        );
        return users.stream().collect(Collectors.toMap(User::getUserId, u -> u, (a, b) -> a));
    }

    private Optional<Article> findPrevArticle(LocalDateTime published) {
        Query query = new Query(Criteria.where("published").lt(published)
                .and("deleted").ne(true)
                .and("status").is("PUBLIC"))
                .with(Sort.by(Sort.Direction.DESC, "published"))
                .limit(1);
        List<Article> results = mongoTemplate.find(query, Article.class);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /** 查询发布时间晚于当前文章的下一篇公开文章 */
    private Optional<Article> findNextArticle(LocalDateTime published) {
        Query query = new Query(Criteria.where("published").gt(published)
                .and("deleted").ne(true)
                .and("status").is("PUBLIC"))
                .with(Sort.by(Sort.Direction.ASC, "published"))
                .limit(1);
        List<Article> results = mongoTemplate.find(query, Article.class);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
}

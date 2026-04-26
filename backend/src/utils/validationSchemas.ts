import Joi from "joi"

export const idSchema = Joi.object({
    id: Joi.string().required()
        .pattern(/^[0-9a-fA-F]{24}$/) // 匹配24位十六进制字符串
})

export const PageQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    size: Joi.number().integer().min(1).max(15).default(10)
})

export const contentParamsSchema = Joi.object({
    content: Joi.string().required().trim()
}).concat(PageQuerySchema)

export const playlistQuerySchema = Joi.object({
    mode: Joi.string().trim().valid('daily', 'normal').default('normal').optional(),
    limit: Joi.number().integer().default(6).optional()
})

export const danmuSchema = Joi.object({
    content: Joi.string().required().trim()
})

export const limitSchema = Joi.object({
    limit: Joi.number().integer().required().default(30)
})

export const chartsSchema = Joi.object({
    tagNames: Joi.string().default('华语,日语,欧美'),
    limit: Joi.number().integer().min(1).max(50).default(5)
})

export const singleChartSchema = Joi.object({
    isNew: Joi.boolean().default(false),
    limit: Joi.number().integer().min(1).max(50).default(10)
})

export const phonSchema = Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '手机号格式错误',
        'any.required': '手机号不能为空'
    }),
})

export const registerSchema = Joi.object({
    code: Joi.string().length(6).required().messages({
        'string.length': '验证码必须是6位数字',
        'any.required': '验证码不能为空'
    }),
    username: Joi.string().min(2).max(20).required().messages({
        'string.min': '用户名至少2个字符',
        'string.max': '用户名最多20个字符',
        'any.required': '用户名不能为空'
    }),
    password: Joi.string().length(64).pattern(/^[0-9a-fA-F]{64}$/).required().messages({
        'string.pattern.base': '密码必须是有效的',
        'any.required': '密码不能为空'
    })
}).concat(phonSchema);

export const keywordSchema = Joi.object({
    keyword: Joi.string().trim().max(50).description('文章搜索关键词（匹配标题/内容）'),
}).concat(PageQuerySchema)

export const simpleKeywordSchema = Joi.object({
    keyword: Joi.string().trim().max(50).required()
})

export const updateProfileSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional(),
    signature: Joi.string().max(100).allow('').optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional()
});

export const chat = Joi.object({
    content: Joi.string().trim().required()
})

export const cursorPaginationSchema = Joi.object({
    cursor: Joi.string().optional()
        .isoDate()
}).concat(PageQuerySchema)
import { idSchema } from '@/utils/validationSchemas'
import express from 'express';
import Article from '@/models/Article';
import Songs from '@/models/Songs';
import { validateParams } from '@/utils/validateQueryParams'

// interface IdParams {
//     id?: string;
//     [key: string]: any;
// }

// export interface ValidationResult<T> {
//     userId: number;
//     id: string;
//     data: T;
// }

// export type ArticleLikeValidationResult = ValidationResult<any>;
// export type PlaylistValidationResult = ValidationResult<any>;
// export type SongsValidationResult = ValidationResult<any>


// export function validateIdParams(params: IdParams, res: express.Response) {
//     const { error, value } = idSchema.validate(params);

//     // 校验失败：返回统一格式的失败结果
//     if (error) {
//         res.status(400).json({
//             code: 400,
//             message: `参数错误：${error.details[0].message}`,
//             data: null
//         });

//         return {
//             valid: false,
//         };
//     }

//     return {
//         valid: true,
//         data: value
//     };
// }

// /**
//  * 验证文章点赞/取消点赞请求
//  * @param req 请求对象
//  * @param res 响应对象
//  * @returns 验证成功返回 { userId, id, data }，失败时直接发送响应并返回 undefined
//  */
// export async function validateArticleLikeCollectedRequest(req: express.Request, res: express.Response): Promise<ArticleLikeValidationResult | undefined> {
//     return validateRequest<any>(req, res, Article, '文章不存在');
// }

// export async function validatePlaylistCollectedRequest(req: express.Request, res: express.Response): Promise<PlaylistValidationResult | undefined> {
//     return validateRequest<any>(req, res, Article, '歌单不存在');
// }

// /**
//  * 通用请求验证函数
//  * @param req 请求对象
//  * @param res 响应对象
//  * @param model 模型类
//  * @param errorMessage 不存在时的错误消息
//  * @returns 验证成功返回 { userId, id, data }，失败时直接发送响应并返回 undefined
//  */
// async function validateRequest<T>(
//     req: express.Request, 
//     res: express.Response, 
//     model: any, 
//     errorMessage: string
// ): Promise<ValidationResult<T> | undefined> {
//     if (!req.auth) {
//         res.status(401).json({
//             code: 401,
//             message: '请先登录'
//         });
//         return;
//     }

//     const { userId } = req.auth;
//     const validateId = validateParams(req.params, res, idSchema);

//     if (!validateId.valid) {
//         return;
//     }

//     const { id } = validateId.data;

//     const data = await model.findById(id);
//     if (!data) {
//         res.status(404).json({
//             code: 404,
//             message: errorMessage
//         });
//         return;
//     }

//     return { userId, id, data: data as T };
// }

// export async function validateSongsRequest(req: express.Request, res: express.Response): Promise<SongsValidationResult | undefined> {
//     return validateRequest<any>(req, res, Songs, '歌单不存在');
// }
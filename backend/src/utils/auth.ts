export interface userInfo {
    userId: number;       // 用户ID（MongoDB的_id是字符串）
    username: string;     // 用户名
    cover: string | null;
    signature: string
}
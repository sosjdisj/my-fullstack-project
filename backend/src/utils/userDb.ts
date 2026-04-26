import { prisma } from '@/config/db'; // 导入连接池
import bcrypt from 'bcryptjs';

// 1. 登录校验（你项目的核心场景）
export async function verifyUserLogin(username: string, password: string) {
    const user = await prisma.user.findFirst({
        where: {
            username,
            deleted: 0
        }
    })
    if (!user) return null;

    const isPwdValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPwdValid) return false;

    return {
        user_id: user.user_id,
        username: user.username,
        avatar: user.cover,
        signature: user.signature
    };
}


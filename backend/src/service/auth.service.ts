import { prisma } from '@/config/db'
import { verifyUserLogin } from '@/utils/userDb'
import bcrypt from 'bcryptjs'

// 验证用户登录
export async function verifyLogin(username: string, password: string) {
    return await verifyUserLogin(username, password)
}

// 检查手机号是否已注册
export async function checkPhoneExists(phone: string) {
    const user = await prisma.user.findFirst({
        where: {
            phone,
            deleted: 0
        },
        select: {
            phone: true
        }
    })
    return !!user
}

// 注册新用户
export async function registerUser(username: string, password: string, phone: string) {
    const encryptedPwd = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
        data: {
            username,
            password_hash: encryptedPwd,
            phone,
            publish_time: new Date(),
            update_time: new Date()
        }
    })
    return newUser
}
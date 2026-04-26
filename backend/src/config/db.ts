import mongoose from 'mongoose'
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

dotenv.config();

// 数据库连接函数
const connectDB = async () => {
    try {
        // 连接 MongoDB（本地地址，testDB 是数据库名）
        const conn = await mongoose.connect('mongodb://localhost:27017/myblog');

        console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB 连接失败`);
        process.exit(1);
    }
};

const adapter = new PrismaMariaDb({
    host: "localhost",
    user: "root",
    password: '2369',
    database: "myblog",
    connectionLimit: 10,
    allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({ adapter });

export { connectDB, prisma };
import { tool } from "langchain";
import { z } from "zod";
import { getMessage } from '@/service/treehole.service';

// 工具1：获取树洞消息
export const getTreeholeMessagesTool = tool(
    async ({ limit }) => {
        const messages = await getMessage(limit);
        return JSON.stringify({
            messages: messages.map(msg => ({
                content: msg.content?.substring(0, 100) + (msg.content?.length > 100 ? '...' : '')
            })),
            note: "请根据上述树洞消息，用自然语言向用户分享这些匿名留言，不要直接显示 JSON。"
        });
    },
    {
        name: "get_treehole_messages",
        description: "获取树洞（匿名留言板）的最新消息",
        schema: z.object({
            limit: z.number().default(10).describe("返回的消息数量"),
        }),
    }
);

// 导出树洞相关工具数组
export const treeholeTools = [getTreeholeMessagesTool];

import { getAIModel } from '@/config/ai';
// 👆 拿来 Gemma 4 的大脑。你在 Ollama 里跑的 gemma3:4b 或者 gemma3:12b
//    Gemma 4 的特点是推理强、指令跟随准，尤其擅长多轮工具调用

import { createAgent } from "langchain";

import { allTools } from './agent-tools';
// 👆 拿来工具箱。Gemma 4 的工具调用能力是原生训练过的，很稳

let agentInstance: ReturnType<typeof createAgent> | null = null;
// 👆 这是一个“单间宿舍”。TypeScript 高级写法，意思是：
//    “这个变量的类型，就是 createAgent 函数返回的那个玩意的类型，现在先空着(null)”
//    通俗讲：给 Gemma 4 机器人留了一个专属停车位，车还没来。

export async function getAgent() {
    if (!agentInstance) {
        const model = await getAIModel();  // 👈 先拿到 model

        agentInstance = createAgent({
            model,                          // 👈 必填：你刚才配置的 Gemma 4
            tools: allTools,                // 👈 必填：工具列表
            // 下面是可选配置
            systemPrompt: "你是一个乐于助人的 AI 助手，可以使用工具来回答问题。",  // 系统提示词
        });
    }
    return agentInstance;
}

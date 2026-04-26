import { initChatModel } from "langchain";

let modelInstance: Awaited<ReturnType<typeof initChatModel>> | null = null;
// 👆 类型定义：因为 initChatModel 是异步的，返回的是 Promise，
//    所以用 Awaited 解包，拿到真正的 model 类型

export async function getAIModel() {
    // 👆 注意！变成 async 了，因为 initChatModel 返回 Promise
    if (!modelInstance) {
        modelInstance = await initChatModel("ollama:gemma4:e4b", {
            // 👆 显式指定 ollama 厂商，模型名写你本地的 gemma4:e4b
            temperature: 0.7,
            maxTokens: 2048,      // Gemma 4 支持长上下文
            timeout: 120,         // 本地模型推理慢，超时设长一点
        });
    }
    return modelInstance;
}
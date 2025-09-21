import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";

const ragWordChainStep = createStep({
  id: "rag-word-chain",
  description: "Generates the next word in the rag word chain",
  inputSchema: z.object({
    word: z.string().describe("現在の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  outputSchema: z.object({
    word: z.string().describe("次の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  execute: async ({ mastra, inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    let result;
    // 20%の確率でしりとりを終わらせるエージェントを使う
    if (Math.random() < 0.2) {
      result = await mastra
        .getAgent("wordChainEndAgent")
        .generate(inputData.word);
    } else {
      result = await mastra
        .getAgent("ragWordChainAgent")
        .generate(inputData.word);
    }
    let output;
    try {
      output = JSON.parse(result.text);
    } catch (e) {
      output = { word: "ん", status: "game over" };
    }
    console.log("output", output);

    return { word: output.word, status: output.status };
  },
});

const ragWordChainWorkflow = createWorkflow({
  id: "rag-word-chain-workflow",
  inputSchema: z.object({
    word: z.string().describe("現在の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  outputSchema: z.object({
    result: z.number().describe("最終結果"),
  }),
})
  .dountil(
    ragWordChainStep,
    async ({ inputData }) => inputData.status === "game over"
  )
  .commit();

export default ragWordChainWorkflow;

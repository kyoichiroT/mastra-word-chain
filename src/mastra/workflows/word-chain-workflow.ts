import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";

const wordChainStep = createStep({
  id: "word-chain",
  description: "Generates the next word in the word chain",
  inputSchema: z.object({
    word: z.string().describe("現在の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  outputSchema: z.object({
    word: z.string().describe("次の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  execute: async ({ mastra, inputData, bail }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    // if (input.status === "game over") {
    //   bail({ word: input.word, status: input.status });
    // }
    let result;
    // 20%の確率でしりとりを終わらせるエージェントを使う
    if (Math.random() < 0.2) {
      result = await mastra
        .getAgent("wordChainEndAgent")
        .generate(inputData.word);
    } else {
      result = await mastra.getAgent("wordChainAgent").generate(inputData.word);
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

const wordChainWorkflow = createWorkflow({
  id: "word-chain-workflow",
  inputSchema: z.object({
    word: z.string().describe("現在の単語"),
    status: z.string().describe("ゲームの状態"),
  }),
  outputSchema: z.object({
    result: z.number().describe("最終結果"),
  }),
})
  .dountil(
    wordChainStep,
    async ({ inputData }) => inputData.status === "game over"
  )
  .commit();

export default wordChainWorkflow;

import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";

const add1 = createStep({
  id: "add-1",
  description: "Adds 1 to a number",
  inputSchema: z.object({
    number: z.number().describe("1足される数"),
  }),
  outputSchema: z.object({
    number: z.number().describe("1足したあとの数"),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    return { number: inputData.number + 1 };
  },
});

const additionLoopWorkflow = createWorkflow({
  id: "addition-loop-workflow",
  inputSchema: z.object({
    number: z.number().describe("初期値"),
  }),
  outputSchema: z.object({
    result: z.number().describe("最終結果"),
  }),
})
  .dountil(add1, async ({ inputData }) => inputData.number >= 10)
  .commit();

export default additionLoopWorkflow;

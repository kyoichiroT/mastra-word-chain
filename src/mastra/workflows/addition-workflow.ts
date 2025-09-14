import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";

const add1 = createStep({
  id: "add-1",
  description: "Adds 1 to a number",
  inputSchema: z.object({
    initialNumber: z.number().describe("1足される数"),
  }),
  outputSchema: z.object({
    added1Number: z.number().describe("1足したあとの数"),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    return { added1Number: inputData.initialNumber + 1 };
  },
});

const add10 = createStep({
  id: "add-10",
  description: "Adds 10 to a number",
  inputSchema: z.object({
    added1Number: z.number().describe("10足される数"),
  }),
  outputSchema: z.object({
    added10Number: z.number().describe("10足したあとの数"),
  }),
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }
    return { added10Number: inputData.added1Number + 10 };
  },
});

const additionWorkflow = createWorkflow({
  id: "addition-workflow",
  inputSchema: z.object({
    initialNumber: z.number().describe("初期値"),
  }),
  outputSchema: z.object({
    result: z.number().describe("最終結果"),
  }),
})
  .then(add1)
  .then(add10)
  .commit();

export default additionWorkflow;

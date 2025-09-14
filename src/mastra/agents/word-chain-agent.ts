import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

// しりとりエージェント
export const wordChainAgent = new Agent({
  name: "Word Chain Agent",
  instructions: `
    あなたはしりとりをするエージェントです。
出力結果は必ずJSON形式で以下のフォーマットに従ってください。
{
  "word": "次の単語",
  "status": "in the game" // "in the game" または "game over"
}
`,
  model: openai("gpt-5-nano"),
});

// しりとりを終わらせるエージェント
export const wordChainEndAgent = new Agent({
  name: "Word Chain End Agent",
  instructions: `
    あなたはしりとりを終わらせるエージェントです。
必ず「ん」で終わる単語を出力してください。
出力結果は必ずJSON形式で以下のフォーマットに従ってください。
{
    "word": "任意の「ん」で終わる単語",
    "status": "game over" // 必ず "game over"
}
`,
  model: openai("gpt-5-nano"),
});

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import additionWorkflow from "./workflows/addition-workflow";
import additionLoopWorkflow from "./workflows/addition-loop-workflow";
import { wordChainAgent, wordChainEndAgent } from "./agents/word-chain-agent";
import wordChainWorkflow from "./workflows/word-chain-workflow";

export const mastra = new Mastra({
  workflows: {
    weatherWorkflow,
    additionWorkflow,
    additionLoopWorkflow,
    wordChainWorkflow,
  },
  agents: { weatherAgent, wordChainAgent, wordChainEndAgent },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});

import { createTool } from "@mastra/core/tools";
import z from "zod";
import fs from "node:fs/promises";
import OpenAI from "openai";
import { CreateEmbeddingResponse, Embedding } from "openai/resources";
import { KNN } from "@ai-on-browser/data-analysis-models/lib/model/knearestneighbor";

const DATA_FILE_PATH = "../../src/mastra/data/voc_list_kiso.csv";
const VECTOR_DB_FILE_PATH = "../../src/mastra/data/vector_db.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * コサイン類似度を計算する関数
 * @param a ベクトルA
 * @param b ベクトルB
 * @returns コサイン類似度
 */
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]; // 内積
    normA += a[i] ** 2; // Aのノルム
    normB += b[i] ** 2; // Bのノルム
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  // ゼロ除算を防ぐ
  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB); // コサイン類似度
};

/**
 * csvファイルを読み込む
 * @returns 単語と読みの2次元配列。string[2][n]形
 */
const readCsvFile = async (): Promise<string[][]> => {
  const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
  return data
    .split(/\r?\n/)
    .map((line) => line.split(",").map((item) => item.trim()));
};

/**
 * ベクトルデータベース(ファイル)の作成
 * @return 作成したベクトルデータベース
 */
const createVectorDatabase = async (
  text: string[]
): Promise<Array<Embedding>> => {
  console.log("Creating vector database...");
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  // ベクトルデータベース(ファイル)の作成
  fs.writeFile(VECTOR_DB_FILE_PATH, JSON.stringify(response.data), "utf-8");

  return response.data;
};

/**
 * ベクトルデータの取得
 */
const getVectorDb = async (): Promise<Embedding[]> => {
  // ベクトルデータベース(ファイル)の読み込み
  let vectorDbStr;
  let vectorDb;
  try {
    vectorDbStr = await fs.readFile(VECTOR_DB_FILE_PATH, "utf-8");
  } catch (error) {
    vectorDbStr = null;
  }

  // ベクトルデータベース(ファイル)が存在しない場合は新規作成
  if (!vectorDbStr) {
    const wordDataList = await readCsvFile();
    const words: string[] = wordDataList.map((wordData) => wordData[0]);
    vectorDb = await createVectorDatabase(words);
  } else {
    vectorDb = JSON.parse(vectorDbStr);
  }

  return vectorDb;
};

// 類似単語取得APIを呼び出す関数
const getSimilarWords = async (
  word: string
): Promise<{ word: string; read: string }[]> => {
  // ベクトルデータベースの取得
  const vectorDb = await getVectorDb();
  // 単語データ(カテゴリ)の取得
  const wordDataList = await readCsvFile();

  // 入力単語のベクトルを取得
  const response: CreateEmbeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: word,
  });

  const inputVector = response.data;

  // ai-on-browser使って類似度検索(これはk近傍だった)(備忘のためにk近傍のコードは残す)
  // const model = new KNN(5, (a, b) => {
  //   let aa = 0;
  //   let bb = 0;
  //   let ab = 0;
  //   for (let i = 0; i < a.length; i++) {
  //     aa += a[i] ** 2;
  //     bb += b[i] ** 2;
  //     ab += a[i] * b[i];
  //   }
  //   return 1 - ab / Math.sqrt(aa * bb);
  // });
  // model.fit(
  //   vectorDb.map((v) => v.embedding),
  //   wordDataList.map((v) => [v[0], v[1]])
  // );
  // vectorDb.forEach((v) => {
  //   console.log("vectorDb");
  //   // console.log({ ...v, embedding: v.embedding.slice(0, 20) });
  // });
  // console.log("inputVector", inputVector);

  // // console.log("wordDataList", wordDataList);

  // // 上位5件の単語を返す
  // const nearPoint = model._near_points(inputVector[0].embedding) as Array<{
  //   d: number; // 距離
  //   category: any; // model.fit()で指定したカテゴリ(第ニ引数)の型
  //   idx: number; // データのインデックス
  // }>;

  // コサイン類似度を計算して類似度を格納
  const similarities = vectorDb.map((v, index) => {
    const vector = v.embedding; // ベクトルを取得
    const similarity = cosineSimilarity(inputVector[0].embedding, vector); // コサイン類似度を計算
    return { similarity, category: wordDataList[index] }; // 類似度とカテゴリを格納
  });

  // 類似度でソートし、上位5件を取得
  similarities.sort((a, b) => b.similarity - a.similarity);
  const top50 = similarities.slice(0, 50);

  console.log(top50);

  return top50.map((p) => {
    return { word: p.category[0], read: p.category[1] };
  });
};

// 類似単語取得ツールの定義
export const getSimilarityWordTool = async () => {
  return createTool({
    id: "get-similarity-word",
    description:
      "しりとりの回答として使用できる、入力した単語と類似した単語を上位5件取得します。",
    inputSchema: z.object({
      word: z.string().describe("Input word"),
    }),
    outputSchema: z.object({
      words: z
        .array(
          z.object({
            word: z.string().describe("Similar word"),
            read: z.string().describe("Reading of the similar word"),
          })
        )
        .describe("Similar words"),
    }),
    execute: async ({ context }) => {
      return { words: await getSimilarWords(context.word) };
    },
  });
};

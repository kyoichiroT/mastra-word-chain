import 'dotenv/config';
import { mastra } from './mastra/index.js';

console.log('Mastra Word Chain プロジェクトが正常にセットアップされました！');
console.log('Environment loaded:', process.env.NODE_ENV || 'development');

// Mastra instance imported from ./mastra/index.ts
console.log('Mastra initialized successfully');

// Get available workflows and agents using the correct API
const workflows = await mastra.getWorkflows();
const agents = await mastra.getAgents();

console.log('Available workflows:', Object.keys(workflows));
console.log('Available agents:', Object.keys(agents));
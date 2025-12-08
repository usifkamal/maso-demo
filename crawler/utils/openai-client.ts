import { OpenAI } from 'langchain/llms/openai';
import { CallbackManager } from 'langchain/callbacks';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI Credentials');
}

export const openai = new OpenAI({
  temperature: 0,
});

export const openaiStream = new OpenAI({
  temperature: 0,
  streaming: true,
  callbackManager: CallbackManager.fromHandlers({
    handleLLMNewToken(token) {
      console.log(token);
    },
  }),
});

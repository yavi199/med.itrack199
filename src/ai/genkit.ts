/**
 * @fileOverview This file configures the Genkit AI instance.
 *
 * It is responsible for initializing the AI plugins and models.
 * It will automatically use the application's service account credentials
 * when running on Google Cloud infrastructure.
 */
import 'dotenv/config';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

if (!process.env.GEMINI_API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'GEMINI_API_KEY is not set. Using application default credentials on Firebase.'
    );
  } else {
    throw new Error('GEMINI_API_KEY is not set. Please set it in your .env file.');
  }
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});

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

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});

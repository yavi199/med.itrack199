import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config(); // Carga las variables de entorno desde el archivo .env

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta'})],
  model: 'googleai/gemini-1.5-flash-latest',
});

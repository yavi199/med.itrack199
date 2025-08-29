import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// La autenticación se manejará automáticamente por el entorno de Google Cloud
// al no proporcionar una clave de API explícita.

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta'})],
  model: 'googleai/gemini-1.5-flash-latest',
});

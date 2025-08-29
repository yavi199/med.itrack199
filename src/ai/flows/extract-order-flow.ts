'use server';

/**
 * @fileOverview Extracts information from medical orders (PDF or image) using Google Gemini with vision.
 *
 * - extractOrder - A function that handles the extraction process.
 * - ExtractOrderInput - The input type for the extractOrder function.
 * - ExtractOrderOutput - The return type for the extractOrder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const ExtractOrderInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A medical order (PDF or image), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractOrderInput = z.infer<typeof ExtractOrderInputSchema>;

const ExtractOrderOutputSchema = z.object({
  patient: z.object({
    fullName: z.string().describe('The full name of the patient.'),
    id: z.string().describe('The document ID of the patient.'),
    birthDate: z.string().describe('The birth date of the patient.'),
    entidad: z.string().describe('The insurer of the patient.'),
  }),
  studies: z.array(
    z.object({
      cups: z.string().describe('The CUPS code of the study.'),
      nombre: z.string().describe('The description of the study.'),
    })
  ).describe('An array of studies requested in the order.'),
  diagnosis: z.object({
    code: z.string().describe('The CIE-10 code of the diagnosis.'),
    description: z.string().describe('The description of the diagnosis.'),
  }),
});
export type ExtractOrderOutput = z.infer<typeof ExtractOrderOutputSchema>;

export async function extractOrder(input: ExtractOrderInput): Promise<ExtractOrderOutput> {
  return extractOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractOrderPrompt',
  input: {schema: ExtractOrderInputSchema},
  output: {schema: ExtractOrderOutputSchema},
  prompt: `You are an expert medical assistant specializing in extracting information from medical orders.  The medical orders can be in a variety of image formats, or PDF.

You will extract the following information from the document, and return it in JSON format:

- patient: {
  fullName: The full name of the patient
  id: The document ID of the patient
  birthDate: The birth date of the patient
  entidad: The insurer of the patient
}
- studies: An array of objects, where each object contains:
  cups: The CUPS code of the study
  nombre: The description of the study
- diagnosis: {
  code: The CIE-10 code of the diagnosis
  description: The description of the diagnosis
}


Here is the medical order:

{{media url=fileDataUri}}`,
});

const extractOrderFlow = ai.defineFlow(
  {
    name: 'extractOrderFlow',
    inputSchema: ExtractOrderInputSchema,
    outputSchema: ExtractOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

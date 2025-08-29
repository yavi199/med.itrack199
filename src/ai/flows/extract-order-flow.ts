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
    id: z.string().describe('Número de documento del paciente.'),
    fullName: z.string().describe('Nombres y apellidos completos del paciente.'),
    birthDate: z.string().describe('Fecha de nacimiento del paciente en formato AAAA-MM-DD.'),
    sex: z.string().describe('Sexo del paciente.'),
    entidad: z.string().describe('Nombre de la administradora o aseguradora.'),
  }),
  studies: z.array(
      z.object({
        cups: z.string().describe('El código del estudio solicitado (CUPS).'),
        nombre: z.string().describe('El nombre del estudio solicitado.'),
        details: z.string().optional().describe('Información adicional como si es simple, contrastado, etc.'),
      })
    ).describe('An array of studies requested in the order.'),
  diagnosis: z.object({
    code: z.string().describe('El código CIE-10 del diagnóstico (ej. R51X).'),
    description: z.string().describe('La descripción del diagnóstico (ej. CEFALEA).'),
  }),
  physician: z.object({
    fullName: z.string().describe('Nombre del profesional que ordena el estudio.'),
    registryNumber: z.string().describe('Número de registro médico del profesional.'),
    specialty: z.string().describe('Especialidad del profesional.'),
  }),
  order: z.object({
    date: z.string().describe('Fecha de la orden en formato AAAA-MM-DD.'),
    institutionName: z.string().describe('Nombre de la institución que emite la orden.'),
    admissionNumber: z.string().optional().describe('Número de admisión o referencia interna de la orden.'),
  })
});
export type ExtractOrderOutput = z.infer<typeof ExtractOrderOutputSchema>;

export async function extractOrder(input: ExtractOrderInput): Promise<ExtractOrderOutput> {
  return extractOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractOrderPrompt',
  input: {schema: ExtractOrderInputSchema},
  output: {schema: ExtractOrderOutputSchema},
  prompt: `Eres un asistente de inteligencia artificial especializado en procesar órdenes médicas de imágenes diagnósticas en Colombia. Tu tarea es extraer la información clave de la siguiente orden y estructurarla en un formato JSON.

Analiza el texto de la orden que te proporcionaré y extrae los siguientes campos. Asegúrate de devolver las fechas en formato AAAA-MM-DD.

- **patient.id**: Número de documento del paciente.
- **patient.fullName**: Nombres y apellidos completos del paciente.
- **patient.birthDate**: Fecha de nacimiento del paciente en formato AAAA-MM-DD.
- **patient.sex**: Sexo del paciente.
- **patient.entidad**: Nombre de la administradora o aseguradora.

- **studies**: Un array de estudios. Para cada estudio, extrae:
  - **studies.cups**: El código del estudio solicitado (CUPS).
  - **studies.nombre**: El nombre del estudio solicitado.
  - **studies.details**: Información adicional como si es simple, contrastado, etc.

- **diagnosis.code**: El código CIE-10 del diagnóstico (ej. R51X).
- **diagnosis.description**: La descripción del diagnóstico (ej. CEFALEA).

- **physician.fullName**: Nombre del profesional que ordena el estudio.
- **physician.registryNumber**: Número de registro médico del profesional.
- **physician.specialty**: Especialidad del profesional.

- **order.date**: Fecha de la orden en formato AAAA-MM-DD.
- **order.institutionName**: Nombre de la institución que emite la orden.
- **order.admissionNumber**: El número de admisión o referencia, si está disponible.

Aquí está la orden médica:

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

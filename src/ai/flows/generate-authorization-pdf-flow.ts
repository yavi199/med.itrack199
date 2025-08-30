'use server';

/**
 * @fileOverview Generates an authorization PDF from extracted medical order data.
 *
 * - generateAuthorizationPdf - A function that creates a PDF document.
 * - GenerateAuthorizationPdfOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ExtractOrderOutput } from './extract-order-flow';

// The input for this flow is the output from the extractOrderFlow
const GenerateAuthorizationPdfInputSchema = z.custom<ExtractOrderOutput>();

const GenerateAuthorizationPdfOutputSchema = z.object({
  pdfBase64: z.string().describe('The generated PDF file, encoded as a Base64 string.'),
});
export type GenerateAuthorizationPdfOutput = z.infer<typeof GenerateAuthorizationPdfOutputSchema>;


export async function generateAuthorizationPdf(input: ExtractOrderOutput): Promise<GenerateAuthorizationPdfOutput> {
  const pdfBytes = await createPdf(input);
  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  return { pdfBase64 };
}

ai.defineFlow(
    {
      name: 'generateAuthorizationPdfFlow',
      inputSchema: GenerateAuthorizationPdfInputSchema,
      outputSchema: GenerateAuthorizationPdfOutputSchema,
    },
    async (input) => {
        const pdfBytes = await createPdf(input);
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        return { pdfBase64 };
    }
);


async function createPdf(data: ExtractOrderOutput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 10;
  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, x: number, yPos: number, isBold = false, size = fontSize) => {
    page.drawText(text, {
      x,
      y: yPos,
      font: isBold ? boldFont : font,
      size,
      color: rgb(0, 0, 0),
    });
    return size + 4; 
  };
  
  const drawLine = (yPos: number) => {
      page.drawLine({
          start: { x: margin, y: yPos },
          end: { x: width - margin, y: yPos },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
      });
      return 10;
  }

  // Header
  y -= drawText('AUTORIZACIÓN DE SERVICIOS DE SALUD', margin, y, true, 16);
  y -= 20;

  // Institution and Order Date
  drawText(`Institución: ${data.order.institutionName}`, margin, y);
  drawText(`Fecha Orden: ${data.order.date}`, width / 2, y);
  y -= 20;
  y -= drawLine(y);
  
  // Patient Information
  y -= drawText('DATOS DEL PACIENTE', margin, y, true, 12);
  y -= 5;
  drawText(`Nombre: ${data.patient.fullName}`, margin, y);
  drawText(`ID: ${data.patient.id}`, width / 2, y);
  y -= 15;
  drawText(`Fecha Nacimiento: ${data.patient.birthDate}`, margin, y);
  drawText(`Sexo: ${data.patient.sex}`, width / 2, y);
  y -= 15;
  drawText(`Aseguradora: ${data.patient.entidad}`, margin, y);
  y -= 20;
  y -= drawLine(y);
  
  // Diagnosis Information
  y -= drawText('DIAGNÓSTICO', margin, y, true, 12);
  y -= 5;
  drawText(`CIE-10: ${data.diagnosis.code}`, margin, y);
  y -= 15;
  drawText(`Descripción: ${data.diagnosis.description}`, margin, y);
  y -= 20;
  y -= drawLine(y);
  
  // Physician Information
  y -= drawText('MÉDICO QUE ORDENA', margin, y, true, 12);
  y -= 5;
  drawText(`Nombre: ${data.physician.fullName}`, margin, y);
  y -= 15;
  drawText(`Registro: ${data.physician.registryNumber}`, margin, y);
  drawText(`Especialidad: ${data.physician.specialty}`, width / 2, y);
  y -= 20;
  y -= drawLine(y);
  
  // Studies Information
  y -= drawText('ESTUDIOS SOLICITADOS', margin, y, true, 12);
  y -= 5;
  data.studies.forEach((study) => {
    drawText(`CUPS: ${study.cups}`, margin, y);
    y -= 15;
    drawText(`Nombre: ${study.nombre}`, margin, y);
    y -= 15;
    if (study.details) {
      drawText(`Detalles: ${study.details}`, margin, y);
      y -= 15;
    }
  });
  y -= 10;
  y -= drawLine(y);
  
  // Footer
  y -= 20;
  const footerText = 'Este documento es una autorización generada automáticamente y no requiere firma manual. Válido para los servicios descritos.';
  const footerLines = footerText.split(' ');
  let currentLine = '';
  const maxLineWidth = width - 2 * margin;

  const tempLines: string[] = [];
  let line = '';
  for (const word of footerLines) {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 8);
      if (testWidth > maxLineWidth) {
          tempLines.push(line);
          line = word + ' ';
      } else {
          line = testLine;
      }
  }
  tempLines.push(line);

  tempLines.forEach(l => {
      drawText(l, margin, y, false, 8);
      y -= 10;
  });


  return pdfDoc.save();
}

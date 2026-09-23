import fs from 'fs';
import pdfParse from 'pdf-parse';

export class DocumentService {
  /**
   * Extracts text from uploaded PDF or TXT buffer/file
   */
  async extractText(filePath: string, mimeType: string): Promise<string> {
    const dataBuffer = await fs.promises.readFile(filePath);

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
      try {
        const parsed = await pdfParse(dataBuffer);
        return parsed.text ? parsed.text.trim() : '';
      } catch (err: any) {
        console.error('Error parsing PDF document:', err);
        throw new Error(`Failed to extract text from PDF: ${err.message}`);
      }
    } else {
      // Plain text or markdown
      return dataBuffer.toString('utf-8').trim();
    }
  }

  /**
   * Generates a 2-3 sentence summary of the extracted text
   */
  generateQuickSummary(text: string): string {
    if (!text || text.length === 0) return 'Empty document.';
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean.length <= 250) return clean;
    return clean.slice(0, 240) + '...';
  }
}

export const documentService = new DocumentService();

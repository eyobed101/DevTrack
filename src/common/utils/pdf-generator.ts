import { createPdf } from 'pdfmake/build/pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

export function generatePdf(data: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Report', style: 'header' },
        // Add dynamic content based on data
      ],
      styles: {
        header: { fontSize: 18, bold: true }
      }
    };
    
    const pdfDoc = createPdf(docDefinition);
    pdfDoc.getBuffer((buffer) => {
      resolve(buffer);
    });
  });
}

export default generatePdf;
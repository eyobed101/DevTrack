import * as ExcelJS from 'exceljs';

export async function generateExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add headers and data
  worksheet.addRow(['Metric', 'Value']);
  Object.entries(data.metrics).forEach(([key, value]) => {
    worksheet.addRow([key, value]);
  });

  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}

export default generateExcel;
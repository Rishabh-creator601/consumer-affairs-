const PDFDocument = require('pdfkit');
const docx = require('docx');
const exceljs = require('exceljs');
const qrcode = require('qrcode');

async function generatePDF(inspection, product) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text('LM-Verify Compliance Report', { align: 'center' }).moveDown();
      doc.fontSize(12).text(`Inspection Ref: ${inspection.refNumber}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Officer: ${inspection.officerDetails}`).moveDown();

      // Product Details
      doc.fontSize(16).text('Product Identity').moveDown(0.5);
      doc.fontSize(12)
         .text(`Brand: ${product.brand || 'N/A'}`)
         .text(`Generic Name: ${product.genericName || 'N/A'}`)
         .text(`Category: ${product.category || 'N/A'}`)
         .text(`GTIN: ${product.gtin || 'N/A'}`).moveDown();

      // Declarations Table Mockup
      doc.fontSize(16).text('Statutory Declarations').moveDown(0.5);
      const decs = inspection.declarations || {};
      doc.fontSize(12).text(`Net Quantity: ${decs.netQuantity?.value || 'N/A'}`);
      doc.text(`MRP: ${decs.mrp?.value || 'N/A'}`);
      doc.text(`Manufacturer: ${decs.manufacturer?.name || 'N/A'}`).moveDown();

      // Verification QR
      const qrDataUrl = await qrcode.toDataURL(inspection.refNumber || 'VERIFY');
      doc.image(qrDataUrl, 50, doc.y, { width: 100 }).moveDown();

      // Signature Block
      doc.moveDown(5);
      doc.text('_______________________', { align: 'right' });
      doc.text('Inspector Signature    ', { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

async function generateDOCX(inspection, product) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'LM-Verify Compliance Report',
            heading: HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Inspection Ref: ${inspection.refNumber}`, bold: true }),
            ],
          }),
          new Paragraph(`Brand: ${product.brand || 'N/A'}`),
          new Paragraph(`Generic Name: ${product.genericName || 'N/A'}`),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

async function generateXLSX(inspection, product) {
  const workbook = new exceljs.Workbook();
  const sheet = workbook.addWorksheet('Product Details');
  
  sheet.columns = [
    { header: 'Property', key: 'prop', width: 20 },
    { header: 'Value', key: 'val', width: 30 }
  ];

  sheet.addRow({ prop: 'Inspection Ref', val: inspection.refNumber });
  sheet.addRow({ prop: 'Brand', val: product.brand });
  sheet.addRow({ prop: 'Generic Name', val: product.genericName });
  sheet.addRow({ prop: 'GTIN', val: product.gtin });

  const sheet2 = workbook.addWorksheet('Compliance Results');
  sheet2.columns = [
    { header: 'Rule', key: 'rule', width: 15 },
    { header: 'Verdict', key: 'verdict', width: 15 }
  ];
  if (inspection.checklist) {
    inspection.checklist.forEach(c => {
      sheet2.addRow({ rule: c.rule, verdict: c.verdict });
    });
  }

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generatePDF, generateDOCX, generateXLSX };

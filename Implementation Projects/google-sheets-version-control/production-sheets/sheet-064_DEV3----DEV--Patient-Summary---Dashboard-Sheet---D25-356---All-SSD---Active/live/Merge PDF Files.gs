
async function getMergePdfFileUrl_(PdfFileIds, DestinationFolder, OutputFileName) {

  if (PdfFileIds === null || PdfFileIds.length === 0 || typeof PdfFileIds !== 'object') return;

  console.log('getting pdf data ...');
  // const PdfFileIds = ['1NXjMmTq0YloZX55A2okwuwr3_4zWDl3a', '1QKLgS8QLQB0R8uDs_sneS_HhFUHhTWWQ'];
  const PdfFilesData = PdfFileIds.map(id => new Uint8Array(DriveApp.getFileById(id).getBlob().getBytes()));

  console.log('merging pdfs ...');
  const CDNJS = 'https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js';
  eval(UrlFetchApp.fetch(CDNJS).getContentText()); // Load pdf-lib

  const setTimeout = function (f, t) {
    Utilities.sleep(t);
    return f();
  }

  const PdfDoc = await PDFLib.PDFDocument.create();

  for (let i = 0; i < PdfFilesData.length; i++) {
    const PdfData = await PDFLib.PDFDocument.load(PdfFilesData[i]);
    const PdfPages = await PdfDoc.copyPages(PdfData, [...Array(PdfData.getPageCount())].map((_, i) => i));
    PdfPages.forEach(page => PdfDoc.addPage(page));
  }

  const PdfBlob = await PdfDoc.save();

  console.log('creating merged pdf file ...');
  const NewFile = DestinationFolder.createFile(Utilities.newBlob(
    [...new Int8Array(PdfBlob)], MimeType.PDF, OutputFileName + '.pdf'));

  const NewFileUrl = NewFile.getUrl();
  return NewFileUrl;

}


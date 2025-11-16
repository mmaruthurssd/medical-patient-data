

const SHEET_TO_WATCH = 'Provider Tracking Sheet List';


const TEMPLATE_ID = '16dyvfgivjx8u0bpqM6iCSmRkdxB1PzOkGFnTmpehB2c';


function onEditInstall(e) {

  const range = e.range;
  const sheet = range.getSheet();


  if (sheet.getName() === SHEET_TO_WATCH) {
    const editedRow = range.getRow();
    const editedCol = range.getColumn();
    if (editedCol === 2 && (e.value == true || e.value == "TRUE")) {

      const nameCell = sheet.getRange(editedRow, 1);
      const linkCell = sheet.getRange(editedRow, 3);

      const nameCellValue = nameCell.getValue();

      // Stop if the name cell in Column A is empty.
      if (nameCellValue === '') {
        range.setValue(false); // Uncheck the box
        return;
      }

      // Stop if there is already a link in Column C.
      if (linkCell.getValue() !== '') {
        range.setValue(false); // Uncheck the box
        return;
      }

      let newSpreadsheetName = nameCellValue + " - Provider Patient Tracking Sheet"

      try {
        const templateFile = DriveApp.getFileById(TEMPLATE_ID);
        const newFile = templateFile.makeCopy(newSpreadsheetName);
        const newFileUrl = newFile.getUrl();
        let richValue=SpreadsheetApp.newRichTextValue().setText(newSpreadsheetName).setLinkUrl(newFileUrl).build()
        //const hyperlinkFormula = `=HYPERLINK("${newFileUrl}", "${newSpreadsheetName}")`;
        linkCell.setRichTextValue(richValue);

      } catch (error) {
        Logger.log(error);
      } finally {
        range.setValue(false);
      }


    }
  } else {
    onEditSort(e)
  }


}




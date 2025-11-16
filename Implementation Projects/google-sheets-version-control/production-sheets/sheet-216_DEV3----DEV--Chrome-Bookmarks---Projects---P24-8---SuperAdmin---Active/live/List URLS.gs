function searchDriveUrlsFromChipsColumnD() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const colDRange = sheet.getRange(1, 4, lastRow); // Column D (file names/chips)
  const colERange = sheet.getRange(1, 5, lastRow); // Column E (for URLs)
  const values = colDRange.getValues();
  const validations = colERange.getDataValidations();

  for (let i = 0; i < lastRow; i++) {
    const fileName = values[i][0];
    const nextColValidation = validations[i][0];

    if (fileName && !nextColValidation) {
      const files = DriveApp.getFilesByName(fileName.toString().trim());
      if (files.hasNext()) {
        const file = files.next();
        const url = file.getUrl();
        sheet.getRange(i + 1, 5).setValue(url); // Write to column E
      } else {
        sheet.getRange(i + 1, 5).setValue("File not found");
      }
    }
  }
}

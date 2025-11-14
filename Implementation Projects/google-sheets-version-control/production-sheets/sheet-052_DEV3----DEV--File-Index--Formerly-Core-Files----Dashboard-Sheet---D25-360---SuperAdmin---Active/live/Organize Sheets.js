


const DEST_SS_ID = "1KMsidrbBLL_cc1vmiSozSopW4AMIGTDHMgSNDs0kGYw"


function onEditInstall(e) {

  //return
  const ss = e.source;
  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getSheetName() != "Sheets Recent Activity" && activeSheet.getSheetName() != "Copy-Sheets Recent Activity" && activeSheet.getSheetName() != "Automated File Index") {
    onEditSort(e)
    return
  }
  return

  const row = e.range.getRow();
  const col = e.range.getColumn();

  let value = e.value;

  if (row > 1 && col == 7 && value != "" && activeSheet.getSheetName() == "Automated File Index") {

    const destSS = SpreadsheetApp.openById(DEST_SS_ID);
    const destSheet = destSS.getSheetByName(value);
    const richValue = activeSheet.getRange(row, 3).getValue();

    let name = cleanMyText(richValue.getText())

    destSheet.insertRowAfter(3);
    destSheet.getRange(4, 7).setValue(name)
    destSheet.getRange(4, 9).setRichTextValue(richValue)



  } else if (row > 1 && col == 7 && value != "") {

    const destSS = SpreadsheetApp.openById(DEST_SS_ID);
    const destSheet = destSS.getSheetByName(value);

    const richValue = activeSheet.getRange(row, 3).getRichTextValue();

    let name = cleanMyText(richValue.getText())

    destSheet.insertRowAfter(3);
    destSheet.getRange(4, 7).setValue(name)
    destSheet.getRange(4, 9).setRichTextValue(richValue)

    activeSheet.getRange(row, 8).setValue("Processing Name")

  }

}



function cleanMyText(inputText) {
  // Chain replace() methods to clean the text
  // The 'gi' flag means it replaces ALL occurrences (g) and is CASE-INSENSITIVE (i)
  const cleanedText = inputText
    .replace(/-/g, '')                  // Removes all hyphens
    .replace(/Active/gi, '')            // Removes "Active", "active", "ACTIVE", etc.
    .replace(/All SSD/gi, '')           // Removes "All SSD", "all ssd", etc.
    .replace(/Superadmin/gi, '');       // Removes "Superadmin", "superadmin", etc.

  // Optional: Clean up extra spaces that might be left over
  return cleanedText.replace(/\s+/g, ' ').trim();
}










const DEST_SS_ID = "1KMsidrbBLL_cc1vmiSozSopW4AMIGTDHMgSNDs0kGYw"


function onEditInstall(e) {
  const ss = e.source;
  const activeSheet = ss.getActiveSheet();

  if (activeSheet.getSheetName() != "Main Shared Drive - Sheets" && activeSheet.getSheetName() != "Superadmin - Sheets" && activeSheet.getSheetName() != "Archive - Sheets" && activeSheet.getSheetName() != "Billing - Sheets") {
    onEditSort(e)
    return
  }

  return


  const row = e.range.getRow();
  const col = e.range.getColumn();

  let value = e.value;

  if (row > 1 && col == 8 && value != "") {

    const destSS = SpreadsheetApp.openById(DEST_SS_ID);
    const destSheet = destSS.getSheetByName(value);
    const richValue = activeSheet.getRange(row, 3).getValue();

    let name = cleanMyText(activeSheet.getRange(row, 2).getValue())

    destSheet.insertRowAfter(3);
    destSheet.getRange(4, 8).setValue(name)
    destSheet.getRange(4, 12).setValue(richValue)

    //destSheet.getRange(destSheet.getLastRow() + 1, 7, 1, 3).setValues([[name, "", richValue]])

    activeSheet.getRange(row, 9).setValue("Processing Name")


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




const INTRA_SS_ID = "1FiY_BJMVV1vuG1ZVNrGwNjrNZ1VEzsDnFUlRmwaNYIE"
const INTRA_SHEET_NAME = "Tab List"

const SOURCE_SHEETS_FOR_INTRA = ["Projects", "Dashboards", "Google Sheets", "Processing Sheets", "Uncategorized"]


/************************************
 * Main
 ************************************/
function listSheetNamesFromLinkedUrls() {

  const destSS = SpreadsheetApp.openById(INTRA_SS_ID);
  const destSheet = destSS.getSheetByName(INTRA_SHEET_NAME);

  const destData = destSheet.getRange(1, 1, destSheet.getLastRow(), 6).getValues();

  const destSSIDIndex = destData[0].indexOf("SS ID");
  const destTabNameIndex = destData[0].indexOf("Tab Name");
  const destAccessIndex = destData[0].indexOf("Access (based on internal access)");

  const destFullIDS = destData.map(r => r[destSSIDIndex] + r[destTabNameIndex])

  const destIds = destData.map(r => r[destSSIDIndex])


  const ss = SpreadsheetApp.getActiveSpreadsheet();

   for (var s = 0; s < SOURCE_SHEETS_FOR_INTRA.length; s++) {
  //for (var s = 0; s < 2; s++) {

    let sourceSheet = ss.getSheetByName(SOURCE_SHEETS_FOR_INTRA[s])
    let sourceRich = sourceSheet.getRange("M1:M").getRichTextValues();
    let sourceCheck = sourceSheet.getRange("L1:L").getValues();
    let sourceDrive = sourceSheet.getRange("G1:G").getValues();


    SpreadsheetApp.flush()

    for (var i = 0; i < sourceCheck.length; i++) {
      if (sourceCheck[i][0] == true || sourceCheck[i][0] == "TRUE") {
        let url = sourceRich[i][0].getLinkUrl();

        if (url == null) continue


        let ssID = _extractSpreadsheetId(url)

        if (!ssID) continue

        //Logger.log(ssID)

        const tempSS = SpreadsheetApp.openById(ssID);

        let indexOfId = destIds.indexOf(ssID);
        let access = "";
        if (indexOfId > -1) {
          access = destData[indexOfId][destAccessIndex]
        } 
        // else {
        //   access = getSheetEditorsViewersEmails_(tempSS).join(", ")
        // }



        let splitUrl = url.split("gid")[0];




        const tempSSName = tempSS.getName()
        let allTempSheets = tempSS.getSheets();

        allTempSheets.forEach(tab => {

          let tabName = tab.getName()
          let indexOfFullID = destFullIDS.indexOf(ssID + tabName);

          if (indexOfFullID == -1) {
            let tempUrl = splitUrl + `gid=${tab.getSheetId()}#gid=${tab.getSheetId()}`
            destData.push([ssID, tempUrl, access, sourceDrive[i][0], tempSSName, tabName])
          }

        })



      }
    }



  }

  destSheet.getRange(1, 1, destData.length, destData[0].length).setValues(destData)



}




/**
 * Sheets-native: open the spreadsheet and read editors/viewers.
 * (Does NOT use Drive.Permissions.list.)
 */
function getSheetEditorsViewersEmails_(spr) {
  //const spr = SpreadsheetApp.openById(fileId);
  const emails = new Set();

  // Editors
  spr.getEditors().forEach(u => {
    const e = (u && u.getEmail && u.getEmail()) ? u.getEmail().toLowerCase() : '';
    if (e) emails.add(e);
  });

  // Viewers
  spr.getViewers().forEach(u => {
    const e = (u && u.getEmail && u.getEmail()) ? u.getEmail().toLowerCase() : '';
    if (e) emails.add(e);
  });

  return Array.from(emails).sort();
}




// Extract spreadsheet ID from common Google Sheets URL variants
function _extractSpreadsheetId(url) {
  // /spreadsheets/d/{ID}/...
  let m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (m && m[1]) return m[1];

  // ?id={ID}
  m = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (m && m[1]) return m[1];

  // Fallback: any 25+ length drive-like ID substring
  m = url.match(/([a-zA-Z0-9-_]{25,})/);
  if (m && m[1]) return m[1];

  return null;
}











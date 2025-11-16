



function moveFilesToDestFolders() {

  //}

  //function moveFilesToDestFoldersTest() {
  //return
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Document Dump");
  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  let headersObj = {};
  for (var i = 0; i < headers.length; i++) {
    headersObj[headers[i]] = i
  }


  const vendorSheet = ss.getSheetByName("Vendors List");
  const vendorData = vendorSheet.getRange(2, 1, vendorSheet.getLastRow() - 1, 3).getRichTextValues();
  const [vendorMap, vendorSheetMap] = mapFolderAndSheet_(vendorData)



  const projectSheet = ss.getSheetByName("Project List");
  const projectData = projectSheet.getRange(2, 1, projectSheet.getLastRow() - 1, 3).getRichTextValues();
  const [projectMap, projectSheetMap] = mapFolderAndSheet_(projectData)


  const dashboardSheet = ss.getSheetByName("Dashboard List");
  const dashboardData = dashboardSheet.getRange(2, 1, dashboardSheet.getLastRow() - 1, 3).getRichTextValues();
  const [dashMap, dashSheetMap] = mapFolderAndSheet_(dashboardData)


  const employeeSheet = ss.getSheetByName("Employee List");
  const employeeData = employeeSheet.getRange(2, 1, employeeSheet.getLastRow() - 1, 3).getRichTextValues();
  const [employeeMap, employeeSheetMap] = mapFolderAndSheet_(employeeData)


  const cplList = ss.getSheetByName("CPL List");
  const cplListData = cplList.getRange(2, 1, cplList.getLastRow() - 1, 3).getRichTextValues();
  const [cplListMap, cplListSheetMap] = mapFolderAndSheet_(cplListData)


  const incList = ss.getSheetByName("Incomming Ref List");
  const incListData = incList.getRange(2, 1, incList.getLastRow() - 1, 3).getRichTextValues();
  const [incListMap, incListSheetMap] = mapFolderAndSheet_(incListData)


  const outList = ss.getSheetByName("Out Ref List");
  const outListData = outList.getRange(2, 1, outList.getLastRow() - 1, 3).getRichTextValues();
  const [outListMap, outListSheetMap] = mapFolderAndSheet_(outListData)


  const paV3List = ss.getSheetByName("PA V3 List");
  const paV3ListData = paV3List.getRange(2, 1, paV3List.getLastRow() - 1, 3).getRichTextValues();
  const [paV3ListMap, paV3ListSheetMap] = mapFolderAndSheet_(paV3ListData)


  // const sheetList = ss.getSheetByName("Sheet List");
  // const sheetListData = sheetList.getRange(2, 1, sheetList.getLastRow() - 1, 3).getRichTextValues();
  // const [sheetListMap, sheetListSheetMap] = mapFolderAndSheet_(sheetListData)



  const dataRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()); // Columns F (file URL) to H (vendor)
  const rows = dataRange.getValues();



  rows.forEach((row, index) => {


    if (row[headersObj["Processed"]] == "" && row[headersObj["Vendors"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Vendors"]]) {
      //processVendorFile_(sheet, index, "Vendors", row, headersObj, vendorMap, vendorSheetMap)
      processFileMoving_(sheet, index, "Vendors", row, headersObj, vendorMap, vendorSheetMap)

    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Projects"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Projects"]]) {
      processFileMoving_(sheet, index, "Projects", row, headersObj, projectMap, projectSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["File Management"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["File Management"]]) {
      //moveNow_(sheet, index, "Dashboard", row, headersObj, projectMap)
      processFileMoving_(sheet, index, "File Management", row, headersObj, dashMap, dashSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Employee"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Employee"]]) {
      //moveNow_(sheet, index, "Employee", row, headersObj, employeeMap)
      processFileMoving_(sheet, index, "Employee", row, headersObj, employeeMap, employeeSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Cancer Policies Requests"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Cancer Policies Requests"]]) {
      //moveNow_(sheet, index, "Employee", row, headersObj, employeeMap)
      processFileMoving_(sheet, index, "Cancer Policies Requests", row, headersObj, cplListMap, cplListSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Incoming Referrals"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Incoming Referrals"]]) {
      //moveNow_(sheet, index, "Employee", row, headersObj, employeeMap)
      processFileMoving_(sheet, index, "Incoming Referrals", row, headersObj, incListMap, incListSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Outgoing Referrals"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Outgoing Referrals"]]) {
      //moveNow_(sheet, index, "Employee", row, headersObj, employeeMap)
      processFileMoving_(sheet, index, "Outgoing Referrals", row, headersObj, outListMap, outListSheetMap)
    }


    if (row[headersObj["Processed"]] == "" && row[headersObj["Prior authorizations"]] != "" && row[headersObj["File Url"]] != "" && row[headersObj["Prior authorizations"]]) {
      //moveNow_(sheet, index, "Employee", row, headersObj, employeeMap)
      processFileMoving_(sheet, index, "Prior authorizations", row, headersObj, paV3ListMap, paV3ListSheetMap)
    }


  });

}



function processFileMoving_(sheet, index, destCol, row, headersObj, folderMap, sheetMap) {

  try {
    const destSS = SpreadsheetApp.openById(sheetMap[row[headersObj[destCol]]])
    const destSheet = destSS.getSheetByName("Documents");
    let richText = SpreadsheetApp.newRichTextValue().setText(row[headersObj["File Name"]]).setLinkUrl(row[headersObj["File Url"]]).build()
    //let rowData = [row[headersObj["File Name"]], "", "", row[headersObj["File Url"]]]
    destSheet.getRange(destSheet.getLastRow() + 1, 1).setRichTextValue(richText)

    moveNow_(sheet, index, destCol, row, headersObj, folderMap)
  } catch (err) { }
}


function moveNow_(sheet, index, destCol, row, headersObj, folderMap) {
  try {
    //Logger.log(destCol)
    const fileId = extractIdFromUrl(row[headersObj["File Url"]]);
    const file = DriveApp.getFileById(fileId);
    const targetFolder = DriveApp.getFolderById(folderMap[row[headersObj[destCol]]]);

    // Copy to vendor folder and optionally remove from current folder
    file.moveTo(targetFolder);

    sheet.getRange(index + 1, headersObj["Processed"] + 1).setValue("Moved")
  } catch (err) {
    Logger.log(`Error on row ${index + 2}: ${err.message}`);
  }
}


function processVendorFile_(sheet, index, destCol, row, headersObj, folderMap, sheetMap) {

  try {
    const destSS = SpreadsheetApp.openById(sheetMap[row[headersObj[destCol]]])
    const destSheet = destSS.getSheetByName("Documents");
    let rowData = [row[headersObj["File Name"]], "", "", row[headersObj["File Url"]]]
    destSheet.getRange(destSheet.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData])

    moveNow_(sheet, index, destCol, row, headersObj, folderMap)
  } catch (err) { }
}



function processProjectsFile_(sheet, index, destCol, row, headersObj, folderMap, sheetMap) {

  try {
    const destSS = SpreadsheetApp.openById(sheetMap[row[headersObj[destCol]]])
    const destSheet = destSS.getSheetByName("Documents");
    let rowData = [row[headersObj["File Name"]], "", "", row[headersObj["File Url"]]]
    destSheet.getRange(destSheet.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData])

    moveNow_(sheet, index, destCol, row, headersObj, folderMap)
  } catch (err) { }
}




function processEmployeeFile_(sheet, index, destCol, row, headersObj, folderMap, sheetMap) {

  try {
    const destSS = SpreadsheetApp.openById(sheetMap[row[headersObj[destCol]]])
    const destSheet = destSS.getSheetByName("Employee Documents");
    let rowData = [row[headersObj["File Name"]], "", row[headersObj["File Url"]]]
    destSheet.getRange(destSheet.getLastRow() + 1, 1, 1, rowData.length).setValues([rowData])

    moveNow_(sheet, index, destCol, row, headersObj, folderMap)
  } catch (err) { }
}











function mapFolderAndSheet_(data) {

  const folderMap = {};
  const sheetMap = {}

  data.forEach(([id, sheet, folder]) => {
    const folderURL = folder.getLinkUrl()
    if (folderURL != null) {
      const folderId = extractIdFromUrl(folderURL);
      if (sheet && folderId) {
        folderMap[sheet.getText()] = folderId;
      }
    }
    const sheetURL = sheet.getLinkUrl()
    if (sheetURL != null) {
      const sheetId = extractIdFromUrl(sheetURL);
      if (sheet && sheetId) {
        sheetMap[sheet.getText()] = sheetId;
      }
    }
  });


  return [folderMap, sheetMap]
}


function extractIdFromUrl(url) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}





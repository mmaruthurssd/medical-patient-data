
const ALL_FOLDERS_ID = "1V5_ikUIF9kRuQI5kr35727lxgAMAjGHI"
const SS_TEMPPLATE_ID = "1hFpcw1c2jheyxMzmLy8pPn7sq0DNdadTlM_NTy7AnLE"



function onFormSubmitInstall(e) {
  let ss = e.source;


  let destSheet = ss.getSheetByName(THIS_SHEET.MASTER_REF);
  let destHeadings = destSheet.getRange(2, 1, 1, destSheet.getLastColumn()).getDisplayValues()[0].map(r => r.toString().toLowerCase().trim());


  let namedValues = e.namedValues;
  namedValues["Date Referred"] = [new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())]


  let rowData = new Array(destHeadings.length).fill("")



  for (let key in namedValues) {
    let lowerKey = key.toString().toLowerCase().trim()
    let indexInDest = destHeadings.indexOf(lowerKey);
    if (indexInDest > -1) {
      rowData[indexInDest] = namedValues[key][0]
    }
  }

  rowData[destHeadings.indexOf("refer to practice (from google form)")] = namedValues["Preferred Practice to Refer to - Optional"][0]
  rowData[destHeadings.indexOf("refer to provider (from google form)")] = namedValues["Preferred Physician to Refer to - Optional"][0]

  rowData[destHeadings.indexOf("practice referring to (normalized)")] = ""
  rowData[destHeadings.indexOf("physician referring To (normalized)")] = ""

  rowData[destHeadings.indexOf("date referred")] = namedValues["Timestamp"][0].split(" ")[0]
  rowData[destHeadings.indexOf("phase")] = "Unsent"



  destSheet.insertRows(4);
  destSheet.getRange(4, 1, 1, rowData.length).setValues([rowData])



  const outputFolder = DriveApp.getFolderById(ALL_FOLDERS_ID)
  const folderName = rowData[destHeadings.indexOf("patient name")] + " - Folder - OUT-" + rowData[destHeadings.indexOf("patient mrn")]
  let newFolder = outputFolder.createFolder(folderName)
  let folderRichText = SpreadsheetApp.newRichTextValue().setText(folderName).setLinkUrl(newFolder.getUrl()).build()



  const fileName = rowData[destHeadings.indexOf("patient name")] + " - Sheet - OUT-" + rowData[destHeadings.indexOf("patient mrn")]
  let fileOutputFolder = DriveApp.getFolderById(newFolder.getId())
  let newFile = DriveApp.getFileById(SS_TEMPPLATE_ID).makeCopy(fileName, fileOutputFolder)
  let fileRichText = SpreadsheetApp.newRichTextValue().setText(fileName).setLinkUrl(newFile.getUrl()).build()
  const folderSheet = ss.getSheetByName("Patient Sheets")
  let lastRow = folderSheet.getLastRow() + 1
  folderSheet.getRange(lastRow, 4, 1, 2).setRichTextValues([[fileRichText, folderRichText]])
  folderSheet.getRange(lastRow, 1, 1, 3).setValues([[rowData[destHeadings.indexOf("patient mrn")], rowData[destHeadings.indexOf("patient name")], "OUT-" + rowData[destHeadings.indexOf("patient mrn")]]])



  sendEmailNow_(namedValues)

  //processPhasesMain()
}









function sendEmailNow_(namedValues) {

  try {
    let subject = "New Outgoing Referral Request"
    let htmlBody = '<p>New outgoing referral has been requested:</p><h4 style="color:#3c78d8"><u> <a href="https://docs.google.com/spreadsheets/d/16-zEykLs7zrp0ZEL7IVb9Rg9w5z-7DNppUjpkVoHUWs/edit?gid=1163243739#gid=1163243739">SSD Outgoing Referrals Dashboard</a></u></h4><p>'



    htmlBody += "<b>Patient Name:</b> " + namedValues['Patient Name'][0]
    htmlBody += "<br><b>Patient ID:</b> " + namedValues['Patient MRN'][0]
    htmlBody += "<br><b>Provider Referring:</b> " + namedValues['Referred by (SSD Provider)'][0]
    htmlBody += "<br><b>Referral Specialty:</b> " + namedValues['Referral Specialty'][0]


    htmlBody += "</p>"

    GmailApp.sendEmail("kmatthews@ssdspc.com,bherrington@ssdspc.com,tplatts@ssdspc.com,imoore@ssdspc.com,agonzalez@ssdspc.com,mm@ssdspc.com", subject, "", {
      htmlBody: htmlBody
    })
  } catch (err) { }
}









function testFormSubmit() {
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName("Form Responses 1");

  if (sheet.getSheetName() != "Form Responses 1") return

  let range = sheet.getRange(61, 1, 1, sheet.getLastColumn())

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

  let values = range.getDisplayValues()[0];


  let namedValues = {};
  for (var i = 0; i < headers.length; i++) {
    namedValues[headers[i]] = [values[i]]
  }


  //Logger.log(namedValues)


  let e = {
    source: ss,
    range: range,
    values: values,
    namedValues: namedValues,
  }


  onFormSubmitInstall(e);

}
































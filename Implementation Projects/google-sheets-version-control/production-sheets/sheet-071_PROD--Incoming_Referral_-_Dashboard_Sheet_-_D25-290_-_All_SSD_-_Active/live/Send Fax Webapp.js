

const COVERPAGE_ID = "1vrHjzG-YRom2ZBHGrZbs0diRwKI9LEYKwb4hhuNSbIk"
const COVERPAGE_FOLDER_ID = "14xtydcXxK70ELnOWQiHxeD-5Yk42meWH"

const UNIQUE_PRACTICE_SHEET = "Unique Practices";

//o 19209991234@9207771234.sendfax.to

let TO_DOMAIN = "@2058384525.sendfax.to"


//this is deployed from fax@ssdspc.com gmail
const WEBAPP_URL = "https://script.google.com/a/macros/ssdspc.com/s/AKfycbyYagqIOacSgdm888okJZ_gSZ2mYJLSCXVZ0afuv7YrpKr31qxgBoRdMv6aziFrCS0bGA/exec"







/**
 * this is the main function of sending letter Fax
 */
function sendFaxLetterApiCall() {




  let data = {
    "process": "sendFaxMain",
  };
  // Web app url to process and send fax email
  let request = {
    "method": "post",
    "muteHttpExceptions": true,
    "headers": {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken()
    },
    "payload": data
  };


  let response = UrlFetchApp.fetch(WEBAPP_URL, request);


}





/**
 * Web App to send letter fax
 */
function doPost(e) {
  var result = "Success";
  try {
    let parameters = e.parameter
    if (parameters.process == "sendFaxMain") {
      sendFaxMain();

    }
  }
  catch (err) {
    result = err.message;
    Logger.log("FAILED: " + result);
  }
  return ContentService.createTextOutput(result);
}








function sendFaxMain() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(LETTER_PENDING_SHEET)

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues()


  let headings = allData.splice(0, 1)[0];

  let sendFaxIndex = headings.indexOf("Send Fax");

  let referringPracticeIndex = headings.indexOf("Referring Practice")

  let letterUrlIndex = headings.indexOf("Scheduling Letter to Referring Provider (Google Doc Link)")
  let coverUrlIndex = headings.indexOf("Cover Page")
  let faxNumIndex = headings.indexOf("Fax Number")


  let letterSentCol = sheet.getRange("LETTER_PENDING_SENT").getColumn()


  let uniquePracticeSheet = ss.getSheetByName(UNIQUE_PRACTICE_SHEET);
  let allPracticesData = uniquePracticeSheet.getRange(2, 1, uniquePracticeSheet.getLastRow() - 1, uniquePracticeSheet.getLastColumn()).getDisplayValues()

  let allPractices = allPracticesData.map(r => r[0].toString().trim())


  let regex = /\d+/g;
  //var numbers = inputString.match(regex);

  for (var i = 0; i < allData.length; i++) {

    if (allData[i][sendFaxIndex] == true || allData[i][sendFaxIndex] == "TRUE") {
      //Logger.log(allData[i])

      let practiceIndex = allPractices.indexOf(allData[i][referringPracticeIndex].toString().trim());

      if (practiceIndex > -1) {

        //Logger.log(allData[i][referringPracticeIndex])
        let faxNumber = allPracticesData[practiceIndex][4];
        //Logger.log(faxNumber)
        if (faxNumber != "" && faxNumber.toString().length > 9) {
          faxNumber = faxNumber.match(regex).join("");
          if (faxNumber.toString().length == 10) {
            faxNumber = "1" + faxNumber
          }

          //Logger.log(faxNumber)

          try {

            let existingDocId = extractIdFromUrl(allData[i][letterUrlIndex])
            let faxDoc = DriveApp.getFileById(existingDocId).getAs("application/pdf")

            let existingCoverDocId = extractIdFromUrl(allData[i][coverUrlIndex])

            let coverDoc = ""

            if (existingCoverDocId != "" && existingCoverDocId != null) {
              coverDoc = DriveApp.getFileById(existingCoverDocId)
            } else {
              coverDoc = createCoverDoc_(allPracticesData[practiceIndex], existingDocId)

              sheet.getRange(i + 2, coverUrlIndex + 1).setValue(coverDoc.getUrl());
            }
            //Logger.log(faxNumber + TO_DOMAIN)

            let attachments = [coverDoc.getAs("application/pdf"), faxDoc]
            GmailApp.sendEmail(faxNumber + TO_DOMAIN, "SSD Fax", "SSD Fax", {
              attachments: attachments
            })

            // GmailApp.sendEmail("rkhan@ssdspc.com", "Fax Test", "", {
            //   attachments: attachments
            // })

            sheet.getRange(i + 2, sendFaxIndex + 1).setValue(false);
            sheet.getRange(i + 2, letterSentCol).setValue("Yes");
            sheet.getRange(i + 2, faxNumIndex).setValue(allPracticesData[practiceIndex][4]);


          } catch (err) {
            Logger.log(err)
            sheet.getRange(i + 2, sendFaxIndex + 1).setValue(false);
          }

        }

        sheet.getRange(i + 2, sendFaxIndex + 1).setValue(false);
      }

    }
  }

}








function testByRashid() {

  GmailApp.sendEmail("rashid_khan143@yahoo.com", "This is a test email", "", {
    //attachments: attachments
  })

}








function createCoverDoc_(allPracticeRow, existingDocId) {

  let pages = DriveApp.getFileById(existingDocId)
    .getBlob()
    .getDataAsString()
    .split("/Contents").length;


  if (allPracticeRow == null || allPracticeRow.length == 0 || allPracticeRow == "") {
    allPracticeRow = new Array(6).fill("")
  }


  let coverpageFolder = DriveApp.getFolderById(COVERPAGE_FOLDER_ID)
  let newCoverDocId = DriveApp.getFileById(COVERPAGE_ID).makeCopy("coverpage", coverpageFolder).getId();
  let newCoverDoc = DocumentApp.openById(newCoverDocId);
  let body = newCoverDoc.getBody();

  body.replaceText("{{TO}}", allPracticeRow[0])
  body.replaceText("{{Fax}}", allPracticeRow[4])
  body.replaceText("{{Pages}}", pages)
  body.replaceText("{{Phone}}", allPracticeRow[3])
  body.replaceText("{{Date}}", Utilities.formatDate(new Date(), "GMT-6", "M/dd/YYYY"))

  newCoverDoc.saveAndClose()


  return newCoverDoc


}








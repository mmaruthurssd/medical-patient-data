
var COL_Supplier = {
  SUPP: 1,
  PAYEE_ID: 2,
  EMAIL: 3,
  SUBJ: 4,
  NO_EMAILS: 5,
  NO_ORDERS: 6
}

var COL_EmailLogs = {
  MessageID: 1,
  EDATE: 2,
  SUPP: 3,
  PAYEE_ID: 4,
  EMAIL: 5,
  SUBJ: 6,
  HAS_PDF: 7,
  DOWNLOAD_PDF: 8,
  DOWNLOADED_File: 9
}

function download_or_createPDFs() {
  var folder = DriveApp.getFolderById('18FfPityOck-Dq05Yl4gGLwqI-K-tiQBW');

  var sheetEmailLogs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Email Logs");
  var allDataEmailLogs = sheetEmailLogs.getDataRange().getValues();

  allDataEmailLogs.shift();

  allDataEmailLogs.forEach((r, x) => {
    var vRow = x + 2;
    var messageID = r[COL_EmailLogs.MessageID - 1];
    var hasPDF = r[COL_EmailLogs.HAS_PDF - 1];
    var downloadPDF = r[COL_EmailLogs.DOWNLOAD_PDF - 1];
    var downloadedFile = r[COL_EmailLogs.DOWNLOADED_File - 1];

    if (downloadPDF) {
      if (!downloadedFile) {
        var message = GmailApp.getMessageById(messageID);
        if (hasPDF) {
          // console.log({ messageID, vRow });
          //>>
          var attachments = message.getAttachments();
          attachments.forEach(atch => {

            if (atch.getContentType() == 'application/pdf' || atch.getName().toLowerCase().endsWith(".pdf")) {
              var blob = atch.copyBlob();

              if (atch.getContentType() != 'application/pdf' && atch.getName().toLowerCase().endsWith(".pdf")) {
                blob.setContentTypeFromExtension();
              }

              var file = folder.createFile(blob);
              Utilities.sleep(100);

              let fileRichText = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
              sheetEmailLogs.getRange(vRow, COL_EmailLogs.DOWNLOADED_File).setRichTextValue(fileRichText);
            }
          })
          //<<

        } else {

          //>>
          // Create a PDF blob
          var htmlBody = message.getBody();
          var subject = message.getSubject().replace(/[^\w\s]/gi, ""); // clean subject for filename
          var blob = Utilities.newBlob(htmlBody, "text/html", subject + ".html");
          var pdf = blob.getAs("application/pdf");

          // Save to Drive
          var file = folder.createFile(pdf);
          Utilities.sleep(100);

          let fileRichText = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
          sheetEmailLogs.getRange(vRow, COL_EmailLogs.DOWNLOADED_File).setRichTextValue(fileRichText);
          //<<

        }
      }

      downloadPDF = false;
      sheetEmailLogs.getRange(vRow, COL_EmailLogs.DOWNLOAD_PDF).setValue(downloadPDF);
    }

  });

}

function extractEmails() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (activeSheet.getName() != "Unique Supplier List") return;
  if (activeSheet.getActiveRange().getRow() < 2) return;

  var sheetEmailLogs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Email Logs");
  var allDataEmailLogs = sheetEmailLogs.getDataRange().getValues();
  var logMap = allDataEmailLogs.map(r => r[0].toString());

  var sheetSuppliers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unique Supplier List");
  var supplierInfo = sheetSuppliers.getDataRange().getValues();

  //>>

  var vRow = activeSheet.getActiveRange().getRow();
  var rowData = supplierInfo[vRow - 1];
  var sSupplier = rowData[COL_Supplier.SUPP - 1];
  var sPayeeID = rowData[COL_Supplier.PAYEE_ID - 1];
  var fromEmail = replaceWords_(rowData[COL_Supplier.EMAIL - 1], [["; ", ";"], ["; ", ";"]]);
  var sSub = replaceWords_(rowData[COL_Supplier.SUBJ - 1], [["; ", ";"], ["; ", ";"]]);

  var allDataOutput = [];
  fromEmail.toString().split(";").forEach(sFrom => {
    sSub.toString().split(";").forEach(sub => {
      var messages = extractMessagesFromEmails_({ sFrom, sub });
      messages.forEach(mm => {
        var messageID = mm.getId().toString();

        if (logMap.includes(messageID)) return;

        var messageFrom = mm.getFrom();
        var messageSub = mm.getSubject();
        var messageDate = mm.getDate();
        var messageSub = mm.getSubject();
        var attachments = mm.getAttachments();

        var bPDF = attachments.map(atch => atch.getContentType()).includes('application/pdf');

        if (!bPDF) {
          attachments.forEach(atch => {
            if (atch.getName().toLowerCase().endsWith(".pdf")) {
              bPDF = true;
            }
          });
        }

        var allDataTemp = new Array(allDataEmailLogs[0].length).fill("");
        allDataTemp[COL_EmailLogs.MessageID - 1] = messageID;
        allDataTemp[COL_EmailLogs.EDATE - 1] = messageDate;
        allDataTemp[COL_EmailLogs.SUPP - 1] = sSupplier;
        allDataTemp[COL_EmailLogs.PAYEE_ID - 1] = sPayeeID;
        allDataTemp[COL_EmailLogs.EMAIL - 1] = messageFrom;
        allDataTemp[COL_EmailLogs.SUBJ - 1] = messageSub;
        allDataTemp[COL_EmailLogs.HAS_PDF - 1] = bPDF;


        allDataOutput.push(allDataTemp);
      });
    });
  });

  if (allDataOutput.length > 0) {
    var oRow = sheetEmailLogs.getLastRow() + 1;
    sheetEmailLogs.insertRowsAfter(oRow, allDataOutput.length);
    sheetEmailLogs.getRange(oRow, 1, allDataOutput.length, allDataOutput[0].length).setValues(allDataOutput);
    sheetEmailLogs.getRange(oRow, COL_EmailLogs.DOWNLOAD_PDF, allDataOutput.length, 1).insertCheckboxes();
  }
  //<<

}

function extractMessagesFromEmails_({ sFrom, sub }) {
  var maxThreads = 100;

  var messages = [];
  var vStartIndex = 0;

  while (true) {
    var threads = GmailApp.search(`from:${sFrom} subject:"${sub}"`, vStartIndex, maxThreads);
    if (threads.length == 0) break;
    threads.forEach(th => {
      th.getMessages().forEach(mm => {
        if (!mm.getFrom().toString().includes(sFrom)) return;
        messages.push(mm);
      });
    });
    vStartIndex += threads.length;
  }

  return messages;
}

function replaceWords_(sString, words) {
  var new_sString = sString.toString();

  for (var rr = 0; rr < words.length; rr++) {
    while (new_sString.indexOf(words[rr][0]) > -1) {
      new_sString = new_sString.replace(words[rr][0], words[rr][1]);
    }
  }

  return new_sString;
}

function right_(sData, vLen) {
  return sData.substring(sData.length - vLen, sData.length);
}

function left_(sData, vLen) {
  return sData.toString().substring(0, vLen);
}
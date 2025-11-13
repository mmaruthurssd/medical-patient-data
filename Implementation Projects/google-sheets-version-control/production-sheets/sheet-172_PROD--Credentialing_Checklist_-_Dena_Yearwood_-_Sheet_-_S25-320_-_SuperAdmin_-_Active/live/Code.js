


function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF Processing')
    .addItem('Run OCR & Extract Data', 'processOCRwithAI')
    .addToUi();
}

function processOCRwithAI() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Documents");

  vertexAIconfigLib.processReadyPDFs({ sheet });
}

function getFilesFromFolder() {
  return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var destnSheet = ss.getSheetByName("Documents");

  var idMap = [];

  if (destnSheet.getLastRow() > 2) {
    let allExistingData = destnSheet.getDataRange().getRichTextValues();
    allExistingData.splice(0, 2);
    idMap = allExistingData.map(r => getGoogleDriveId_(r[0].getLinkUrl()));
  }

  var folder = DriveApp.getFolderById("1GkrWbLWYqQP6o_yZg2MHB2NdhB8EsS7m");

  var files = folder.getFiles();

  while (files.hasNext()) {
    var file = files.next();

    if (idMap.includes(file.getId())) continue;

    var vRow = destnSheet.getLastRow() + 1;
    let fileRichText = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
    destnSheet.getRange(vRow, 1).setRichTextValue(fileRichText);

    idMap.push(file.getId());
  }

  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    var files = subfolders.next().getFiles();

    while (files.hasNext()) {
      var file = files.next();

      if (idMap.includes(file.getId())) continue;

      var vRow = destnSheet.getLastRow() + 1;
      let fileRichText = SpreadsheetApp.newRichTextValue().setText(file.getName()).setLinkUrl(file.getUrl()).build();
      destnSheet.getRange(vRow, 1).setRichTextValue(fileRichText);

      idMap.push(file.getId());
    }
  }
}

function getGoogleDriveId_(url) {
  if (!url) { return null; }

  const regex = /[-\w]{25,}/;
  const match = url.match(regex);

  if (match && match[0]) {
    return match[0];
  } else {
    console.log("Could not extract a valid Google Drive ID from the URL.");
    return null;
    // throw new Error("Could not extract a valid Google Drive ID from the URL.");
  }
}




function searchFilesByMimeTypeInSharedDrive() {
  var folderId = '0ACR8UW0IUK3nUk9PVA'; // Replace with the ID of your shared drive folder
  var mimeType = 'application/vnd.google-apps.spreadsheet'; // Replace this with the desired MIME type

  var files = Drive.Files.list({
    //q: "'" + folderId + "' in parents and mimeType='" + mimeType + "'",
    q: "mimeType='" + mimeType + "'",
    corpora: 'drive',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    driveId: '0ACR8UW0IUK3nUk9PVA'
  });

  var items = files.items;
  Logger.log(items.length)
  for (var i = 0; i < items.length; i++) {
    var file = items[i];
    Logger.log(file)
    Logger.log('File Name: ' + file.title);
    Logger.log('File ID: ' + file.id);
    Logger.log('File URL: https://drive.google.com/open?id=' + file.id);
    Logger.log('File ID: ' + file.alternateLink);
    //Logger.log('File ID: ' + file.);
    break
  }
}


function testFunc() {
  //let rootFolder = DriveApp.getRootFolder().searchFiles;

  // let allFiles = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS)
  // Logger.log(allFiles.length)

  let mimeType = MimeType.GOOGLE_SHEETS

  let rootFiles = DriveApp.getFolderById("0ACR8UW0IUK3nUk9PVA").searchFiles('mimeType="' + mimeType + '"');

  // var query = "mimeType='" + mimeType + "' and '0ACR8UW0IUK3nUk9PVA' in parents";

  // //var query = "mimeType='" + mimeType
  // var files = Drive.Files.list({
  //   includeItemsFromAllDrives: true,
  //   supportsAllDrives : true,
  //   q: query,
  //   corpora: 'drive',
  //   driveId: '0ACR8UW0IUK3nUk9PVA'
  // });

  Logger.log(rootFiles)
  Logger.log(rootFiles.length)

  while (rootFiles.hasNext()) {
    let tempFile = rootFiles.next();
    Logger.log(tempFile.getName())
  }
  // Logger.log(rootFolder.getName())

  // let allDrives = Drive.Drives.list({ maxResults: 50 })
  // Logger.log(allDrives)
  // Logger.log(allDrives.items.length)
  // Logger.log(allDrives.items)

  // allDrives.items.forEach(item => {
  //   Logger.log(item.name)
  // })
}





//



function getAllSpreadsheetMain() {
  let mimeType = 'application/vnd.google-apps.spreadsheet';
  let allDrives = Drive.Drives.list({ maxResults: 50 })

  let driveSpreadsheets = [];
  let spreadsheetUrlsHyperlink=[]
  allDrives.items.forEach(item => {

    let rootFolderName = item.name;

    let files = Drive.Files.list({
      //q: "'" + folderId + "' in parents and mimeType='" + mimeType + "'",
      q: "mimeType='" + mimeType + "'",
      corpora: 'drive',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      driveId: item.id,
      maxResults: 500
    });


    let items = files.items;

    for (var i = 0; i < items.length; i++) {
      let file = items[i];
      
      let richText=SpreadsheetApp.newRichTextValue().setText(file.title).setLinkUrl(file.alternateLink).build()
      spreadsheetUrlsHyperlink.push([richText])
      //let ssLastModifiedBy = fileObj.lastModifyingUserName
      driveSpreadsheets.push([file.title, rootFolderName, file.alternateLink, file.lastModifyingUserName, new Date(file.modifiedDate)])
    }

  })


  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName("Test Sheets Recent Activity");

  sheet.getRange(2, 1, driveSpreadsheets.length, driveSpreadsheets[0].length).setValues(driveSpreadsheets)
  sheet.getRange(2, 3, spreadsheetUrlsHyperlink.length, 1).setRichTextValues(spreadsheetUrlsHyperlink)
}

























function fetchFolderSpreadsheets(folder, rootFolderName, path, driveSpreadsheets) {
  let subFolders = folder.getFolders();


  // Process sub-folders
  while (subFolders.hasNext()) {
    let subFolder = subFolders.next();
    path = path + "/" + subFolder.getName()

    //let files = subFolder.getFiles();
    let files = subFolder.getFilesByType(MimeType.GOOGLE_SHEETS)
    // Process files
    while (files.hasNext()) {
      let tempFile = files.next()
      let mimType = tempFile.getMimeType();

      if (mimType.toString() == "application/vnd.google-apps.spreadsheet") {
        let ssName = tempFile.getName();
        let ssUrl = tempFile.getUrl();
        let ssLastModified = tempFile.getLastUpdated()
        let fileObj = Drive.Files.get(tempFile.getId(), { supportsTeamDrives: true })
        let ssLastModifiedBy = fileObj.lastModifyingUserName
        driveSpreadsheets.push([ssName, rootFolderName, path, ssUrl, ssLastModifiedBy, ssLastModified])
      }
    }


    fetchFolderSpreadsheets(subFolder, rootFolderName, path, driveSpreadsheets);
  }


  return driveSpreadsheets
}










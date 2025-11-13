

const LISTING_RAW_SHEET = "Paste BCBS Health and Dental here";

const NAMES_SHEET = "Paycor_Names";

const ENROLLMENT_SHEET = "Enrollment Listing";



function onOpen() {
  let ui = SpreadsheetApp.getUi();
  let menu = ui.createMenu("Custom");

  menu.addItem("Process Raw", "processRawListingDataData")
}


function processRawListingDataData() {


  let ui = SpreadsheetApp.getUi();

  let ss = SpreadsheetApp.getActiveSpreadsheet();


  //try {
  let rawSheet = ss.getSheetByName(LISTING_RAW_SHEET);

  let allData = rawSheet.getRange(1, 1, rawSheet.getLastRow(), rawSheet.getLastColumn()).getValues();

  let rawHeadings = allData.splice(0, 1)[0];
  // Logger.log(rawHeadings)
  // Logger.log(allData[0])

  let namesSheet = ss.getSheetByName(NAMES_SHEET);
  let names = namesSheet.getRange("D2:D").getValues().filter(r => r[0] != "" && r[0] != null).map(n => n[0].toString().toUpperCase());
  let formattedNames = namesSheet.getRange("E2:E").getValues().filter(r => r[0] != "" && r[0] != null).map(n => n[0]);

  //let upperCaseNames = .map(n => n[0]);

  //Logger.log(names)

  let COL = {
    div: rawHeadings.indexOf("DIV"),
    name: rawHeadings.indexOf("NAME"),
    total: rawHeadings.indexOf("TOTAL"),
    dueDate: rawHeadings.indexOf("PAYMENT DUE DATE"),
  }

  //Logger.log(COL)


  let processedData = []

  allData.forEach(row => {
    try {
      let newName = row[COL.name];
      for (var i = 0; i < names.length; i++) {
        if (newName.toString().includes(names[i])) {
          newName = formattedNames[i]
          break
        }
      }

      let newRow = [row[COL.div], newName, row[COL.total], row[COL.dueDate]]
      processedData.push(newRow)
    } catch (err) { Logger.log(err) }
  })


  if (processedData.length > 0) {
    let enrollmentSheet = ss.getSheetByName(ENROLLMENT_SHEET);
    enrollmentSheet.getRange(enrollmentSheet.getLastRow() + 1, 1, processedData.length, processedData[0].length).setValues(processedData)
    rawSheet.getRange(1, 1, rawSheet.getLastRow(), rawSheet.getLastColumn()).clearContent()
    ui.alert("Successful!\nData Processed")

  } else {
    ui.alert("Invalid\nNo Data is Processed")
  }




}




function processRawListingDataALLFiles() {

  let processedData = []
  let ui = SpreadsheetApp.getUi();

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let namesSheet = ss.getSheetByName(NAMES_SHEET);
  let names = namesSheet.getRange("D2:D").getValues().filter(r => r[0] != "" && r[0] != null).map(n => n[0].toString().toUpperCase());
  let formattedNames = namesSheet.getRange("E2:E").getValues().filter(r => r[0] != "" && r[0] != null).map(n => n[0]);


  let folder = DriveApp.getFolderById("1PCav3LKFidMHj9Rf16pPksgiHbkAtGyL");
  let allFiles = folder.getFiles();

  while (allFiles.hasNext()) {

    try {

      let file = allFiles.next();
      let rawSS = SpreadsheetApp.openById(file.getId())
      let rawSheet = rawSS.getSheetByName("Enrollment Listing - Sheet 1");
      let allData = rawSheet.getRange(2, 1, rawSheet.getLastRow() - 1, rawSheet.getLastColumn()).getValues();
      let rawHeadings = allData.splice(0, 1)[0];


      let COL = {
        div: rawHeadings.indexOf("DIV"),
        name: rawHeadings.indexOf("NAME"),
        total: rawHeadings.indexOf("TOTAL"),
        dueDate: rawHeadings.indexOf("PAYMENT DUE DATE"),
      }



      allData.forEach(row => {
        try {
          let newName = row[COL.name];
          for (var i = 0; i < names.length; i++) {
            if (newName.toString().includes(names[i])) {
              newName = formattedNames[i]
              break
            }
          }

          let newRow = [row[COL.div], newName, row[COL.total], row[COL.dueDate]]
          processedData.push(newRow)
        } catch (err) { }
      })

    } catch (error) { Logger.log(error) }

  }




  if (processedData.length > 0) {
    let enrollmentSheet = ss.getSheetByName(ENROLLMENT_SHEET);
    enrollmentSheet.getRange(enrollmentSheet.getLastRow() + 1, 1, processedData.length, processedData[0].length).setValues(processedData)
    ui.alert("Successful!\nData Processed")
    //rawSheet.getRange(1, 1, rawSheet.getLastRow(), rawSheet.getLastColumn()).clearContent()
  } else {
    ui.alert("Invalid\nNo Data is Processed")
  }



}
























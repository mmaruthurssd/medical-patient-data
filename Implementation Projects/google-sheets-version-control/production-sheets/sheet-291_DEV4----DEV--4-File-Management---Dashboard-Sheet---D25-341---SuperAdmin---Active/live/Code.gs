


const SUPER_ADMIN_TASK_SS_ID = "1EjDO-PhQm8E7L_kp2j0h6Gjbc3xGzaWE0azrwk2VDa4";

const ADMIN_TASK_SS_ID = "1eT5mTukRrVHqR0zmYlfvL4HAIN6ww1YJTqDBpualOsw";


const REMOTE_TASKS_SS_ID = "1OUFeI_5LeYTrQLudgrVl3QRmOS2OYeHzKegpwvOzIWs"


function getLinksOftheProjects() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName("SSD Projects");

  let values = sheet.getRange(1, 7, sheet.getLastRow(), 1).getValues()

  let linkValues = sheet.getRange(1, 12, sheet.getLastRow(), 1).getValues()

  let richTextValues = sheet.getRange(1, 7, sheet.getLastRow(), 1).getRichTextValues()


  for (var i = 2; i < linkValues.length; i++) {

    if (linkValues[i][0] == "" && values != "") {
      try {
        let url = richTextValues[i][0].getLinkUrl()
        linkValues[i][0] = url
      } catch (err) { }
    }

  }

  sheet.getRange(1, 12, sheet.getLastRow(), 1).setValues(linkValues)


}









function fetchAllProjects() {

  return
  try {
    fetchSuperAdminProjectTask()
  } catch (err) {
    Logger.log(err)
  }

  try {
    fetchAdminProjectTask()
  } catch (err) {
    Logger.log(err)
  }

  try {
    fetchRemoteProjectTask()
  } catch (err) {
    Logger.log(err)
  }
}



//SUPER_ADMIN
function fetchSuperAdminProjectTask() {
  let taskSS = SpreadsheetApp.openById(SUPER_ADMIN_TASK_SS_ID);
  let taskSheet = taskSS.getSheetByName("Project Tasks");


  //return

  let allData = taskSheet.getRange(2, 1, taskSheet.getLastRow() - 1, taskSheet.getLastColumn()).getValues().filter(row => row[0] != "" && row[0] != null && row[2] != "Complete" && row[2] != "Cancelled" && row[3] != "" && row[3] != null);


  let richTextValues = [];
  allData.forEach(row => {

    let richTextValue = SpreadsheetApp.newRichTextValue()
      .setText(row[4])
      .setLinkUrl(row[9])
      .build();

    richTextValues.push([richTextValue])

    row.pop()
  })



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SSD Projects");

  let existingRange = sheet.getRange("SUPER_ADMIN");
  let startRow = existingRange.getRow()

  existingRange.clearContent()

  if (existingRange.getValues().length - 1 < allData.length) {
    sheet.insertRows(startRow, allData.length - (existingRange.getValues().length - 1))
  }



  sheet.getRange(startRow, 1, allData.length, allData[0].length).setValues(allData)
  sheet.getRange(startRow, 5, richTextValues.length, 1).setRichTextValues(richTextValues)


}



//ADMIN_PROJECTS
function fetchAdminProjectTask() {
  let taskSS = SpreadsheetApp.openById(ADMIN_TASK_SS_ID);
  let taskSheet = taskSS.getSheetByName("Project Tasks");


  //return

  let allData = taskSheet.getRange(2, 1, taskSheet.getLastRow() - 1, taskSheet.getLastColumn()).getValues().filter(row => row[0] != "" && row[0] != null && row[2] != "Complete" && row[2] != "Cancelled" && row[3] != "" && row[3] != null);


  let richTextValues = [];
  allData.forEach(row => {

    let richTextValue = SpreadsheetApp.newRichTextValue()
      .setText(row[4])
      .setLinkUrl(row[9])
      .build();

    richTextValues.push([richTextValue])

    row.pop()
  })



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SSD Projects");

  let existingRange = sheet.getRange("ADMIN_PROJECTS");
  let startRow = existingRange.getRow()

  existingRange.clearContent()

  if (existingRange.getValues().length - 1 < allData.length) {
    sheet.insertRows(startRow, allData.length - (existingRange.getValues().length - 1))
  }



  sheet.getRange(startRow, 1, allData.length, allData[0].length).setValues(allData)
  sheet.getRange(startRow, 5, richTextValues.length, 1).setRichTextValues(richTextValues)


}







//REMOTE_PROJECTS
function fetchRemoteProjectTask() {
  let taskSS = SpreadsheetApp.openById(REMOTE_TASKS_SS_ID);
  let taskSheet = taskSS.getSheetByName("Project_Tasks");


  //return

  let allData = taskSheet.getRange(2, 1, taskSheet.getLastRow() - 1, taskSheet.getLastColumn()).getValues().filter(row => row[0] != "" && row[0] != null && row[2] != "Complete" && row[2] != "Cancelled" && row[3] != "" && row[3] != null);


  let richTextValuesOne = [];
  let richTextValuesTwo = [];
  allData.forEach(row => {

    let richTextValue1 = SpreadsheetApp.newRichTextValue()
      .setText(row[4])
      .setLinkUrl(row[12])
      .build();

    richTextValuesOne.push([richTextValue1])


    let richTextValue2 = SpreadsheetApp.newRichTextValue()
      .setText(row[6])
      .setLinkUrl(row[13])
      .build();

    richTextValuesTwo.push([richTextValue2])

    row.pop()
    row.pop()
  })

  //Logger.log(richTextValues)



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SSD Projects");


  let existingRange = sheet.getRange("REMOTE_PROJECTS");
  let startRow = existingRange.getRow()

  existingRange.clearContent()

  if (existingRange.getValues().length - 1 < allData.length) {
    sheet.insertRows(startRow, allData.length - (existingRange.getValues().length - 1))
  }



  sheet.getRange(startRow, 1, allData.length, allData[0].length).setValues(allData)
  sheet.getRange(startRow, 5, richTextValuesOne.length, 1).setRichTextValues(richTextValuesOne)
  sheet.getRange(startRow, 7, richTextValuesTwo.length, 1).setRichTextValues(richTextValuesTwo)


}



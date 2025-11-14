
function onEdit1(e) {



  const SheetsList = ['Microtasks List', 'Master Microtasks', 'Dr. M Microtasks']

  const ActiveSheet = e.source.getActiveSheet();

  if (!SheetsList.includes(ActiveSheet.getName()))
    return;


  const HeaderRow = ActiveSheet.getRange(1, 1, 1, ActiveSheet.getLastColumn()).getValues()[0];
  const StatusColIndex = HeaderRow.indexOf('Status');

  if (e.range.getColumn() === StatusColIndex + 1)
    sortMicrotasksList_(ActiveSheet);



}



//PROJECT_TASKS_PROJECT_COL
//PROJECT_TASKS_STATUS
//MANAGEMENT_GOOGLE_SHEET_LINK

//PROJECT_TASKS_STAGE




//DASHBOARD_PROJECT


const THIS_SS_ID = "1KMsidrbBLL_cc1vmiSozSopW4AMIGTDHMgSNDs0kGYw"


//super admin ids
const SUPER_TASK_MANAGEMENT_OUTPUT_FOLDER = "13AmFrbuHk2MKxWi-Y98Ne5zeq52AAm8W"
const SUPER_TASK_MANAGEMENT_TEMP_SS_ID = "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI"
const SUPER_TASK_MANAGEMENT_DASBOARD_TEMP_SS_ID = "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"


//Admin Ids
const ADMIN_TASK_MANAGEMENT_OUTPUT_FOLDER = "1C3WsrjQVjncTE49Q8WjwiwWpUfUmcppH"
const ADMIN_TASK_MANAGEMENT_TEMP_SS_ID = "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI"
const ADMIN_TASK_MANAGEMENT_DASHBOARD_TEMP_SS_ID = "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"



//remote ids
const REMOTE_TASK_MANAGEMENT_OUTPUT_FOLDER = "1IKmzQ8-m73GmTn9i8x7D5dtK1Zn9_H0j"
const REMOTE_TASK_MANAGEMENT_TEMP_SS_ID = "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI"
const REMOTE_TASK_MANAGEMENT_DASHBOARD_TEMP_SS_ID = "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"



//remote ids
const DR_MARIO_OUTPUT_FOLDER = "1ndaHxAcGhEICNulIbcSkG03ojT5orwfG"
const DR_MARIO_TEMP_SS_ID = "1Cs5iyGRJCPfI4tRpztimK8ktwhDvVFK8xSl0YTPjteI"
const DR_MARIO_DASHBOARD_TEMP_SS_ID = "1lQhHBun3EN3hXcd6DKgQYfUgZDt42Ws5ArGF4VmfLLc"




//MICROTASKS_STATUS_COL


//SUPER_MICRO
//ADMIN_MICRO
//REMOTE_MICRO



function onEditInstallOld(e) {

  return

  //return
  let ss = e.source;
  let sheet = ss.getActiveSheet();

  let range = e.range;
  let row = range.getRow();
  let col = range.getColumn();

  let value = e.value;





  if (sheet.getSheetId() == 843781121 && row > 2) {

    let status_col = sheet.getRange("MICROTASKS_STATUS_COL").getColumn();

    if (col == status_col && (value == "Complete" || value == "Cancelled")) {



      let completedStartRow = sheet.getRange("MICRO_COMPLETED").getRow()

      if (row < completedStartRow) {
        sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), completedStartRow + 1)
      }


      sheet.deleteRow(row)
    }



  } else if (sheet.getSheetId() == 0 && row > 2) {


    //PROJECT_TASKS_PROJECT_COL
    let project_col = sheet.getRange("PROJECT_TASKS_PROJECT_COL").getColumn();
    let stage_col = sheet.getRange("PROJECT_TASKS_STAGE").getColumn();
    let status_col = sheet.getRange("PROJECT_STATUS_COL").getColumn();

    let projectType_col = sheet.getRange("PROJECT_LIST_PROJECT_TYPE").getColumn()
    let projectMaster_col = sheet.getRange("PROJECT_LIST_MASTER_PROJECT").getColumn()

    if (col == status_col) {

      if (col == status_col && (value == "Complete" || value == "Archive")) {

        let superAdminRange = sheet.getRange("SUPER_ADMIN");
        let superStartRow = superAdminRange.getRow();

        let reopenRange = sheet.getRange("PROJECT_REOPEN")
        let reopenLastRow = reopenRange.getLastRow();

        if (row >= superStartRow && row <= reopenLastRow) {

          if (value == "Complete") {
            let completeRow = sheet.getRange("PROJECT_COMPLETE").getRow() + 1
            if (row < completeRow - 1) {
              sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), completeRow)
            }
          } else if (value == "Archive") {
            let archiveRow = sheet.getRange("PROJECT_ARCHIVE").getRow() + 1
            if (row < archiveRow - 1) {
              sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), archiveRow)
            }
          }

          sheet.deleteRow(row)
        }

      } else if (col == status_col && value == "Re-Opened") {

        let reopenRange = sheet.getRange("PROJECT_REOPEN")
        let reopenLastRow = reopenRange.getLastRow();

        if (row > reopenLastRow) {
          let reopenRow = sheet.getRange("PROJECT_REOPEN").getRow() + 1
          sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), reopenRow)

          sheet.deleteRow(row + 1)
        }
      }


      //reOrderSortProjects(sheet)



    } else if ((col == project_col || col == stage_col || col == projectType_col || col == projectMaster_col) && value != "" && value != null) {

      let taskID = sheet.getRange(row, 2).getValue();
      let idTrackerSheet = ss.getSheetByName("Task_ID_Tracker_");



      //MANAGEMENT_GOOGLE_SHEET_LINK
      let manag_sheet_col = sheet.getRange("MANAGEMENT_GOOGLE_SHEET_LINK").getColumn();

      let sheetUrl = sheet.getRange(row, manag_sheet_col).getValue()


      let stageValue = sheet.getRange(row, stage_col).getValue()
      let projectValue = sheet.getRange(row, project_col).getValue()


      let projectTypeValue = sheet.getRange(row, projectType_col).getValue()
      let masterProjectValue = sheet.getRange(row, projectMaster_col).getValue()

      if (projectTypeValue == "Sub Project" && (masterProjectValue == "" || masterProjectValue == null)) {
        return
      }

      if (stageValue != "" && stageValue != null && projectValue != "" && projectValue != null && projectTypeValue != "" && projectTypeValue != null && (sheetUrl == "" || sheetUrl == null)) {

        let superAdminRange = sheet.getRange("SUPER_ADMIN");
        let superStartRow = superAdminRange.getRow();
        let superLastRow = superAdminRange.getLastRow();

        let adminRange = sheet.getRange("ADMIN_PROJECTS");
        let adminStartRow = adminRange.getRow();
        let adminLastRow = adminRange.getLastRow();

        let remoteRange = sheet.getRange("REMOTE_PROJECTS");
        let remoteStartRow = remoteRange.getRow();
        let remoteLastRow = remoteRange.getLastRow();


        let marioRange = sheet.getRange("MARIO_PROJECTS");
        let marioStartRow = marioRange.getRow();
        let marioLastRow = marioRange.getLastRow();


        if (row >= superStartRow && row <= superLastRow) {

          createProjectSheet_(ss, taskID, "B1", "S", idTrackerSheet, sheet, stageValue, projectValue, SUPER_TASK_MANAGEMENT_OUTPUT_FOLDER, manag_sheet_col, row, projectTypeValue, masterProjectValue)

        } else if (row >= adminStartRow && row <= adminLastRow) {

          createProjectSheet_(ss, taskID, "B2", "A", idTrackerSheet, sheet, stageValue, projectValue, ADMIN_TASK_MANAGEMENT_OUTPUT_FOLDER, manag_sheet_col, row, projectTypeValue, masterProjectValue)

        } else if (row >= remoteStartRow && row <= remoteLastRow) {

          createProjectSheet_(ss, taskID, "B3", "R", idTrackerSheet, sheet, stageValue, projectValue, REMOTE_TASK_MANAGEMENT_OUTPUT_FOLDER, manag_sheet_col, row, projectTypeValue, masterProjectValue)


        } else if (row >= marioStartRow && row <= marioLastRow) {

          createProjectSheet_(ss, taskID, "B4", "M", idTrackerSheet, sheet, stageValue, projectValue, DR_MARIO_OUTPUT_FOLDER, manag_sheet_col, row, projectTypeValue, masterProjectValue)

        }

      }


      sheetUrl = sheet.getRange(row, manag_sheet_col).getValue()
      stageValue = sheet.getRange(row, stage_col).getValue()
      projectValue = sheet.getRange(row, project_col).getValue()

      if (projectValue != "" && projectValue != null && sheetUrl != "" && sheetUrl != null && stageValue == "Dashboard") {
        let dashboardRow = sheet.getRange("DASHBOARD_PROJECT").getRow() + 1
        if (row < dashboardRow - 1) {
          sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), dashboardRow)
        }
      }


      //reOrderSortProjects(sheet)

    }








  }


  const SheetsList = ['Microtasks List', 'Master Microtasks', 'Dr. M Microtasks']

  if (SheetsList.includes(sheet.getName())) {

    const HeaderRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const StatusColIndex = HeaderRow.indexOf('Status');

    if (e.range.getColumn() === StatusColIndex + 1)
      sortMicrotasksList_(sheet);

  }



}









function createProjectSheet_(ss, taskID, idRange, idLetter, idTrackerSheet, sheet, stageValue, projectValue, folderID, manag_sheet_col, row, projectTypeValue, masterProjectValue) {

  if (taskID == "" || taskID == null) {
    let idCount = idTrackerSheet.getRange(idRange).getValue() + 1;
    idTrackerSheet.getRange(idRange).setValue(idCount)
    let year = new Date().getFullYear() - 2000
    taskID = idLetter + year + "-" + idCount
    sheet.getRange(row, 2).setValue(taskID);
  }

  let outputFolder = DriveApp.getFolderById(folderID)
  if (projectTypeValue == "Sub Project") {
    try {
      outputFolder = outputFolder.getFoldersByName(masterProjectValue).next()
    } catch (err) {
      outputFolder = DriveApp.getFolderById(folderID).createFolder(masterProjectValue)
    }

  }
  let newFolder = outputFolder.createFolder(taskID + " " + projectValue)

  let newSS = null
  if (stageValue == "Dashboard") {
    newSS = DriveApp.getFileById(SUPER_TASK_MANAGEMENT_DASBOARD_TEMP_SS_ID).makeCopy(taskID + " " + projectValue + " - Task Management Sheet", newFolder)
  } else {
    newSS = DriveApp.getFileById(SUPER_TASK_MANAGEMENT_TEMP_SS_ID).makeCopy(taskID + " " + projectValue + " - Task Management Sheet", newFolder)
  }



  try {
    let docSheet = SpreadsheetApp.openById(newSS.getId()).getSheetByName("Documents")
    docSheet.getRange("A1").setValue(newFolder.getUrl())
  } catch (err1) { }


  let richTextValue = SpreadsheetApp.newRichTextValue()
    .setText(newSS.getName())
    .setLinkUrl(newSS.getUrl())
    .build();
  sheet.getRange(row, manag_sheet_col).setRichTextValue(richTextValue)
  sheet.getRange(row, 17).setValue(newSS.getUrl())

  let richTextFolder = SpreadsheetApp.newRichTextValue()
    .setText(newFolder.getName())
    .setLinkUrl(newFolder.getUrl())
    .build();

  let projectFold_Col = sheet.getRange("PROJECT_FOLDER_COL").getColumn()
  sheet.getRange(row, projectFold_Col).setRichTextValue(richTextFolder)



  if (stageValue == "Dashboard") {
    let dashboardRow = sheet.getRange("DASHBOARD_PROJECT").getRow() + 1
    sheet.moveRows(sheet.getRange(row, 1, 1, sheet.getLastColumn()), dashboardRow)
  }


  placeNewSSInMicroAux(ss, newSS)


}










function addImportrangePermission(fileId, donorId) {

  // fileId = "1KMsidrbBLL_cc1vmiSozSopW4AMIGTDHMgSNDs0kGYw"
  // donorId = "1rJwgdQUzv2uzObV7xP_XcGfqBwBFd38Br-ZWpzNp11w"

  // adding permission by fetching this url
  var url = 'https://docs.google.com/spreadsheets/d/' +
    fileId +
    '/externaldata/addimportrangepermissions?donorDocId=' +
    donorId;
  var token = ScriptApp.getOAuthToken();
  var params = {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    muteHttpExceptions: true
  };
  UrlFetchApp.fetch(url, params);
}



function placeNewSSInMicroAux(ss, newSS) {

  let microAux = ss.getSheetByName("Microtasks_Aux");
  microAux.getRange(microAux.getLastRow() + 1, 1, 1, 2).setValues([[newSS.getName(), newSS.getUrl()]])


}



function reOrderSortProjects(sheet) {


  sortNow_(sheet, "SUPER_ADMIN")

  sortNow_(sheet, "ADMIN_PROJECTS")

  sortNow_(sheet, "REMOTE_PROJECTS")

  sortNow_(sheet, "MARIO_PROJECTS")

}



function sortNow_(sheet, rangeName) {
  let range = sheet.getRange(rangeName)
  let startRow = range.getRow();
  let lastRow = range.getLastRow();
  sheet.getRange(startRow + 1, 1, lastRow - (startRow + 1), sheet.getLastColumn()).sort({ column: 1, ascending: true });
}






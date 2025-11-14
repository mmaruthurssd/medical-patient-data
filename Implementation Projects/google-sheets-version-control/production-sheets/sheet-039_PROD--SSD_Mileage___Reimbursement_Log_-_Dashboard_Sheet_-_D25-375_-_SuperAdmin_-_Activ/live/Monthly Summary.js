


const MONTHORDER = {
  "January": 1,
  "February": 2,
  "March": 3,
  "April": 4,
  "May": 5,
  "June": 6,
  "July": 7,
  "August": 8,
  "September": 9,
  "October": 10,
  "November": 11,
  "December": 12
};



// function onOpen1() {
//   let ui = SpreadsheetApp.getUi();
//   let menu = ui.createMenu("Custom");

//   menu.addItem("Process Monthly Summary", "monthlySummaryProcess").addToUi()
// }




function monthlySummaryProcess() {

  //return
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {
  let summTempSheet = ss.getSheetByName("Monthly_Summary_List_Temp_")

  let summTempData = summTempSheet.getRange(2, 1, summTempSheet.getLastRow() - 1, 6).getDisplayValues().filter(r => r[1] != "" && r[1] != null && r[3] != "" && r[3] != null)



  let summSheet = ss.getSheetByName("Monthly Summary List by Staff Member");
  let summData = summSheet.getRange(2, 1, summSheet.getLastRow() - 1, 11).getDisplayValues().filter(r => r[0] != "" && r[0] != null && r[2] != "" && r[2] != null)


  summTempData.forEach(row => {
    let foundFlage = false

    for (var i = 0; i < summData.length; i++) {
      if (summData[i][0] == row[1] && summData[i][1] == row[2] && summData[i][2] == row[3]) {
        summData[i][3] = row[4]
        summData[i][4] = row[5]
        foundFlage = true
        break;
      }
    }


    if (foundFlage == false) {
      summData.push([row[1], row[2], row[3], row[4], row[5], "", "", "", "", "", ""])
    }

  })

  summData.sort(function (row1, row2) {
    return MONTHORDER[row2[1]] - MONTHORDER[row1[1]];
  });


  summData.sort(function (row1, row2) {
    return row2[0] - row1[0];
  });




  summSheet.getRange(2, 1, summData.length, summData[0].length).setValues(summData);
  summSheet.getRange("F2:F").clearContent()

  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(ss, "SCR-010", statusRow, true)

  // } catch (err) {

  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(ss, "SCR-010", statusRow, false)
  // }


}











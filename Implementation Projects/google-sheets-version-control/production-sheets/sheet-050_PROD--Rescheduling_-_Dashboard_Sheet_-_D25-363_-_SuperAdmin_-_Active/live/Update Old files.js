function updateDropdownSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allUrls = sheet.getRange(1, 9, sheet.getLastRow(), 1).getValues();


  const tempSs = SpreadsheetApp.openById(SCH_SS_TEMP_ID);
  const dropSheet = tempSs.getSheetByName("Dropdowns");
  const allDropDowns = dropSheet.getRange(1, 1, dropSheet.getLastRow(), dropSheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "")

  // Logger.log(allDropDowns)
  // return



  for (var i = 2; i < allUrls.length; i++) {

    if (allUrls[i][0] != "") {
      let fileId = null
      let fileUrl = allUrls[i][0]
      if (fileUrl.includes("?id=")) {
        fileId = fileUrl.split("?id=")[1].split("/")[0]

      } else if (fileUrl.includes("/d/")) {
        fileId = fileUrl.split("/d/")[1].split("/")[0]
      }

      if (fileId != null) {
        const destSS = SpreadsheetApp.openById(fileId);
        const destSheet = destSS.getSheetByName("Dropdowns");
        destSheet.getRange(1, 1, allDropDowns.length, allDropDowns[0].length).setValues(allDropDowns)
        //break
      }

      Logger.log(i)
    }


  }

}



function updateOldSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  const allUrls = sheet.getRange(1, 9, sheet.getLastRow(), 1).getValues();

  let allValues = [["# of Appts in Spreadsheet Initially", "# of Appts Added to Spreadsheets", "Zero Attempt", "1st Attempt", "2nd Attempt", "3rd Attempt", "Email Sent", "# Rescheduled (complete)", "# Pt will call back to reschedule", "# Does not want to reschedule", "Appointment moved to another provider"], [`=COUNTIF('Rescheduling Tracker'!B:B,"S")`, `=COUNTIF('Rescheduling Tracker'!G:G,"<>")-1-B14`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!P:P,"",'Rescheduling Tracker'!Q:Q,"",'Rescheduling Tracker'!R:R,"",'Rescheduling Tracker'!S:S,"",'Rescheduling Tracker'!V:V,"",'Rescheduling Tracker'!W:W,"")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!P:P,"<>",'Rescheduling Tracker'!Q:Q,"",'Rescheduling Tracker'!R:R,"",'Rescheduling Tracker'!S:S,"",'Rescheduling Tracker'!V:V,"",'Rescheduling Tracker'!W:W,"")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!Q:Q,"<>",'Rescheduling Tracker'!R:R,"",'Rescheduling Tracker'!S:S,"",'Rescheduling Tracker'!V:V,"",'Rescheduling Tracker'!W:W,"")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!R:R,"<>",'Rescheduling Tracker'!S:S,"",'Rescheduling Tracker'!V:V,"",'Rescheduling Tracker'!W:W,"")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!S:S,"<>",'Rescheduling Tracker'!V:V,"",'Rescheduling Tracker'!W:W,"")`, `=ARRAYFORMULA(SUM((LEN('Rescheduling Tracker'!T:T) + LEN('Rescheduling Tracker'!U:U) + LEN('Rescheduling Tracker'!V:V) > 0)*1))-1`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!W:W,"Pt will call back to reschedule")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!W:W,"Does not want to reschedule")`, `=COUNTIFS('Rescheduling Tracker'!G:G,"<>",'Rescheduling Tracker'!W:W,"Appointment moved to another provider")`]]


  for (var i = 447; i < allUrls.length; i++) {

    if (allUrls[i][0] != "") {
      let fileId = null
      let fileUrl = allUrls[i][0]
      if (fileUrl.includes("?id=")) {
        fileId = fileUrl.split("?id=")[1].split("/")[0]

      } else if (fileUrl.includes("/d/")) {
        fileId = fileUrl.split("/d/")[1].split("/")[0]
      }

      if (fileId != null) {
        const destSS = SpreadsheetApp.openById(fileId);
        const destSheet = destSS.getSheetByName("Rescheduling Checklist & Metrics");
        destSheet.getRange(13, 2, 2, 11).setValues(allValues)
        //break
      }

      Logger.log(i)
    }


  }

}

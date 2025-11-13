


//CONSOLIDATED_CATEGORY

//SUPPLIES_STATUS

//Consolidated_Completed



//SUPPLIES_CLOSED_RANGE

//IT_CLOSED_RANGE



//SCHEDULE_RELATED_REQUEST_COMPLETE_RANGE



const SUPPLIES_SHEET_NAME = "Supplies/Maintainance/Equipments"

const IT_REQUEST_SHEET_NAME = "IT Request"


const SCHEDULE_RELATED_REQUEST_SHEET_NAME = "Schedule Related Requests"





//this trigger is installed from adminhelp email address
function onEditInstall(e) {
  //return

  let ss = e.source;
  let sheet = ss.getActiveSheet();

  let range = e.range;
  let row = range.getRow();
  let col = range.getColumn();

  let value = e.value;
  //let oldValue = e.oldValue;



  if (sheet.getSheetId() == 1033493753) {
    sendRequestEmail(e)

  } else if (sheet.getSheetId() == 0) {

    let status_col = sheet.getRange("STATUS_COL").getColumn();
    let assign_col = sheet.getRange("ASSIGNED_TO").getColumn();

    let category_col = sheet.getRange("CONSOLIDATED_CATEGORY").getColumn();

    // if (row > 1 && col == status_col) {

    //   let microCompleteRange = sheet.getRange("Consolidated_Completed");
    //   let microCompleteRow = microCompleteRange.getRow()

    //   if (row < microCompleteRow && value == "Completed") {
    //     let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues();
    //     sheet.insertRows(microCompleteRow + 1, 1)
    //     sheet.getRange(microCompleteRow + 1, 1, 1, rowData[0].length).setValues(rowData)
    //     //sheet.deleteRows(row, 1)

    //   } else if (row > microCompleteRow && value != "Completed" && value != "" && value != null) {
    //     let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues();
    //     sheet.insertRows(2, 1)
    //     sheet.getRange(2, 1, 1, rowData[0].length).setValues(rowData)
    //     //sheet.deleteRows(row + 1, 1)
    //   }

    // } else
    
    if (row > 1 && col == category_col && value == "Supplies/Maintainance/Equipments") {
      fromConsolidatedToSuppliesAndITRequest(ss, sheet, row, SUPPLIES_SHEET_NAME)

    } else if (row > 1 && col == category_col && value == "IT Request") {
      fromConsolidatedToSuppliesAndITRequest(ss, sheet, row, IT_REQUEST_SHEET_NAME)

    } else if (row > 1 && col == category_col && value == "Schedule Related Requests") {
      fromConsolidatedToScheduleRelated(ss, sheet, row, SCHEDULE_RELATED_REQUEST_SHEET_NAME)

    }



    //Supplies/Maintainance/Equipments Sheet
  } else if (sheet.getSheetId() == 736425633) {
    let supp_Status_Col = sheet.getRange("SUPPLIES_STATUS").getColumn();

    let supp_Cat_Col = sheet.getRange("SUPPLIES_CATEGORY").getColumn();

    let supp_Email_Col = sheet.getRange("SUPPLIES_EMAIL").getColumn();

    if (row > 1 && col == supp_Status_Col) {
      if (value == "In-progress") {
        processInProgress(ss, sheet, row, "SUPPLIES_CLOSED_RANGE")

      } else if (value == "Closed") {
        processClosed(ss, sheet, row, "SUPPLIES_CLOSED_RANGE")

      } else if (value == "Re-open") {
        processReopen(sheet, row, "SUPPLIES_CLOSED_RANGE")
      }

    } else if (row > 1 && col == supp_Cat_Col) {
      if (value != "" && value != null && value != sheet.getName()) {
        fromCategorySheetToOtherSheets(ss, sheet, row, value)
      }

    } else if (row > 1 && col == supp_Email_Col && (value == true || value == "TRUE")) {
      sendCustomEmail(ss, sheet, row, supp_Email_Col)
    }





    //IT Request Sheet
  } else if (sheet.getSheetId() == 714758468) {
    let it_Status_Col = sheet.getRange("IT_STATUS").getColumn();

    let it_Cat_Col = sheet.getRange("IT_CATEGORY").getColumn();

    let it_Email_Col = sheet.getRange("IT_EMAIL").getColumn();

    if (row > 1 && col == it_Status_Col) {
      if (value == "In-progress") {
        processInProgress(ss, sheet, row, "IT_CLOSED_RANGE")

      } else if (value == "Closed") {
        processClosed(ss, sheet, row, "IT_CLOSED_RANGE")

      } else if (value == "Re-open") {
        processReopen(sheet, row, "IT_CLOSED_RANGE")
      }

    } else if (row > 1 && col == it_Cat_Col) {
      if (value != "" && value != null && value != sheet.getName()) {
        fromCategorySheetToOtherSheets(ss, sheet, row, value)
      }

    } else if (row > 1 && col == it_Email_Col && (value == true || value == "TRUE")) {
      sendCustomEmail(ss, sheet, row, it_Email_Col)
    }



    //Schedule Related Requests
  } else if (sheet.getSheetId() == 2038608288) {
    let sche_Status_Col = sheet.getRange("SCHEDULE_STATUS").getColumn();

    let schedule_Cat_Col = sheet.getRange("SCHEDULE_CTEGORY").getColumn();


    if (row > 1 && col == sche_Status_Col) {
      let completeRange = sheet.getRange("SCHEDULE_RELATED_REQUEST_COMPLETE_RANGE");
      let completeRow = completeRange.getRow()

      if (row < completeRow && (value == "Completed" || value == "Complete - Need to close loop")) {
        let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues();
        sheet.insertRows(completeRow + 1, 1)
        sheet.getRange(completeRow + 1, 1, 1, rowData[0].length).setValues(rowData)
        sheet.deleteRows(row, 1)

      } else if (row > completeRow && value != "Completed" && value != "Complete - Need to close loop" && value != "" && value != null) {
        let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues();
        sheet.insertRows(2, 1)
        sheet.getRange(2, 1, 1, rowData[0].length).setValues(rowData)
        sheet.deleteRows(row + 1, 1)
      }

    } else if (row > 1 && col == schedule_Cat_Col) {
      if (value != "" && value != null && value != sheet.getName()) {
        if (value == "Supplies/Maintainance/Equipments") {
          fromConsolidatedToSuppliesAndITRequest(ss, sheet, row, SUPPLIES_SHEET_NAME)

        } else if (value == "IT Request") {
          fromConsolidatedToSuppliesAndITRequest(ss, sheet, row, IT_REQUEST_SHEET_NAME)

        } else if (value == "Other") {
          let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

          let consolidatedSheet = ss.getSheetByName("Consolidated Requests Log (Main)");

          consolidatedSheet.insertRows(2, 1)
          consolidatedSheet.getRange(2, 3, 1, rowData.length).setValues([rowData])
          sheet.deleteRows(row, 1)
        }

      }
    }

  }


  onEditSortMicro(e)



}



/**
 * This function send email when checkbox is clicked in Supplies/Maintainance/Equipments and IT Request Sheet
 */
function sendCustomEmail(ss, sheet, row, emailCheckboxCol) {

  let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let ticketIdIndex = headers.indexOf("Ticket Id");
  let nameIndex = headers.indexOf("Name");
  let commentIndex = headers.indexOf("Comment")
  let statusIndex = headers.indexOf("Status")
  let emailStatusIndex = headers.indexOf("Email Status")

  let contactInfoSheet = ss.getSheetByName("Contact Info")
  let allContact = contactInfoSheet.getRange(1, 1, contactInfoSheet.getLastRow(), 6).getValues();
  let contactNames = allContact.map(r => r[0])

  let indexOfContact = contactNames.indexOf(rowData[nameIndex])
  if (indexOfContact > -1) {

    let subject = "Ticket - " + rowData[ticketIdIndex]
    let body = "Ticket id: " + rowData[ticketIdIndex] + "\n- Status: " + rowData[statusIndex]

    if (rowData[commentIndex] != "" && rowData[commentIndex] != null) {
      body = body + "\n- Comment: " + rowData[commentIndex]
    }

    GmailApp.sendEmail(allContact[indexOfContact][5], subject, body)

    let date = Utilities.formatDate(new Date(), "GMT-6", "MM/dd/yyyy HH:mm:ss")
    sheet.getRange(row, emailStatusIndex + 1).setValue("Email Sent: " + date)
    sheet.getRange(row, emailCheckboxCol).setValue(false)
  }

}




/**
 * this function transfer from one category sheet to other category sheet or even to consolidated log.
 */
function fromCategorySheetToOtherSheets(ss, sheet, row, value) {

  let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]

  if (value == "Other") {

    let consolidatedSheet = ss.getSheetByName("Consolidated Requests Log (Main)");
    rowData.splice(12, 1);
    rowData.shift();
    rowData.pop()
    rowData.pop()

    rowData[7] = ""

    consolidatedSheet.insertRows(2, 1)
    consolidatedSheet.getRange(2, 3, 1, rowData.length).setValues([rowData])
    sheet.deleteRows(row, 1)

    return

  } else if (value == "Schedule Related Requests") {
    let scheduleRelatedSheet = ss.getSheetByName(value);

    rowData.splice(12, 1);
    rowData.shift();
    rowData.pop()
    rowData.pop()

    rowData[7] = ""

    scheduleRelatedSheet.insertRows(2, 1)
    scheduleRelatedSheet.getRange(2, 1, 1, rowData.length).setValues([rowData])
    sheet.deleteRows(row, 1)

    return

  } else {
    let categorySheet = ss.getSheetByName(value);

    categorySheet.insertRows(2, 1)
    categorySheet.getRange(2, 1, 1, rowData.length).setValues([rowData])
    sheet.deleteRows(row, 1)
  }
}












function processReopen(sheet, row, closedRangeName) {

  let closedRange = sheet.getRange(closedRangeName);
  let closedRangeRow = closedRange.getRow()

  if (closedRangeRow > row) return

  let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  sheet.insertRows(2, 1)
  sheet.getRange(2, 1, 1, rowData.length).setValues([rowData])
  sheet.deleteRows(row + 1, 1)



}






function processClosed(ss, sheet, row, closedRangeName) {

  let closedRange = sheet.getRange(closedRangeName);
  let closedRangeRow = closedRange.getRow()

  if (closedRangeRow < row) return

  let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];


  sheet.insertRows(closedRangeRow + 1, 1)
  sheet.getRange(closedRangeRow + 1, 1, 1, rowData.length).setValues([rowData])
  sheet.deleteRows(row, 1)


  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let ticketIdIndex = headers.indexOf("Ticket Id");
  let nameIndex = headers.indexOf("Name");
  let finalActionIndex = headers.indexOf("Final Action Taken")

  let contactInfoSheet = ss.getSheetByName("Contact Info")
  let allContact = contactInfoSheet.getRange(1, 1, contactInfoSheet.getLastRow(), 6).getValues();
  let contactNames = allContact.map(r => r[0])

  let indexOfContact = contactNames.indexOf(rowData[nameIndex])
  if (indexOfContact > -1) {

    let subject = "Ticket - " + rowData[ticketIdIndex]
    let body = "Ticket id: " + rowData[ticketIdIndex] + "\n- Status: Closed"

    if (rowData[finalActionIndex] != "" && rowData[finalActionIndex] != null) {
      body = body + "\n- Final action taken: " + rowData[finalActionIndex]
    }

    GmailApp.sendEmail(allContact[indexOfContact][5], subject, body)
  }

}






function processInProgress(ss, sheet, row, closedRangeName) {

  let closedRange = sheet.getRange(closedRangeName);
  let closedRangeRow = closedRange.getRow()

  if (closedRangeRow < row) return


  let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let ticketIdIndex = headers.indexOf("Ticket Id");
  let nameIndex = headers.indexOf("Name");
  let commentIndex = headers.indexOf("Comment")

  let contactInfoSheet = ss.getSheetByName("Contact Info")
  let allContact = contactInfoSheet.getRange(1, 1, contactInfoSheet.getLastRow(), 6).getValues();
  let contactNames = allContact.map(r => r[0])

  let indexOfContact = contactNames.indexOf(rowData[nameIndex])
  if (indexOfContact > -1) {

    let subject = "Ticket - " + rowData[ticketIdIndex]
    let body = "Ticket id: " + rowData[ticketIdIndex] + "\n- Status: In-progress"

    if (rowData[commentIndex] != "" && rowData[commentIndex] != null) {
      body = body + "\n- Comment: " + rowData[commentIndex]
    }

    GmailApp.sendEmail(allContact[indexOfContact][5], subject, body)
  }


}





function fromConsolidatedToSuppliesAndITRequest(ss, sheet, row, destSheetName) {

  let rowData = sheet.getRange(row, 3, 1, sheet.getLastColumn()).getValues()[0];

  const trackingIdSheet = ss.getSheetByName("Tracking_Ticket_ID_")
  let trackingId = trackingIdSheet.getRange("A2").getValue();
  trackingId++
  trackingIdSheet.getRange("A2").setValue(trackingId)

  rowData.splice(11, -1, "")
  rowData.splice(0, -1, trackingId)

  let destSheet = ss.getSheetByName(destSheetName);
  let suppliesHeaders = destSheet.getRange(1, 1, 1, destSheet.getLastColumn()).getValues()[0]
  let nameIndex = suppliesHeaders.indexOf("Name")
  let statusIndex = suppliesHeaders.indexOf("Status")

  rowData[statusIndex] = "Open"

  destSheet.insertRows(2, 1)
  destSheet.getRange(2, 1, 1, rowData.length).setValues([rowData])

  sheet.deleteRows(row, 1)


  try {

    let contactInfoSheet = ss.getSheetByName("Contact Info")
    let allContact = contactInfoSheet.getRange(1, 1, contactInfoSheet.getLastRow(), 6).getValues();
    let contactNames = allContact.map(r => r[0])

    let indexOfContact = contactNames.indexOf(rowData[nameIndex])
    if (indexOfContact > -1) {

      let subject = "Ticket Created - " + trackingId
      let body = "Hi,\nWe have created a ticket against your request your ticket id is: " + trackingId + "\n- Status: Open\n- Request: " + rowData[6]

      GmailApp.sendEmail(allContact[indexOfContact][5], subject, body)
    }

  } catch (err) { Logger.log(err) }



}






function fromConsolidatedToScheduleRelated(ss, sheet, row, destSheetName) {
  let rowData = sheet.getRange(row, 3, 1, sheet.getLastColumn()).getValues()[0];

  let destSheet = ss.getSheetByName(destSheetName);

  destSheet.insertRows(2, 1)
  destSheet.getRange(2, 1, 1, rowData.length).setValues([rowData])

  sheet.deleteRows(row, 1)

}


























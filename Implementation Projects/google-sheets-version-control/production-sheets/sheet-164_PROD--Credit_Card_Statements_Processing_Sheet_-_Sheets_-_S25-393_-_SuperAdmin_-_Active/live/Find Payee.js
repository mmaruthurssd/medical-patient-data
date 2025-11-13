

const VENDOR_EXPENSES_SS_ID = "1W-SOL_z6tHSj3DVqrzq8DQSd1ECOrlwSCIIY0Ov-ucM"

const VENDOR_UNIQUE_PAYEE_SHEET = "Unique Payees"



const CREDIT_CARD_DESTINATION = "1uYQ47fYin5NdnEAAMLao3QMHZ925Xxd9"
const CREDIT_CARD_SS_ID = "1ABS6vkYmACTT-Rx_xiEWVjbI1zEP3SFfxt5UC6H-eUg"

function findPayeeIds() {



  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Data");
  let headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  let headingsObj = {}
  headings.forEach((h, i) => {
    headingsObj[h.toString().trim()] = i
  })

  //Logger.log(fbHeadingsObj)

  let data = [];
  if (sheet.getLastRow() > 1) {
    data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues()
  }



  // let newData = [];
  // data.forEach(row => {
  //   let rowData = new Array(ccHeadings.length).fill("")





  //   let foundFlage = false
  //   for (var i = 0; i < fbData.length; i++) {
  //     //let formateDate = Utilities.formatDate(fbData[i][fbHeadingsObj["Date"]], "GMT-6", "dd/MM/YYYY")
  //     //fbData[i][fbHeadingsObj["Date"]] = formateDate

  //     for (const key in ccHeadingsObj) {
  //       if (key != "Payee ID") {
  //         if (rowData[ccHeadingsObj[key]] == fbData[i][ccHeadingsObj[key]]) {
  //           foundFlage = true
  //         } else {
  //           foundFlage = false
  //           break
  //         }
  //       }
  //     }

  //     if (foundFlage == true) {
  //       break
  //     }

  //   }
  //   if (foundFlage == false) {
  //     if ((rowData[ccHeadingsObj["Card"]] != "" && rowData[ccHeadingsObj["Card"]] != null) || (rowData[ccHeadingsObj["Transaction Date"]] != "" && rowData[ccHeadingsObj["Transaction Date"]] != null)) {
  //       newData.push(rowData)
  //     }
  //   }

  // })







  let payeeSS = SpreadsheetApp.openById(VENDOR_EXPENSES_SS_ID)
  let uniquePayeeSheet = payeeSS.getSheetByName(VENDOR_UNIQUE_PAYEE_SHEET)
  let uniquePayee = uniquePayeeSheet.getRange(4, 1, uniquePayeeSheet.getLastRow() - 3, uniquePayeeSheet.getLastColumn()).getDisplayValues().filter(r => r[1] != "" && r[1] != null)

  // let vendorTrxsSheet = payeeSS.getSheetByName(VENDOR_TRANSACTIONS_SHEET)
  // let vendorTrxs = vendorTrxsSheet.getRange(2, 1, vendorTrxsSheet.getLastRow() - 1, vendorTrxsSheet.getLastColumn()).getDisplayValues().filter(r => r[3] != "" && r[3] != null)

  // let vendorsChecks = vendorTrxs.map(r => r[3])

  data.forEach(row => {

    for (var i = 0; i < uniquePayee.length; i++) {
      if (row[headingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][1].toString().toLowerCase())) {
        row[headingsObj["Payee ID"]] = uniquePayee[i][0]
        break

      } else if (uniquePayee[i][16] != "" && uniquePayee[i][16] != "Check #" && row[headingsObj["Description"]].toString().toLowerCase().includes(uniquePayee[i][16].toString().toLowerCase().replace("check #", "").trim())) {
        row[headingsObj["Payee ID"]] = uniquePayee[i][0]
        break
      }
    }
  })

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data)
  }




}







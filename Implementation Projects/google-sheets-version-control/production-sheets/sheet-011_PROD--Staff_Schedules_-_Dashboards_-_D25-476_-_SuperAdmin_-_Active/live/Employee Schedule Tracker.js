


function employeeScheTrackerProcess() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let EmpSheet = ss.getSheetByName("Active_Employee_Temp_");
  let allEmployee = EmpSheet.getRange(2, 1, EmpSheet.getLastRow() - 1, 3).getValues().filter(row => row[1] != "" && row[1] != null && row[1] != "#N/A");
  //Logger.log(allEmployee)
  let paycorNames = allEmployee.map(r => r[0].toString().trim())
  let displayNames = allEmployee.map(r => r[1].toString().trim())
  let empSchedule = allEmployee.map(r => r[2].toString().trim())
  let activeEmpObj = {}
  allEmployee.forEach(row => {
    if (activeEmpObj[row[2]]) {
      activeEmpObj[row[2]]["dispName"].push(row[1])
      activeEmpObj[row[2]]["payCorName"].push(row[0])
    } else {
      activeEmpObj[row[2]] = { dispName: [row[1]], payCorName: [row[0]] }
    }
  })
  let totalEmployee = displayNames.length


  //Logger.log(activeEmpObj)
  //return

  let MASheet = ss.getSheetByName("Schedule_Data_MA")
  let MAData = MASheet.getRange(1, 1, MASheet.getLastRow(), MASheet.getLastColumn() - 4).getValues()

  let FDSheet = ss.getSheetByName("Schedule_Data_FD")
  let FDData = FDSheet.getRange(1, 1, FDSheet.getLastRow(), FDSheet.getLastColumn() - 4).getValues()

  let AdminSheet = ss.getSheetByName("Schedule_Data_Admin")
  let AdminData = AdminSheet.getRange(1, 1, AdminSheet.getLastRow(), AdminSheet.getLastColumn() - 4).getValues()


  let datesObj = {}
  let timeOffObj = {}
  //Logger.log(new Date())

  let newDate = new Date()
  newDate.setDate(newDate.getDate() - 15)
  // Logger.log(newDate)
  // return

  for (var i = 0; i < 90; i++) {
    let dateStr = Utilities.formatDate(newDate, "GMT-6", "MM/dd/yyyy")
    datesObj[dateStr] = []
    timeOffObj[dateStr] = { PTO: [], UTO: [], }

    newDate = new Date(newDate.setDate(newDate.getDate() + 1))
  }








  //getting list of all scheduled employee
  datesObj = processScheduleSheetsData(MAData, datesObj, displayNames)
  datesObj = processScheduleSheetsData(FDData, datesObj, displayNames)
  datesObj = processScheduleSheetsData(AdminData, datesObj, displayNames)






  let Sheet = ss.getSheetByName("Employee Schedule Tracker");
  let allDates = Sheet.getRange(1, 2, Sheet.getLastRow(), 1).getValues()



  //getting list of all UTO and PTO employee
  let QueryTimeOffSheet = ss.getSheetByName("Query_TimeOff_Linked")
  let QueryTimeOffData = QueryTimeOffSheet.getRange(1, 1, QueryTimeOffSheet.getLastRow(), QueryTimeOffSheet.getLastColumn()).getValues()

  QueryTimeOffData.forEach(row => {
    if (isValidDate_(row[1])) {
      let dateStr = Utilities.formatDate(row[1], "GMT-6", "MM/dd/yyyy")
      if (timeOffObj[dateStr]) {
        let indexOfName = paycorNames.indexOf(row[7])
        if (indexOfName > -1) {
          let empDisName = displayNames[indexOfName]

          if (row[4].toString().includes("PTO")) {
            timeOffObj[dateStr].PTO.push(empDisName)
          } else {
            timeOffObj[dateStr].UTO.push(empDisName)
          }
        }
        // else {
        //   timeOffObj[dateStr] = {}
        //   if (row[4].toString().includes("PTO")) {
        //     timeOffObj[dateStr].PTO = [row[7].toString().trim()]
        //     timeOffObj[dateStr].UTO = []
        //   } else {
        //     timeOffObj[dateStr].PTO = []
        //     timeOffObj[dateStr].UTO = [row[7].toString().trim()]
        //   }
        // }
      }
    }
  })


  //Logger.log(timeOffObj)


  allDates.forEach((row, index) => {
    if (isValidDate_(row[0])) {
      let dateStr = Utilities.formatDate(row[0], "GMT-6", "MM/dd/yyyy")
      if (datesObj[dateStr]) {
        let uniqueEmployee = [...new Set(datesObj[dateStr])]


        let adminUnassing = [];
        let adminPTO = []
        let adminUTO = []
        let maUnassing = [];
        let maPTO = []
        let maUTO = []
        let fdUnassing = [];
        let fdPTO = []
        let fdUTO = []



        activeEmpObj.Admin.dispName.forEach(n => {
          let indexOfemp = uniqueEmployee.indexOf(n)
          if (indexOfemp == -1) {
            let indexOfempPto = timeOffObj[dateStr]["PTO"].indexOf(n)
            let indexOfempUto = timeOffObj[dateStr]["UTO"].indexOf(n)
            if (indexOfempPto > -1) {
              adminPTO.push(n)
            } else if (indexOfempUto > -1) {
              adminUTO.push(n)
            } else {
              adminUnassing.push(n)
            }

          }
        })
        // let totalAdminStr = "Admin: " + adminUnassing.join(", ") + "; PTO: " + adminPTO.join(", ") + "; UTO: " + adminUTO.join(", ")

        activeEmpObj.MA.dispName.forEach(n => {
          let indexOfemp = uniqueEmployee.indexOf(n)
          if (indexOfemp == -1) {
            let indexOfempPto = timeOffObj[dateStr]["PTO"].indexOf(n)
            let indexOfempUto = timeOffObj[dateStr]["UTO"].indexOf(n)
            if (indexOfempPto > -1) {
              maPTO.push(n)
            } else if (indexOfempUto > -1) {
              maUTO.push(n)
            } else {
              maUnassing.push(n)
            }

          }
        })
        // let totalMaStr = "MA: " + maUnassing.join(", ") + "; PTO: " + maPTO.join(", ") + "; UTO: " + maUTO.join(", ")


        activeEmpObj.FD.dispName.forEach(n => {
          let indexOfemp = uniqueEmployee.indexOf(n)
          if (indexOfemp == -1) {
            let indexOfempPto = timeOffObj[dateStr]["PTO"].indexOf(n)
            let indexOfempUto = timeOffObj[dateStr]["UTO"].indexOf(n)
            if (indexOfempPto > -1) {
              fdPTO.push(n)
            } else if (indexOfempUto > -1) {
              fdUTO.push(n)
            } else {
              fdUnassing.push(n)
            }

          }
        })
        // let totalfdStr = "FD: " + fdUnassing.join(", ") + "; PTO: " + fdPTO.join(", ") + "; UTO: " + fdUTO.join(", ")


        // let totalAdminStr = "Admin: " + adminUnassing.join(", ") + "; PTO: " + adminPTO.join(", ") + "; UTO: " + adminUTO.join(", ")
        // let totalMaStr = "MA: " + maUnassing.join(", ") + "; PTO: " + maPTO.join(", ") + "; UTO: " + maUTO.join(", ")
        // let totalfdStr = "FD: " + fdUnassing.join(", ") + "; PTO: " + fdPTO.join(", ") + "; UTO: " + fdUTO.join(", ")

        let newRow = [totalEmployee, uniqueEmployee.length, totalEmployee - uniqueEmployee.length, adminUnassing.join(", "), adminPTO.join(", "), adminUTO.join(", "), maUnassing.join(", "), maPTO.join(", "), maUTO.join(", "), fdUnassing.join(", "), fdPTO.join(", "), fdUTO.join(", ")]
        Sheet.getRange(index + 1, 4, 1, 12).setValues([newRow])


      }
    }
  })


}




function processScheduleSheetsData(Data, datesObj, displayNames) {

  Data.forEach(row => {
    if (isValidDate_(row[4])) {

      let dateStr = Utilities.formatDate(row[4], "GMT-6", "MM/dd/yyyy")
      if (datesObj[dateStr]) {
        for (var i = 8; i < row.length; i++) {
          if (row[i] != "" && row[i] != null) {
            let formatName = row[i].toString().replace("(Clinic)", "").toString().trim().replace("SX", "").toString().trim()
            let indexOfName = displayNames.indexOf(formatName.toString().trim())
            if (indexOfName > -1) {
              datesObj[dateStr].push(formatName.toString().trim())
            }
          }
        }
      }

    }
  })

  return datesObj

}














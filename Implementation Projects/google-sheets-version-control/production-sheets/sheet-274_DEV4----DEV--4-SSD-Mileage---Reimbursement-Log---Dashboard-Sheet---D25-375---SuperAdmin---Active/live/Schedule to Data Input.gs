

const HOME_LOCATION_RANGE = "H3:I15"
const RATE_TABLE_RANGE = "A3:E11"






function scheduleToProviderMileage() {


  const SS = SpreadsheetApp.getActiveSpreadsheet();

  const SpreadsheetIds = GetIds_()['SpreadsheetIds'];


  //try {


  let twoMonthBefore = new Date(new Date().setDate(new Date().getDate() - 60))
  let oneMonthAfter = new Date(new Date().setDate(new Date().getDate() + 45))


  // let twoMonthBefore = new Date(2022, 11, 31)
  // let oneMonthAfter = new Date(2024, 0, 1)


  let twoMonthBeforeTime = twoMonthBefore.getTime()
  let oneMonthAfterTime = oneMonthAfter.getTime()



  const ScdheduleSS = SpreadsheetApp.openById(SpreadsheetIds['SSD Schedules']);

  const ScheduleMASheet = getSheetByID_(ScdheduleSS, '1257380749')
  let MAdata = ScheduleMASheet.getRange(1, 1, ScheduleMASheet.getLastRow(), 10).getValues().filter(r => r[4] > twoMonthBeforeTime && r[4] < oneMonthAfterTime)





  const Sheet = getSheetByID_(SS, '1596212734')

  let DataInput = Sheet.getRange(3, 1, Sheet.getLastRow() - 2, Sheet.getLastColumn()).getValues().filter(r => r[0] < twoMonthBeforeTime || r[0] > oneMonthAfterTime)


  const RatesTableSheet = SS.getSheetByName('Rates_Table_Locations')
  let HomeLocations = RatesTableSheet.getRange(HOME_LOCATION_RANGE).getValues()
  let HomeLocationsObj = {}
  HomeLocations.forEach(row => {
    HomeLocationsObj[row[0].toString().toLowerCase().trim()] = row[1]
  })


  let RatesTable = RatesTableSheet.getRange(RATE_TABLE_RANGE).getValues()
  let RatesTableObj = {}
  RatesTable.forEach(row => {
    RatesTableObj[row[0].toString().toLowerCase().trim() + row[1].toString().toLowerCase().trim()] = row[4]
  })

  Logger.log(RatesTableObj)




  let newData = []

  //for(var i=0; i<MAdata.length; i++){
  MAdata.forEach(ma => {
    if (isValidDate_(ma[4])) {

      let newRow = null

      if (ma[2].toString().includes("Dr. M")) {
        let providerName = "Mario Maruthur"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }


      }
      if (ma[2].toString().includes("Dr. K")) {
        let providerName = "Kelsey Kennedy"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }


      }
      if (ma[2].toString().includes("AK")) {
        let providerName = "Adrienne Keely"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }


      }
      if (ma[2].toString().includes("LM")) {
        let providerName = "Lauren Miller"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }


      }
      if (ma[2].toString().includes("Davis")) {
        let providerName = "Chelsi Davis"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }


      }
      if (ma[2].toString().includes("Kathryn")) {
        let providerName = "Kathryn Guilbeau"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }

      }

      if (ma[2].toString().includes("Raven (PA)")) {
        let providerName = "Raven Omar"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsen to Trusville"
            DataInput.push(newRow)
          }

        }

      }


      if (ma[2].toString().includes("KP (PA)")) {
        let providerName = "Kaitlyn Parker"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }

        }

      }




      if (ma[2].toString().includes("ES (PA)")) {
        let providerName = "Emma Stephens"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }
        }
      }


      if (ma[2].toString().includes("KM (PA)")) {
        let providerName = "Kimberly Mills"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }
        }
      }


      if (ma[2].toString().includes("Dr. D")) {
        let providerName = "Malia Downing"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }
        }
      }



      if (ma[2].toString().includes("DY (NP)")) {
        let providerName = "Dena Yearwood"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }
        }
      }



      if (ma[2].toString().includes("GM (PA)")) {
        let providerName = "Grace McMahan"
        //newRow = processMaRow(DataInput, providerName, ma)

        newRow = [ma[4], providerName, ma[9], "Mileage", 0, "", ""]

        if (HomeLocationsObj[newRow[1].toString().toLowerCase().trim()] != newRow[2]) {
          let key = HomeLocationsObj[newRow[1].toString().toLowerCase().trim()].toString().toLowerCase().trim() + newRow[2].toString().toLowerCase().trim()
          newRow[4] = RatesTableObj[key]

          if (newRow[2] == "Gadsden") {
            newRow[2] = "Gadsden Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Oxford") {
            newRow[2] = "Oxford Round Trip"
            DataInput.push(newRow)
          } else if (newRow[2] == "Trussville") {
            newRow[2] = "Gadsden to Trusville"
            DataInput.push(newRow)
          }
        }
      }



    }

  })



  // if (DataInput.length == 0) {
  //   Logger.log("No New Data")
  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(SS, "SCR-009", statusRow, true)

  //   return
  // }



  Sheet.getRange(3, 1, DataInput.length, DataInput[0].length).setValues(DataInput)
  Sheet.getRange(3, 6, Sheet.getLastRow() - 2, 1).clearContent()
  Sheet.getRange(3, 1, Sheet.getLastRow() - 2, Sheet.getLastColumn()).sort([{ column: 1, ascending: false }])

  Logger.log(DataInput.length + " rows of data is added")

  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(SS, "SCR-009", statusRow, true)

  // } catch (err) {

  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(SS, "SCR-009", statusRow, false)
  // }



}








function processMaRow(DataInput, providerName, ma) {

  let maDate = Utilities.formatDate(ma[4], "GMT-6", "MM/dd/yyyy")

  let foundFlage = false;
  for (let i = 0; i < DataInput.length; i++) {
    if (!isValidDate_(DataInput[i][0])) continue

    let dataInputDate = Utilities.formatDate(DataInput[i][0], "GMT-6", "MM/dd/yyyy")

    if (dataInputDate == maDate && DataInput[i][1] == providerName && DataInput[i][2].toString().includes(ma[9])) {
      foundFlage = true
      break
    }

  }

  if (foundFlage == false) {
    return [ma[4], providerName, ma[9], "Mileage"]
  } else {
    return null
  }

}










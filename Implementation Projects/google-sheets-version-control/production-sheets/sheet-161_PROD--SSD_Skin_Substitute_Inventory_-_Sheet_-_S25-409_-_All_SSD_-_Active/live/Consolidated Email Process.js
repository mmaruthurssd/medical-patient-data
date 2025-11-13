


function consolidatedEmailProcessMain() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  //try {
  let sheet = ss.getSheetByName("Consolidated (Main)");

  let allData = sheet.getRange(3, 1, sheet.getLastRow() - 2, 7).getValues()


  let companyConsolidatedObj = {}
  allData.forEach(row => {
    let company = row[0]
    if (!companyConsolidatedObj[company]) {
      companyConsolidatedObj[company] = []
      companyConsolidatedObj[company].push(row)

    } else {
      companyConsolidatedObj[company].push(row)
    }
  })



  let compEmailObj = getCompanyEmails_(ss)

  sendingConsolidatedEmailProcess_(companyConsolidatedObj, compEmailObj)
  //   let statusRow = [[Session.getActiveUser(), new Date(), "Successful"]]
  //   updateScriptStatus_(ss, "SCR-012", statusRow, true)


  // } catch (err) {
  //   let statusRow = [[Session.getActiveUser(), new Date(), err]]
  //   updateScriptStatus_(ss, "SCR-012", statusRow, false)
  // }
}





function sendingConsolidatedEmailProcess_(companyConsolidatedObj, compEmailObj) {

  //Logger.log(companyConsolidatedObj)
  for (const key in companyConsolidatedObj) {
    try {

      let signature = "<div></div>"
      try {
        signature = Gmail.Users.Settings.SendAs.list("me").sendAs.filter(function (account) { if (account.isDefault) { return true } })[0].signature;
      } catch (err) { signature = "<div></div>" }

      let htmlTemp = HtmlService.createTemplateFromFile("consolidate Temp");

      htmlTemp.headers = ["COMPANY", "PRODUCT CODE", "SKIN SUBSTITUTE PRODUCT", "SIZE", "TRUSSVILLE", "GADSDEN", "OXFORD"]
      htmlTemp.tableData = companyConsolidatedObj[key]


      htmlTemp.signature = signature

      let htmlBody = htmlTemp.evaluate().getContent();


      let subject = key + " - Skin Substitute Inventory"

      try {
        GmailApp.sendEmail(compEmailObj[key].replace(/\s/g, ''), subject, "", {
          htmlBody: htmlBody
        })

        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, compEmailObj[key].replace(/\s/g, '')])



      } catch (emailError) {
        appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), subject, 1, compEmailObj[key].replace(/\s/g, ''), emailError])
      }


      // GmailApp.sendEmail("rashid_khan143@yahoo.com", subject, "", {
      //   htmlBody: htmlBody
      // })


    } catch (err) { Logger.log(err) }
  }
}

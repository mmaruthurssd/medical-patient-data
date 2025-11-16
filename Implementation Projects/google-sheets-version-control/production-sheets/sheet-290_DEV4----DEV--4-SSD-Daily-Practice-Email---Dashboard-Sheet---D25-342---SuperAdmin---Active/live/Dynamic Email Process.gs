
const EMAIL_CONFIG_SHEET_NAME = "Config Email"


const EMAIL_CATEGORIES_SHEET = "Email Categories"


function createDailyTrigger() {

  deleteDailyTrigger();

  ScriptApp.newTrigger("sendDynamicEmailTrigger")
    .timeBased()
    .everyDays(1)
    .atHour(17)
    .nearMinute(0)
    .create();
}




function deleteDailyTrigger() {
  // Loop over all triggers.
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let index = 0; index < allTriggers.length; index++) {
    // If the current trigger is the correct one, delete it.
    if (allTriggers[index].getHandlerFunction() === "sendDynamicEmailTrigger") {
      ScriptApp.deleteTrigger(allTriggers[index]);

    }
  }
}



function processDynamicEmployeeTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName(EMAIL_CONFIG_SHEET_NAME)
  let allConfigData = configSheet.getRange(1, 1, configSheet.getLastRow(), configSheet.getLastColumn()).getValues()

  let configHeaders = allConfigData.splice(0, 1)[0]

  let COL = {
    emailFreq: configHeaders.indexOf('Automatic Email Frequency'),
    dayOfWeek: configHeaders.indexOf('Day of Week (for Weekly emails)'),
    specificMonthDate: configHeaders.indexOf('Specific Monthly Dates'),
    scheduledTime: configHeaders.indexOf('Automatic Email Schedule Time of Day (Default = 6pm CST)'),

    employee: configHeaders.indexOf('Employee'),
    emailAddress: configHeaders.indexOf('Email Address'),
    sendEmail: configHeaders.indexOf('Send Daily Email?'),
  }


  const todayDetails = getTodayDetails_()


  for (var i = 0; i < allConfigData.length; i++) {
    if (allConfigData[i][COL.sendEmail] != "Yes") continue

    allConfigData[i][COL.sendEmail] = ""

    if (allConfigData[i][COL.emailFreq] == "Daily") {
      if (allConfigData[i][COL.scheduledTime] > 0) {
        if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
          allConfigData[i][COL.sendEmail] = "Yes"
        }
      } else if (allConfigData[i][COL.scheduledTime] == 18) {
        allConfigData[i][COL.sendEmail] = "Yes"
      }

    } else if (allConfigData[i][COL.emailFreq] == "Weekly") {
      if (allConfigData[i][COL.dayOfWeek] == todayDetails.day) {
        if (allConfigData[i][COL.scheduledTime] > 0) {
          if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
            allConfigData[i][COL.sendEmail] = "Yes"
          }
        } else if (allConfigData[i][COL.scheduledTime] == 18) {
          allConfigData[i][COL.sendEmail] = "Yes"
        }
      }

    } else if (allConfigData[i][COL.emailFreq] == "Specific Monthly Dates") {
      if (allConfigData[i][COL.specificMonthDate] == todayDetails.date) {
        if (allConfigData[i][COL.scheduledTime] > 0) {
          if (allConfigData[i][COL.scheduledTime] == todayDetails.hour) {
            allConfigData[i][COL.sendEmail] = "Yes"
          }
        } else if (allConfigData[i][COL.scheduledTime] == 18) {
          allConfigData[i][COL.sendEmail] = "Yes"
        }
      }
    }


  }


}




function getTodayDetails_() {
  const now = new Date();
  const dateOfToday = now.getDate();
  const dayOfToday = now.toLocaleDateString('en-US', { weekday: 'short' });
  const hourNow = now.getHours();

  return {
    date: dateOfToday,
    day: dayOfToday,
    hour: hourNow
  };
}





function testDynamicEmailTrigger() {
  dynamicDailyEmail(true)
}



function sendDynamicEmailTrigger() {
  dynamicDailyEmail(false)
}



function getOrdersList_() {
  const ss = SpreadsheetApp.openById("1HMeabGRigVSXEV7uJdnG28a5McerH2ulEds_7Bk1NOE");
  const sheet = ss.getSheetByName("Daily Email Metric");
  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const headers = allData.splice(0, 1)[0]
  return { ordersData: allData, ordersHeaders: headers }
}


function getEmaVisitsNotes_() {
  const ss = SpreadsheetApp.openById("1pAgnjSWGt5aFQwT525FKWScnk3GmKTm7_-ypeJ8g-aE");
  const sheet = ss.getSheetByName("Daily Email Metric");
  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const headers = allData.splice(0, 1)[0]
  return { emaVisitsNotes: allData, emaVisitsNotesHeaders: headers }
}


function getAppQualityAssurance_() {
  const ss = SpreadsheetApp.openById("1WoGt4NkNxsu8uoTb-FFEME16440244ii7O537l4NlVE");
  const sheet = ss.getSheetByName("Daily Email Metric");
  const allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getDisplayValues().filter(r => r[0] != "" || r[1] != "");
  const headers = allData.splice(0, 1)[0]
  return { appQualityAssurance: allData, appQualityAssuranceHeaders: headers }
}





function dynamicDailyEmail(test) {



  let ss = SpreadsheetApp.openById("1bv3tD_X0VlSvlp-O9jZaBaTSOp_Rgja509aBL06bQO0");




  //Voicemail_Metrics Data
  let [voiceMailHeaders, filteredVoiceMailData, voiceMail3DaysData, voiceMailMonthlyData] = processVoiceMailData_(ss)


  //Fax_Metrics Data
  let [faxHeaders, filteredFaxData, filteredFaxMonthlyData] = processFaxMetrics_(ss)


  //Website_Metrics Data
  let [filteredWebsiteData, websiteMonthlyData] = processWebsiteMetrics_(ss)


  //Future_Appt_Metrics Data
  //let [apptHeaders, filteredApptData] = processApptMetrics_(ss)


  //Incoming_Referrals_Metrics Data
  let [incommingReferralsHeaders, filteredIncommingReferralsData, incommingReferralsMonthlyHeaders, filteredIncommingReferralsMonthlyData] = processIncommingRefMetrics_(ss)


  let [outgoingRefHeaders, outgoingRefData] = processOutgoingReferralsMetrics_(ss)




  //Billing_Provider
  let [billingHeaders, filteredBillingData, monthlyFilteredBillingHeaders, filteredMonthlyBillingData, totalFilteredMonthlyBillingData] = processBillingProvider_(ss)

  //let totalFilteredMonthlyBillingData=[]



  //Biopsy_Data_Menu_Count_Export
  //let biopsyDataMenuSheet = ss.getSheetByName("Biopsy_Data_Menu_Count_Export")
  //let biopsyDataMenuData = biopsyDataMenuSheet.getRange("J1:O4").getValues();
  //let biopsyDataMenuHeaders = biopsyDataMenuData.splice(0, 1)[0];



  let [ptoHeaders, ptoData, ptoTotals] = processPTOrequests_(ss)

  let ptoListObj = processPTOrequestsList_(ss)


  let insurancePatientARObj = processInsurancePatientAR_()

  let preliminaryNotesObj = processInsuranceBillingDash_()


  //Repeat_Calls_Today
  let [todayCallsHeaders, todayCallsData] = processRepeatCallsToday_(ss)


  //Repeat_Calls_Week
  let [weekCallsHeaders, weekCallsData] = processRepeatCallsWeek_(ss)



  let medicalRecordsObj = processCompletedMedicalRecords_()

  let cancerPolicyObj = processCancerPolicy_()

  let billCollectionObj = processPSDyearToDateBillingCollection_()




  let mipsDataObj = getAllMIPSDataMain()

  let mipsFutureApptObj = processMipsQMFuturePatients()


  let invoicesData = processInvoicesDashboard_();

  let ordersDetails = getOrdersList_()

  let emaVisitsNotes = getEmaVisitsNotes_()

  let appQualityAssurance = getAppQualityAssurance_()



  let configSheet = ss.getSheetByName(EMAIL_CONFIG_SHEET_NAME)
  let allConfigData = configSheet.getRange(1, 1, configSheet.getLastRow(), configSheet.getLastColumn()).getDisplayValues()


  let configHeaders = allConfigData.splice(0, 1)[0]

  let COL = {

    employee: configHeaders.indexOf('Employee'),
    emailAddress: configHeaders.indexOf('Email Address'),

    lastSent: configHeaders.indexOf('Last Sent'),
    testEmail: configHeaders.indexOf('Send Test Email (to admin)'),
    sendEmail: configHeaders.indexOf('Send Daily Email?'),
    superadminAllData: configHeaders.indexOf('Superadmin (All Data)'),
    voiceMail: configHeaders.indexOf('Voicemail'),
    faxes: configHeaders.indexOf('Faxes'),
    website: configHeaders.indexOf('Website'),
    incommingReferrals: configHeaders.indexOf('Incoming Referrals'),
    outgoingReferrals: configHeaders.indexOf('Outgoing Referrals'),
    billingProviders: configHeaders.indexOf('Billing Provider'),
    medicalRecordRequests: configHeaders.indexOf('Medical Record Requests'),
    cancerPolicyRequests: configHeaders.indexOf('Cancer Policy Requests'),
    ptoRequests: configHeaders.indexOf('PTO Requests'),
    insurancePatientRequests: configHeaders.indexOf('Insurance & Patient´s A/R'),
    preliminaryNotesFinalized: configHeaders.indexOf('Preliminary Notes to be Finalized'),
    invoices: configHeaders.indexOf('Invoices Details'),
    todayCalls: configHeaders.indexOf('Todays Calls'),
    weekCalls: configHeaders.indexOf('Weeks Calls'),
    mipsVisitsToFix: configHeaders.indexOf('MIPS Visits to Fix'),
    mipsFutureVisitsToFix: configHeaders.indexOf('Upcoming MIPS Visits'),

    orderList: configHeaders.indexOf('Orders List'),
    emaVisitNotes: configHeaders.indexOf('EMA Visit Notes'),
    appQualityAssurance: configHeaders.indexOf('APP Quality Assurance'),

    playbooks: configHeaders.indexOf('Important Links'),

  }

  let lastSent = allConfigData.map(r => [r[COL.lastSent]])





  allConfigData.forEach((row, i) => {

    if ((test && row[COL.testEmail] == "Yes") || row[COL.sendEmail] == "Yes") {


      const htmlTemplate = HtmlService.createTemplateFromFile('DynamicEmail');



      htmlTemplate.voiceMailHeaders = voiceMailHeaders;
      if (row[COL.voiceMail] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.voiceMailData = filteredVoiceMailData;
        htmlTemplate.voiceMail3DaysData = voiceMail3DaysData;
        htmlTemplate.voiceMailMonthlyData = voiceMailMonthlyData

      } else if (row[COL.voiceMail] != "") {
        htmlTemplate.voiceMailData = filteredVoiceMailData.filter(r => (row[COL.voiceMail] + (", ")).includes(r[1] + ", "));
        htmlTemplate.voiceMail3DaysData = voiceMail3DaysData.filter(r => (row[COL.voiceMail] + (", ")).includes(r[1] + ", "));
        htmlTemplate.voiceMailMonthlyData = voiceMailMonthlyData.filter(r => (row[COL.voiceMail] + (", ")).includes(r[1] + ", "));

      } else {
        htmlTemplate.voiceMailData = [];
        htmlTemplate.voiceMail3DaysData = [];
        htmlTemplate.voiceMailMonthlyData = [];
      }



      //return

      htmlTemplate.faxHeaders = faxHeaders;
      if (row[COL.faxes] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.faxData = filteredFaxData;
        htmlTemplate.faxMonthlyData = filteredFaxMonthlyData

      } else if (row[COL.faxes] != "") {
        htmlTemplate.faxData = filteredFaxData.filter(r => (row[COL.faxes] + (", ")).includes(r[1] + ", "));
        htmlTemplate.faxMonthlyData = filteredFaxMonthlyData.filter(r => (row[COL.faxes] + (", ")).includes(r[1] + ", "));

      } else {
        htmlTemplate.faxData = [];
        htmlTemplate.faxMonthlyData = [];
      }





      if (row[COL.website] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.websiteData = filteredWebsiteData;
        htmlTemplate.websiteMonthlyData = websiteMonthlyData
      } else {
        htmlTemplate.websiteData = [];
        htmlTemplate.websiteMonthlyData = [];
      }


      if (row[COL.orderList] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.ordersData = ordersDetails.ordersData;
        htmlTemplate.ordersHeaders = ordersDetails.ordersHeaders;
      } else {
        htmlTemplate.ordersData = [];
        htmlTemplate.ordersHeaders = [];
      }



      if (row[COL.emaVisitNotes] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.emaVisitsNotes = emaVisitsNotes.emaVisitsNotes;
        htmlTemplate.emaVisitsNotesHeaders = emaVisitsNotes.emaVisitsNotesHeaders;
      } else {
        htmlTemplate.emaVisitsNotes = [];
        htmlTemplate.emaVisitsNotesHeaders = [];
      }

      if (row[COL.appQualityAssurance] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.appQualityAssurance = appQualityAssurance.appQualityAssurance;
        htmlTemplate.appQualityAssuranceHeaders = appQualityAssurance.appQualityAssuranceHeaders;
      } else {
        htmlTemplate.appQualityAssurance = [];
        htmlTemplate.appQualityAssuranceHeaders = [];
      }





      htmlTemplate.incommingReferralsHeaders = incommingReferralsHeaders;
      htmlTemplate.incommingReferralsMonthlyHeaders = incommingReferralsMonthlyHeaders;

      if (row[COL.incommingReferrals] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.incommingReferralsData = filteredIncommingReferralsData;
        htmlTemplate.incommingReferralsMonthlyData = filteredIncommingReferralsMonthlyData;

      } else {
        htmlTemplate.incommingReferralsData = [];
        htmlTemplate.incommingReferralsMonthlyData = [];
      }






      htmlTemplate.outgoingRefHeaders = outgoingRefHeaders;
      if (row[COL.outgoingReferrals] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.outgoingRefData = outgoingRefData;

      } else {
        htmlTemplate.outgoingRefData = [];
      }




      htmlTemplate.billingHeaders = billingHeaders;
      htmlTemplate.monthlyFilteredBillingHeaders = monthlyFilteredBillingHeaders;
      htmlTemplate.billCollectionHeaders = billCollectionObj.headers;

      if (row[COL.billingProviders] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.billingData = filteredBillingData;
        htmlTemplate.filteredMonthlyBillingData = filteredMonthlyBillingData;
        htmlTemplate.billCollectionData = billCollectionObj.data;
        htmlTemplate.yearlyTotal = billCollectionObj.yearlyTotal;
        htmlTemplate.totalFilteredMonthlyBillingData = totalFilteredMonthlyBillingData

      } else if (row[COL.billingProviders] != "") {
        htmlTemplate.billingData = filteredBillingData.filter(r => (row[COL.billingProviders] + (", ")).includes(r[2] + ", "));
        htmlTemplate.filteredMonthlyBillingData = filteredMonthlyBillingData.filter(r => (row[COL.billingProviders] + (", ")).includes(r[0] + ", "));
        htmlTemplate.billCollectionData = billCollectionObj.data.filter(r => (row[COL.billingProviders] + (", ")).includes(r[1] + ", "));
        htmlTemplate.yearlyTotal = []
        htmlTemplate.totalFilteredMonthlyBillingData = []
      } else {
        htmlTemplate.billingData = [];
        htmlTemplate.filteredMonthlyBillingData = [];
        htmlTemplate.billCollectionData = [];
        htmlTemplate.yearlyTotal = [];
        htmlTemplate.totalFilteredMonthlyBillingData = [];

      }








      htmlTemplate.medicalRecordsHeaders = medicalRecordsObj.headers;
      if (row[COL.medicalRecordRequests] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.medicalRecordsData = medicalRecordsObj.data;

      } else {
        htmlTemplate.medicalRecordsData = [];
      }





      htmlTemplate.cancerPolicyHeaders = cancerPolicyObj.headers;
      if (row[COL.cancerPolicyRequests] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.cancerPolicyData = cancerPolicyObj.data;

      } else {
        htmlTemplate.cancerPolicyData = [];
      }




      //ptoRequests
      htmlTemplate.ptoHeaders = ptoHeaders;
      htmlTemplate.ptoData = ptoData;
      htmlTemplate.ptoTotals = ptoTotals;



      htmlTemplate.ptoListHeaders = ptoListObj.headers;
      if (row[COL.ptoRequests] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.ptoListPending = ptoListObj.pending;
        htmlTemplate.ptoListCancelled = ptoListObj.cancelled;
        htmlTemplate.ptoListApproved = ptoListObj.approved;

      } else if (row[COL.ptoRequests] == 'Approved') {
        htmlTemplate.ptoListPending = [];
        htmlTemplate.ptoListCancelled = [];
        htmlTemplate.ptoListApproved = ptoListObj.approved;

      } else if (row[COL.ptoRequests] == 'Canceled') {
        htmlTemplate.ptoListPending = [];
        htmlTemplate.ptoListCancelled = ptoListObj.cancelled;
        htmlTemplate.ptoListApproved = [];

      } else if (row[COL.ptoRequests] == 'Pending') {
        htmlTemplate.ptoListPending = ptoListObj.pending;
        htmlTemplate.ptoListCancelled = [];
        htmlTemplate.ptoListApproved = [];

      } else {
        htmlTemplate.ptoListPending = [];
        htmlTemplate.ptoListCancelled = [];
        htmlTemplate.ptoListApproved = [];
      }




      //insurancePatientRequests

      htmlTemplate.insurancePatientARHeadings = insurancePatientARObj.headings
      if (row[COL.insurancePatientRequests] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.insurancePatientARData = insurancePatientARObj.data;

      } else if (row[COL.voiceMail] != "") {
        htmlTemplate.insurancePatientARData = insurancePatientARObj.data.filter(r => (row[COL.voiceMail] + (", ")).includes(r[2] + ", "));

      } else {
        htmlTemplate.insurancePatientARData = [];
      }




      //preliminaryNotesFinalized
      if (row[COL.preliminaryNotesFinalized] == "All" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.preliminaryNotesHeadings = preliminaryNotesObj.headings
        htmlTemplate.preliminaryNotesData = preliminaryNotesObj.data

      } else if (row[COL.preliminaryNotesFinalized] != "") {

        let splitSelection = row[COL.preliminaryNotesFinalized].split(", ");
        let columnIndices = [0]
        splitSelection.forEach(s => {
          let indexOfColumn = preliminaryNotesObj.headings.indexOf(s)
          if (indexOfColumn > 0) {
            columnIndices.push(indexOfColumn)
          }
        })
        let filteredData = extractColumns_(preliminaryNotesObj.data, columnIndices)
        htmlTemplate.preliminaryNotesData = filteredData
        htmlTemplate.preliminaryNotesHeadings = columnIndices.map(c => preliminaryNotesObj.headings[c])

      } else {
        htmlTemplate.preliminaryNotesData = []
      }



      htmlTemplate.countUnpaidHeaders = []
      htmlTemplate.countUnpaidData = []


      htmlTemplate.countPendingHeaders = []
      htmlTemplate.countPendingData = []


      htmlTemplate.unpaidInvoicesHeaders = []
      htmlTemplate.unpaidInvoicesData = []

      htmlTemplate.toBePaidHeaders = []
      htmlTemplate.toBePaidData = []

      htmlTemplate.passedTobePaidHeaders = []
      htmlTemplate.passedTobePaidData = []

      htmlTemplate.passedDueHeaders = []
      htmlTemplate.passedDueData = []

      if (row[COL.invoices] == "All") {

        htmlTemplate.countUnpaidHeaders = invoicesData.countUnpaid.headers
        htmlTemplate.countUnpaidData = invoicesData.countUnpaid.data


        htmlTemplate.countPendingHeaders = invoicesData.countPending.headers
        htmlTemplate.countPendingData = invoicesData.countPending.data


        htmlTemplate.unpaidInvoicesHeaders = invoicesData.unpaidInvoices.headers
        htmlTemplate.unpaidInvoicesData = invoicesData.unpaidInvoices.data

        htmlTemplate.toBePaidHeaders = invoicesData.toBePaid.headers
        htmlTemplate.toBePaidData = invoicesData.toBePaid.data

        htmlTemplate.passedTobePaidHeaders = invoicesData.passedToBePaid.headers
        htmlTemplate.passedTobePaidData = invoicesData.passedToBePaid.data

        htmlTemplate.passedDueHeaders = invoicesData.passedDueDate.headers
        htmlTemplate.passedDueData = invoicesData.passedDueDate.data

      } else if (row[COL.invoices].includes("Unpaid Count")) {
        htmlTemplate.countUnpaidHeaders = invoicesData.countUnpaid.headers
        htmlTemplate.countUnpaidData = invoicesData.countUnpaid.data

      } else if (row[COL.invoices].includes("Paid Pending Count")) {
        htmlTemplate.countPendingHeaders = invoicesData.countPending.headers
        htmlTemplate.countPendingData = invoicesData.countPending.data

      } else if (row[COL.invoices].includes("Past due date invoices")) {
        htmlTemplate.unpaidInvoicesHeaders = invoicesData.unpaidInvoices.headers
        htmlTemplate.unpaidInvoicesData = invoicesData.unpaidInvoices.data

      } else if (row[COL.invoices].includes("Vendor To be Paid Date")) {
        htmlTemplate.toBePaidHeaders = invoicesData.toBePaid.headers
        htmlTemplate.toBePaidData = invoicesData.toBePaid.data

      } else if (row[COL.invoices].includes("Vendor Passed to be Paid Date")) {
        htmlTemplate.passedTobePaidHeaders = invoicesData.passedToBePaid.headers
        htmlTemplate.passedTobePaidData = invoicesData.passedToBePaid.data

      } else if (row[COL.invoices].includes("Vendor Past due date")) {
        htmlTemplate.passedDueHeaders = invoicesData.passedDueDate.headers
        htmlTemplate.passedDueData = invoicesData.passedDueDate.data

      }




      htmlTemplate.todayCallsHeaders = todayCallsHeaders;
      if (row[COL.todayCalls] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.todayCallsData = todayCallsData;
      } else {
        htmlTemplate.todayCallsData = [];
      }




      htmlTemplate.weekCallsHeaders = weekCallsHeaders;
      if (row[COL.weekCalls] == "Yes" || row[COL.superadminAllData] == "Yes") {
        htmlTemplate.weekCallsData = weekCallsData;
      } else {
        htmlTemplate.weekCallsData = [];
      }



      //MIPS VISITS TO FIX (LAST AND CURRENT WEEK)
      //mipsVisitsToFix
      let mipsHTML = ""
      if (row[COL.mipsVisitsToFix] == "All" || row[COL.superadminAllData] == "Yes") {
        mipsHTML = processDynamicProviderMIPS_(mipsDataObj, 'Keely, Adrienne, Maruthur, Mario, Miller, Lauren, Parker, Kaitlyn, Stephens, Emma, Mills, Kimberly, Downing, Malia')

      } else if (row[COL.mipsVisitsToFix] != "") {
        mipsHTML = processDynamicProviderMIPS_(mipsDataObj, row[COL.mipsVisitsToFix])

      }




      //Future Upcomming MIPS
      //mipsFutureVisitsToFix
      let mipsFutureHTML = ""
      if (row[COL.mipsFutureVisitsToFix] == "All" || row[COL.superadminAllData] == "Yes") {
        mipsFutureHTML = processDynamicFutureApptProviderMIPS_(mipsFutureApptObj, 'LAUREN MILLER, MARIO MARUTHUR, ADRIENNE KEELY, KAITLYN PARKER, EMMA STEPHENS, KIMBERLY MILLS, MALIA DOWNING')

      } else if (row[COL.mipsFutureVisitsToFix] != "") {
        mipsFutureHTML = processDynamicFutureApptProviderMIPS_(mipsFutureApptObj, row[COL.mipsFutureVisitsToFix])
      }


      const htmlBody = htmlTemplate.evaluate().getContent();




      //Playbooks
      let playbooksHTML = ""
      if (row[COL.playbooks] != "") {
        playbooksHTML = processPlaybooks_(ss, row[COL.playbooks])
      }




      try {

        if (hasValueInRange_(row, 3, 18)) {
          if (row[COL.emailAddress].toString().trim() != "") {

            let allProvidersSubject = "Daily Practice Email for " + row[COL.employee]

            if (test && row[COL.testEmail] == "Yes") {

              GmailApp.sendEmail("admin@ssdspc.com", allProvidersSubject, "", {
                htmlBody: htmlBody + mipsHTML + mipsFutureHTML + playbooksHTML + "<p>This email is autogenerated.</p>"
              })

              lastSent[i][0] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:MM")

              appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), allProvidersSubject, 1, "admin@ssdspc.com"])

            } else if (!test && row[COL.sendEmail] == "Yes") {


              GmailApp.sendEmail(row[COL.emailAddress], allProvidersSubject, "", {
                bcc: "admin@ssdspc.com",
                htmlBody: htmlBody + mipsHTML + mipsFutureHTML + playbooksHTML + `<p>We value your feedback! If you have any anonymous suggestions or ideas you'd like to share, please feel free to use the Google Form linked below. Your input helps us improve, and your responses will remain completely anonymous.<br>https://docs.google.com/forms/d/e/1FAIpQLSfZIB7QbqCQ6fSTPEFw8waHS0QYvzlKQyOLsm7I6Wh8VqjZ9g/viewform<br>Thank you for your contribution!</p><p>This email is autogenerated.</p>`
              })

              lastSent[i][0] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy HH:MM")

              appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), allProvidersSubject, 1, row[2]])

            }

          }

        }

      } catch (err) { }

    }



  })

  configSheet.getRange(2, COL.lastSent + 1, configSheet.getLastRow() - 1, 1).setValues(lastSent)
  configSheet.getRange(2, COL.testEmail + 1, configSheet.getLastRow() - 1, 1).clearContent()

}








function processInvoicesDashboard_() {
  let invoiceSS = SpreadsheetApp.openById("1litcuGtcoQcsiVGA56_Lc_oDhCOBT7sIEyqt0Gerigw")
  let metricSheet = getSheetByID_(invoiceSS, '604712494');

  let countUnpaidData = metricSheet.getRange("A1:B").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let countUnpaidHeaders = countUnpaidData.splice(0, 1)[0];


  let countPendingData = metricSheet.getRange("D1:E").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let countPendingHeaders = countPendingData.splice(0, 1)[0];


  let unpaidInvoicesData = metricSheet.getRange("G1:L").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let unpaidInvoicesHeaders = unpaidInvoicesData.splice(0, 1)[0];



  let toBePaidData = metricSheet.getRange("O1:P").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let toBePaidHeaders = toBePaidData.splice(0, 1)[0];

  let passedToBePaidData = metricSheet.getRange("R1:S").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let passedToBePaidHeaders = passedToBePaidData.splice(0, 1)[0];

  let passedDueData = metricSheet.getRange("U1:V").getDisplayValues().filter(r => r[0] != '' || r[1] != '');
  let passedDueHeaders = passedDueData.splice(0, 1)[0];


  return { countUnpaid: { headers: countUnpaidHeaders, data: countUnpaidData }, countPending: { headers: countPendingHeaders, data: countPendingData }, unpaidInvoices: { headers: unpaidInvoicesHeaders, data: unpaidInvoicesData }, toBePaid: { headers: toBePaidHeaders, data: toBePaidData }, passedToBePaid: { headers: passedToBePaidHeaders, data: passedToBePaidData }, passedDueDate: { headers: passedDueHeaders, data: passedDueData } }


}










function processPlaybooks_(ss, selectedPlaybooks) {
  // Logger.log(selectedPlaybooks)
  // selectedPlaybooks="SSD Employee Policies & Procedures, SSD Playbook - Clinical APP"
  // ss=SpreadsheetApp.getActiveSpreadsheet()

  let categorySheet = ss.getSheetByName(EMAIL_CATEGORIES_SHEET)

  let allPlaybooks = categorySheet.getRange("Q2:R").getDisplayValues().filter(r => r[0] != "")
  let allPlaybooksArray = allPlaybooks.map(r => r[0])

  let splitSelected = selectedPlaybooks.split(", ");

  let html = "<h3>Important Links</h3><p>";

  for (var p = 0; p < splitSelected.length; p++) {
    let indexOfPlayBook = allPlaybooksArray.indexOf(splitSelected[p]);
    if (indexOfPlayBook > -1) {
      html += `<a href="${allPlaybooks[indexOfPlayBook][1]}">${allPlaybooks[indexOfPlayBook][0]}</a><br>`
    }
  }


  html += "</p>"


  return html

}






function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = getSheetByID_(ELSS, '9732092');
  ELSheet.appendRow(row)

}





function processDynamicProviderMIPS_(mipsDataObj, providers) {

  //Logger.log(mipsDataObj.sheet1FilteredData)

  let data1 = mipsDataObj.sheet1FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])
  let data2 = mipsDataObj.sheet2FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])
  let data3 = mipsDataObj.sheet3FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])
  let data4 = mipsDataObj.sheet4FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])
  let data5 = mipsDataObj.sheet5FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])
  let data6 = mipsDataObj.sheet6FilteredData.filter(r => providers.includes(r[1])).map(r => [r[1], r[0], r[2], r[3], r[4], r[5]])



  const htmlTemplate = HtmlService.createTemplateFromFile('MIPS');


  htmlTemplate.sheetHeaders = ["Provider", "Visit", "Patient", "MRN", "Facility", "Fixed?"];



  htmlTemplate.sheet1Data = data1;
  htmlTemplate.sheet1Count = data1.length;


  htmlTemplate.sheet2Data = data2;
  htmlTemplate.sheet2Count = data2.length;


  htmlTemplate.sheet3Data = data3;
  htmlTemplate.sheet3Count = data3.length;


  htmlTemplate.sheet4Data = data4;
  htmlTemplate.sheet4Count = data4.length;


  htmlTemplate.sheet5Data = data5;
  htmlTemplate.sheet5Count = data5.length;


  htmlTemplate.sheet6Data = data6;
  htmlTemplate.sheet6Count = data6.length;


  const htmlBody = htmlTemplate.evaluate().getContent();


  return htmlBody


}










function processDynamicFutureApptProviderMIPS_(mipsFutureApptObj, providers) {

  let data1 = mipsFutureApptObj.data1.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])
  let data2 = mipsFutureApptObj.data2.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])
  let data3 = mipsFutureApptObj.data3.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])
  let data4 = mipsFutureApptObj.data4.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])
  let data5 = mipsFutureApptObj.data5.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])
  let data6 = mipsFutureApptObj.data6.filter(r => providers.includes(r[6])).map(r => [r[6], r[0], r[1], r[2], r[3], r[4]])



  const htmlTemplate = HtmlService.createTemplateFromFile('MIPSFuture');


  htmlTemplate.sheetHeaders = ["PROVIDER", "MRN", "PATIENT NAME", "LAST VISIT", "NEXT VISIT", "FACILITY"];






  htmlTemplate.sheet1Data = data1;
  htmlTemplate.sheet1Count = data1.length;


  htmlTemplate.sheet2Data = data2;
  htmlTemplate.sheet2Count = data2.length;


  htmlTemplate.sheet3Data = data3;
  htmlTemplate.sheet3Count = data3.length;


  htmlTemplate.sheet4Data = data4;
  htmlTemplate.sheet4Count = data4.length;


  htmlTemplate.sheet5Data = data5;
  htmlTemplate.sheet5Count = data5.length;


  htmlTemplate.sheet6Data = data6;
  htmlTemplate.sheet6Count = data6.length;


  const htmlBody = htmlTemplate.evaluate().getContent();


  return htmlBody


}




function extractColumns_(arr, columnIndices) {
  return arr.map(row => columnIndices.map(index => row[index]))
}


function hasValueInRange_(arr, start, end) {
  return arr.slice(start, end + 1).some(v => v)
}

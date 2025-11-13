


//const APPT_PROVIDERS = ["Maruthur, Mario", "Keely, Adrienne", "Davis, Chelsi", "Kennedy, Kelsey", "Miller, Lauren"]

const APPT_PROVIDERS = ["Keely, Adrienne", "Davis, Chelsi", "Kennedy, Kelsey", "Miller, Lauren"]


const AMA_137 = "1YdaPsN1vjBDLR2zmjFd3MB6rtUNtzUXQ"
const AMA_226 = "14aCc1p08kCfF28R9cx3Ult1jWXX74P5i"
const AMA_394 = "1j0ek_PWOhoi7PRJ-0Csh0q-I8UidlanC"
const AMA_410 = "1BqIj8KZeC3p-6OSeKpJFSHwwEFgEObAz"
const AMA_485 = "1Is2Ogw6p79SaTlBwgLUNyE4nrhKjkM2l"
const AMA_486 = "12iiGhP2NSRKfbkQSAdcsMOyhTYBvRYp4"




function dailyEmailMain() {


  let ss = SpreadsheetApp.openById("1bv3tD_X0VlSvlp-O9jZaBaTSOp_Rgja509aBL06bQO0");


  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  let yesterDayDate = new Date(new Date().setDate(new Date().getDate() - 1));
  let yesterDayDateStr = Utilities.formatDate(yesterDayDate, 'GMT-6', 'yyyy/M/d');

  let beforeYesterDayDate = new Date(new Date().setDate(new Date().getDate() - 2));
  let beforeYesterDayDateStr = Utilities.formatDate(beforeYesterDayDate, 'GMT-6', 'yyyy/M/d');

  let tomorrowDate = new Date(new Date().setDate(new Date().getDate() + 1));
  let tomorrowDateStr = Utilities.formatDate(tomorrowDate, 'GMT-6', 'yyyy/M/d');

  let afterTomorrowDate = new Date(new Date().setDate(new Date().getDate() + 2));
  let afterTomorrowDateStr = Utilities.formatDate(afterTomorrowDate, 'GMT-6', 'yyyy/M/d');



  //Voicemail_Metrics Data
  let [voiceMailHeaders, filteredVoiceMailData, voiceMail3DaysData] = processVoiceMailData_(ss)



  //Fax_Metrics Data
  let [faxHeaders, filteredFaxData] = processFaxMetrics_(ss)




  //Website_Metrics Data
  let filteredWebsiteData = processWebsiteMetrics_(ss)



  //Future_Appt_Metrics Data
  let [apptHeaders, filteredApptData] = processApptMetrics_(ss)



  //Incoming_Referrals_Metrics Data
  let [incommingReferralsHeaders, filteredIncommingReferralsData, incommingReferralsMonthlyHeaders, filteredIncommingReferralsMonthlyData] = processIncommingRefMetrics_(ss)


  let [outgoingRefHeaders, outgoingRefData] = processOutgoingReferralsMetrics_(ss)




  //Billing_Provider
  let [billingHeaders, filteredBillingData, monthlyFilteredBillingHeaders, filteredMonthlyBillingData] = processBillingProvider_(ss)





  //Biopsy_Data_Menu_Count_Export
  let biopsyDataMenuSheet = ss.getSheetByName("Biopsy_Data_Menu_Count_Export")
  let biopsyDataMenuData = biopsyDataMenuSheet.getRange("J1:O4").getValues();
  let biopsyDataMenuHeaders = biopsyDataMenuData.splice(0, 1)[0];




  let [ptoHeaders, ptoData, ptoTotals] = processPTOrequests_(ss)

  let ptoListObj = processPTOrequestsList_(ss)


  let insurancePatientARObj = processInsurancePatientAR_()

  let preliminaryNotesObj = processInsuranceBillingDash_()


  //Repeat_Calls_Today
  let [todayCallsHeaders, todayCallsData] = processRepeatCallsToday_(ss)


  //Repeat_Calls_Week
  let [weekCallsHeaders, weekCallsData] = processRepeatCallsWeek_(ss)



  let medicalRecordsObj = processCompletedMedicalRecords_()

  let cancelPolicyObj = processCancerPolicy_()

  let billCollectionObj = processPSDyearToDateBillingCollection_()



  let invoicesData = processInvoicesDashboard_();


  const htmlTemplate = HtmlService.createTemplateFromFile('Daily Email Template');



  htmlTemplate.voiceMailHeaders = voiceMailHeaders;
  htmlTemplate.voiceMailData = filteredVoiceMailData;
  htmlTemplate.voiceMail3DaysData = voiceMail3DaysData;


  htmlTemplate.faxHeaders = faxHeaders;
  htmlTemplate.faxData = filteredFaxData;



  htmlTemplate.websiteData = filteredWebsiteData;




  htmlTemplate.incommingReferralsHeaders = incommingReferralsHeaders;
  htmlTemplate.incommingReferralsData = filteredIncommingReferralsData;

  htmlTemplate.incommingReferralsMonthlyHeaders = incommingReferralsMonthlyHeaders;
  htmlTemplate.incommingReferralsMonthlyData = filteredIncommingReferralsMonthlyData;



  htmlTemplate.outgoingRefHeaders = outgoingRefHeaders;
  htmlTemplate.outgoingRefData = outgoingRefData;




  htmlTemplate.billingHeaders = billingHeaders;
  htmlTemplate.billingData = filteredBillingData;

  htmlTemplate.monthlyFilteredBillingHeaders = monthlyFilteredBillingHeaders;
  htmlTemplate.filteredMonthlyBillingData = filteredMonthlyBillingData;

  htmlTemplate.billCollectionHeaders = billCollectionObj.headers;
  htmlTemplate.billCollectionData = billCollectionObj.data;





  htmlTemplate.medicalRecordsHeaders = medicalRecordsObj.headers;
  htmlTemplate.medicalRecordsData = medicalRecordsObj.data;


  htmlTemplate.cancelPolicyHeaders = cancelPolicyObj.headers;
  htmlTemplate.cancelPolicyData = cancelPolicyObj.data;



  htmlTemplate.ptoHeaders = ptoHeaders;
  htmlTemplate.ptoData = ptoData;
  htmlTemplate.ptoTotals = ptoTotals;



  htmlTemplate.ptoListHeaders = ptoListObj.headers;
  htmlTemplate.ptoListPending = ptoListObj.pending;
  htmlTemplate.ptoListCancelled = ptoListObj.cancelled;
  htmlTemplate.ptoListApproved = ptoListObj.approved;


  htmlTemplate.todayCallsHeaders = todayCallsHeaders;
  htmlTemplate.todayCallsData = todayCallsData;



  htmlTemplate.weekCallsHeaders = weekCallsHeaders;
  htmlTemplate.weekCallsData = weekCallsData;



  htmlTemplate.insurancePatientARHeadings = insurancePatientARObj.headings
  htmlTemplate.insurancePatientARData = insurancePatientARObj.data

  htmlTemplate.preliminaryNotesHeadings = preliminaryNotesObj.headings
  htmlTemplate.preliminaryNotesData = preliminaryNotesObj.data




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



  const htmlBody = htmlTemplate.evaluate().getContent();

  let allProvidersRecpSheet = ss.getSheetByName("All Providers Recipients")

  let allProvidersRecp = allProvidersRecpSheet.getRange(2, 2, allProvidersRecpSheet.getLastRow() - 1, 1).getValues().filter(row => row[0] != "" && row[0] != null).map(r => r[0].toString().trim())

  let allProvidersSubject = "SSD Daily Metrics for SuperAdmin"
  try {
    GmailApp.sendEmail(allProvidersRecp, allProvidersSubject, "", {
      htmlBody: htmlBody
    })

    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), allProvidersSubject, allProvidersRecp.length, allProvidersRecp.join(",")])


  } catch (emailError) {
    appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), allProvidersSubject, allProvidersRecp.length, allProvidersRecp.join(","), emailError])
  }


  // GmailApp.sendEmail("rashid_khan143@yahoo.com", allProvidersSubject, "", {
  //   htmlBody: htmlBody
  // })

  // GmailApp.sendEmail("admin@ssdspc.com", allProvidersSubject, "", {
  //   htmlBody: htmlBody
  // })
  // return


  //return

  // let timeNow = new Date()
  // let conditionTime = new Date(new Date().setHours(15, 0, 0, 0))

  // if (timeNow.getDay() == 0 || timeNow.getDay() == 6) return
  // if (timeNow.getTime() < conditionTime.getTime()) return


  //provider process starts

  let apptProvidersSheet = ss.getSheetByName("APPT_PROVIDERS");
  let apptProviders = apptProvidersSheet.getRange(2, 1, apptProvidersSheet.getLastRow() - 1, 2).getValues();

  let calendarSS = SpreadsheetApp.openById("1lX6rl_lPqSnx1wnmW0uYZt_RNkjsYcyJcnIpBlISuKE")

  let providerDailyBillingSheet = ss.getSheetByName("Providers_Daily_Billing")
  let providerMonthlyBillingSheet = ss.getSheetByName("Providers_Monthly_Billing")


  // let mipsSheet = ss.getSheetByName('MIPS_LIST');
  // let allMips = mipsSheet.getRange(2, 1, mipsSheet.getLastRow() - 1, mipsSheet.getLastColumn()).getValues()

  let mipsDataObj = getAllMIPSDataMain()
  let mipsFutureApptObj = processMipsQMFuturePatients()



  let file1 = DriveApp.getFileById(AMA_137).getAs(MimeType.PDF)
  let file2 = DriveApp.getFileById(AMA_226).getAs(MimeType.PDF)
  let file3 = DriveApp.getFileById(AMA_394).getAs(MimeType.PDF)
  let file4 = DriveApp.getFileById(AMA_410).getAs(MimeType.PDF)
  let file5 = DriveApp.getFileById(AMA_485).getAs(MimeType.PDF)
  let file6 = DriveApp.getFileById(AMA_486).getAs(MimeType.PDF)


  for (var i = 0; i < apptProviders.length; i++) {


    let personVoiceMailData = filteredVoiceMailData.filter(r => r[1].toString().includes(apptProviders[i][0].split(" ")[0].trim()) || r[1].toString().includes(apptProviders[i][0].split(" ")[1].trim()))


    //calendar Sheet Process:
    let calendarData = []
    let calendarColor = []
    let dailyBillingHeaders = ["DATE", "DAY", "PROVIDER", "TOTAL BILLING", "BIOPSIES PERFORMED"];
    let providerDailyBillingData = []

    let monthlyBillingHeaders = ["YEAR-MONTH", "PROVIDER", "TOTAL BILLING", "TOTAL COLLECTED"];
    let providerMonthlyBillingData = []


    //faxHeaders, filteredFaxData
    let providerFaxData = []
    let yearlyBilling = []

    let mipsHTML = ""
    let mipsFutureHtml

    let preliminaryNotesHeaders = []
    let preliminaryNotes = []

    if (apptProviders[i][0] == "Kaitlyn Parker") {

      preliminaryNotesHeaders = ["Date", "KAITLYN PARKER"]
      preliminaryNotes = preliminaryNotesObj.data.map(r => [r[0], r[2]]).filter(r => r[1] != "")

      mipsHTML = processProviderMIPS_(mipsDataObj, "Parker, Kaitlyn", "Kennedy, Kelsey")

      mipsFutureHtml = processFutureApptProviderMIPS_(mipsFutureApptObj, "Parker, Kaitlyn", "KAITLYN PARKER")



      let teamThreeDaysVoiceMails = ss.getSheetByName("Voicemail_Metrics_3_Days").getRange("A5:D5").getDisplayValues()[0]
      personVoiceMailData.push(teamThreeDaysVoiceMails)


      providerDailyBillingData = providerDailyBillingSheet.getRange("AG3:AL").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
      //providerMonthlyBillingData = providerMonthlyBillingSheet.getRange("Z3:AC").getDisplayValues().filter(row => row[1] != "" && row[1] != null)

      providerMonthlyBillingData = filteredMonthlyBillingData.filter(r => r[0].includes("KAITLYN PARKER"))

      yearlyBilling = billCollectionObj.data.filter(r => r[1].includes("KAITLYN PARKER"))

      providerFaxData = filteredFaxData.filter(r => r[1] == "Kaitlyn's Parker Team")

    } else if (apptProviders[i][0] == "Adrienne Keely") {

      preliminaryNotesHeaders = ["Date", "ADRIENNE KEELY"]
      preliminaryNotes = preliminaryNotesObj.data.map(r => [r[0], r[1]]).filter(r => r[1] != "")

      mipsHTML = processProviderMIPS_(mipsDataObj, "Keely, Adrienne", "Keely, Adrienne")

      mipsFutureHtml = processFutureApptProviderMIPS_(mipsFutureApptObj, "Keely, Adrienne", "ADRIENNE KEELY")

      let teamThreeDaysVoiceMails = ss.getSheetByName("Voicemail_Metrics_3_Days").getRange("A3:D3").getDisplayValues()[0]
      personVoiceMailData.push(teamThreeDaysVoiceMails)

      providerDailyBillingData = providerDailyBillingSheet.getRange("AA3:AF").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
      //providerMonthlyBillingData = providerMonthlyBillingSheet.getRange("U3:X").getDisplayValues().filter(row => row[1] != "" && row[1] != null)

      providerMonthlyBillingData = filteredMonthlyBillingData.filter(r => r[0].includes("ADRIENNE KEELY"))

      yearlyBilling = billCollectionObj.data.filter(r => r[1].includes("ADRIENNE KEELY"))

      providerFaxData = filteredFaxData.filter(r => r[1] == "Adrienne's Team")



    } else if (apptProviders[i][0] == "Lauren Miller") {

      preliminaryNotesHeaders = ["Date", "LAUREN MILLER"]
      preliminaryNotes = preliminaryNotesObj.data.map(r => [r[0], r[3]]).filter(r => r[1] != "")

      mipsHTML = processProviderMIPS_(mipsDataObj, "Miller, Lauren", "Miller, Lauren")

      mipsFutureHtml = processFutureApptProviderMIPS_(mipsFutureApptObj, "Miller, Lauren", "LAUREN MILLER")

      // let calendarDataObj = getCalendarData(calendarSS, "L_Miller_Calendar")
      // calendarData = calendarDataObj.calendarDataArray;
      // calendarColor = calendarDataObj.calendarColorArray;

      let teamThreeDaysVoiceMails = ss.getSheetByName("Voicemail_Metrics_3_Days").getRange("A6:D6").getDisplayValues()[0]
      personVoiceMailData.push(teamThreeDaysVoiceMails)

      providerDailyBillingData = providerDailyBillingSheet.getRange("U3:Z").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
      providerMonthlyBillingData = providerMonthlyBillingSheet.getRange("P3:S").getDisplayValues().filter(row => row[1] != "" && row[1] != null)

      providerMonthlyBillingData = filteredMonthlyBillingData.filter(r => r[0].includes("LAUREN MILLER"))

      yearlyBilling = billCollectionObj.data.filter(r => r[1].includes("LAUREN MILLER"))

      providerFaxData = filteredFaxData.filter(r => r[1] == "Lauren Miller's Team")



    } else if (apptProviders[i][0] == "Mario Maruthur") {


      preliminaryNotesHeaders = ["Date", "MARIO MARUTHUR"]
      preliminaryNotes = preliminaryNotesObj.data.map(r => [r[0], r[4]]).filter(r => r[1] != "")

      mipsHTML = processProviderMIPS_(mipsDataObj, "Maruthur, Mario", "Maruthur, Mario")

      mipsFutureHtml = processFutureApptProviderMIPS_(mipsFutureApptObj, "Maruthur, Mario", "MARIO MARUTHUR")

      // let calendarDataObj = getCalendarData(calendarSS, "Dr_Maruthur_Calendar")
      // calendarData = calendarDataObj.calendarDataArray;
      // calendarColor = calendarDataObj.calendarColorArray;

      let teamThreeDaysVoiceMails = ss.getSheetByName("Voicemail_Metrics_3_Days").getRange("A7:D7").getDisplayValues()[0]
      personVoiceMailData.push(teamThreeDaysVoiceMails)


      providerDailyBillingData = providerDailyBillingSheet.getRange("I3:N").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
      providerMonthlyBillingData = providerMonthlyBillingSheet.getRange("F3:I").getDisplayValues().filter(row => row[1] != "" && row[1] != null)

      providerMonthlyBillingData = filteredMonthlyBillingData.filter(r => r[0].includes("MARIO MARUTHUR"))

      yearlyBilling = billCollectionObj.data.filter(r => r[1].includes("MARIO MARUTHUR"))

      providerFaxData = filteredFaxData.filter(r => r[1] == "Maruthur, Mario")


    }



    let personFilteredApptData = filteredApptData.filter(r => r[2] == apptProviders[i][0])


    let personBiopsyIndex = biopsyDataMenuHeaders.indexOf(apptProviders[i][0])

    let personBiopsyDataMenuData = [];
    try {
      biopsyDataMenuData.forEach(r => {
        personBiopsyDataMenuData.push([r[0], r[personBiopsyIndex]])
      })
    } catch (err) { }


    //let personFilteredDocData = filteredDocData.filter(r => r[0] == apptProviders[i][0])


    // let personFilteredBillingData = filteredBillingData.filter(r => r[1].toString().includes(apptProviders[i][0].split(",")[0].trim()) || r[1].toString().includes(apptProviders[i][0].split(",")[1].trim()))



    let providerHtmlTemplate = HtmlService.createTemplateFromFile('Daily Provider Email Template');

    providerHtmlTemplate.voiceMailHeaders = voiceMailHeaders;
    providerHtmlTemplate.voiceMailData = personVoiceMailData;


    providerHtmlTemplate.faxHeaders = faxHeaders;
    providerHtmlTemplate.faxData = providerFaxData;

    //faxHeaders, filteredFaxData
    // let providerFaxData = []


    providerHtmlTemplate.apptHeaders = apptHeaders;
    providerHtmlTemplate.apptData = personFilteredApptData;


    providerHtmlTemplate.biopsyDataMenuHeaders = ["", apptProviders[i][0]];
    providerHtmlTemplate.biopsyDataMenuData = personBiopsyDataMenuData;


    // providerHtmlTemplate.docHeaders = docHeaders;
    // providerHtmlTemplate.filteredDocData = personFilteredDocData;



    providerHtmlTemplate.billingHeaders = dailyBillingHeaders;
    providerHtmlTemplate.billingData = providerDailyBillingData;

    providerHtmlTemplate.monthlyBillingHeaders = monthlyFilteredBillingHeaders;
    providerHtmlTemplate.monthlyBillingData = providerMonthlyBillingData;



    providerHtmlTemplate.billCollectionHeaders = billCollectionObj.headers;
    providerHtmlTemplate.billCollectionData = yearlyBilling;

    let totalPreliminaryNotes = 0;
    preliminaryNotes.forEach(pn => {
      totalPreliminaryNotes += Number(pn[1])
    })
    providerHtmlTemplate.preliminaryNotesHeadings = preliminaryNotesHeaders;
    providerHtmlTemplate.preliminaryNotesData = preliminaryNotes;
    providerHtmlTemplate.totalPreliminaryNotes = totalPreliminaryNotes;


    //providerHtmlTemplate.calDatesArray = datesArray;
    // providerHtmlTemplate.calendarDataArray = calendarData;
    // providerHtmlTemplate.calendarColorArray = calendarColor;



    let personHtmlBody = providerHtmlTemplate.evaluate().getContent();

    try {

      let providerEmailRecipent = [apptProviders[i][1].toString().trim().replace(/\s/g, ''), "khenriquez@ssdspc.com"]
      GmailApp.sendEmail(providerEmailRecipent, apptProviders[i][0] + " SSD Daily Email Metrics", "", {
        htmlBody: personHtmlBody + mipsHTML + mipsFutureHtml,
        attachments: [file1, file2, file3, file4, file5, file6]
      })

      appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), apptProviders[i][0] + " SSD Daily Email Metrics", providerEmailRecipent.length, apptProviders[i][1]])

    } catch (emailError) {
      appendInEmailLog_([new Date(), new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(), apptProviders[i][0] + " SSD Daily Email Metrics", providerEmailRecipent.length, apptProviders[i][1], emailError])
    }


    //if (apptProviders[i][0] == "Lauren Miller") {
    // GmailApp.sendEmail("admin@ssdspc.com", apptProviders[i][0] + " SSD Daily Email Metrics", "", {
    //   htmlBody: personHtmlBody + mipsHTML + mipsFutureHtml,
    //   attachments: [file1, file2, file3, file4, file5, file6]
    // })

    //}


    // GmailApp.sendEmail("mm@ssdspc.com,rashid_khan143@yahoo.com", " SSD Daily Email Metrics", "", {
    //   htmlBody: personHtmlBody + mipsHTML + mipsFutureHtml,
    //   attachments: [file1, file2, file3, file4, file5, file6]
    // })

    // GmailApp.sendEmail("mm@ssdspc.com", apptProviders[i][0] + " SSD Daily Email Metrics", "", {
    //   htmlBody: personHtmlBody + mipsHTML + mipsFutureHtml,
    //   attachments: [file1, file2, file3, file4, file5, file6]
    // })



    // GmailApp.sendEmail("rashid_khan143@yahoo.com", apptProviders[i][0] + " SSD Daily Email Metrics", "", {
    //   htmlBody: personHtmlBody + mipsHTML + mipsFutureHtml
    // })


  }

}





// function testInvoicesData() {

//   let htmlTemplate = {}
//   Logger.log(processInvoicesDashboard_())

//   let invoicesData = processInvoicesDashboard_();

//   htmlTemplate.countHeaders = invoicesData.count.headers
//   htmlTemplate.countData = invoicesData.count.data

//   htmlTemplate.unpaidInvoicesHeaders = invoicesData.unpaidInvoices.headers
//   htmlTemplate.unpaidInvoicesData = invoicesData.unpaidInvoices.data

//   htmlTemplate.toBePaidHeaders = invoicesData.toBePaid.headers
//   htmlTemplate.toBePaidData = invoicesData.toBePaid.data

//   htmlTemplate.passedTobePaidHeaders = invoicesData.passedToBePaid.headers
//   htmlTemplate.passedTobePaidData = invoicesData.passedToBePaid.data

//   htmlTemplate.passedDueHeaders = invoicesData.passedDueDate.headers
//   htmlTemplate.passedDueData = invoicesData.passedDueDate.data

// }




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




function processInsuranceBillingDash_() {

  let insuranceSS = SpreadsheetApp.openById("1pAgnjSWGt5aFQwT525FKWScnk3GmKTm7_-ypeJ8g-aE")

  SpreadsheetApp.flush()
  let metricSheet = insuranceSS.getSheetByName("Email Metric")
  SpreadsheetApp.flush()

  let data = metricSheet.getRange("A1:G").getDisplayValues().filter(r => r[0] != "");

  let headers = data.splice(0, 1)[0]

  return { headings: headers, data: data }
}




function processInsurancePatientAR_() {

  let todayDay = new Date().getDay();

  let insuranceSS = SpreadsheetApp.openById("1kC5Jemgg3DadkndtxPWjwpR01kLRKaqZFDFGqJgNfjI")
  let insSheet = insuranceSS.getSheetByName("Daily Email Metrics")

  let insPatARData = insSheet.getRange("A2:O").getDisplayValues().filter(r => r[0] != "");

  let insPatARHeaders = insPatARData.splice(0, 1)[0]


  if (todayDay == 0 || todayDay == 6) return { headings: insPatARHeaders, data: [] }

  return { headings: insPatARHeaders, data: insPatARData }

}






function processPSDyearToDateBillingCollection_() {
  let SS = SpreadsheetApp.openById("1BGbjaoom9jBr3Z9LhAa8UQlzvH5XePVOfkpFPqkYhug")
  let sheet = SS.getSheetByName("Yearly by Provider and Location")

  let allData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues().map(r => [r[0], r[1], r[3], r[10]])


  let headers = allData.splice(0, 1)[0]

  let data = allData.filter(r => r[0] == new Date().getFullYear())


  let groupedData = {};
  const yearlyTotal = ["", "Total", 0, 0];
  // Loop through the array
  data.forEach(function (item) {
    let year = item[0];
    let key = item[1];
    let value1 = item[2];
    let value2 = item[3];

    yearlyTotal[0] = year
    yearlyTotal[2] += value1
    yearlyTotal[3] += value2

    if (groupedData[key]) {
      // If key already exists, add the values to the existing ones
      groupedData[key][1] += value1;
      groupedData[key][2] += value2;
    } else {
      // If key doesn't exist, create a new entry
      groupedData[key] = [year, value1, value2];
    }
  });



  let result = Object.keys(groupedData).map(function (key) {
    //if (groupedData[key][1] > 0) {
    return [groupedData[key][0], key, groupedData[key][1] == 0 ? "" : convertToCurrency_(groupedData[key][1]), groupedData[key][2] == 0 ? "" : convertToCurrency_(groupedData[key][2])];
    //}
  });


  result = result.filter(r => r[2] != "")



  result.sort((a, b) => {
    return (a[1] < b[1]) ? -1 : 1;
  });


  yearlyTotal[2] = convertToCurrency_(yearlyTotal[2])
  yearlyTotal[3] = convertToCurrency_(yearlyTotal[3])


  let billCollectionObj = {
    headers: headers,
    data: result,
    yearlyTotal: yearlyTotal
  }

  //Logger.log(billCollectionObj)

  return billCollectionObj

}



function convertToCurrency_(number) {
  if (typeof number !== 'number') {
    return 'Invalid input';
  }

  // Convert the number to a currency format
  let currencyFormat = "$" + number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return currencyFormat;
}



function processCancerPolicy_() {
  let SS = SpreadsheetApp.openById("1jq_jSyr0HFRu_zTDTou0XjHLaIcnjcDGMAM5eQYedP0")
  let sheet = SS.getSheetByName("Daily_Email_Metrics (Metrics)")

  let allData = sheet.getRange("A1:D").getDisplayValues().filter(r => r[0] != "")


  let headers = allData.splice(0, 1)[0]


  let cancelPolicyObj = {
    headers: headers,
    data: allData,
  }

  return cancelPolicyObj

}





function processCompletedMedicalRecords_() {
  let SS = SpreadsheetApp.openById("1eLSZlI7GxcEu3k8-OA8Opkjam1BgQZakArn1PkpA5Zs")
  let sheet = SS.getSheetByName("Daily_Email_Metrics")

  let allData = sheet.getRange("A1:D").getDisplayValues().filter(r => r[0] != "")

  let headers = allData.splice(0, 1)[0]


  let medicalRecordsObj = {
    headers: headers,
    data: allData,
  }

  return medicalRecordsObj

}










function appendInEmailLog_(row) {

  let ELSS = SpreadsheetApp.openById("1ERfXs1YB-huftv_rIQJfy2OhaziiQU3rEtM5vmHr0nE");
  let ELSheet = ELSS.getSheetByName("Sent Email Log");
  ELSheet.appendRow(row)

}



function getCalendarData(calendarSS, sheetName) {

  //let calendarSS = SpreadsheetApp.openById("1lX6rl_lPqSnx1wnmW0uYZt_RNkjsYcyJcnIpBlISuKE")



  let calendarSheet = calendarSS.getSheetByName(sheetName)
  calendarSheet.getRange("D1").setValue(new Date().getFullYear())
  let monthName = Utilities.formatDate(new Date(), "GMT-6", "MMMM")
  calendarSheet.getRange("E1").setValue(monthName)
  Utilities.sleep(1000);

  let firstMonthData = calendarSheet.getRange("D6:J22").getDisplayValues()
  let firstMonthColor = calendarSheet.getRange("D6:J22").getBackgrounds()




  let calendarObj = {}
  for (var i = 0; i < firstMonthData.length; i = i + 3) {
    for (var j = 0; j < firstMonthData[i].length; j++) {
      if (firstMonthData[i][j] > 0) {
        calendarObj[monthName + "-" + firstMonthData[i][j]] = firstMonthData[i + 1][j]
        calendarObj[monthName + "-" + firstMonthData[i][j] + "-Color"] = firstMonthColor[i + 1][j]
      }
    }
  }




  let nextMonthName = Utilities.formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1)), "GMT-6", "MMMM")
  let secondMonthData = calendarSheet.getRange("D28:J44").getDisplayValues()
  let secondMonthColor = calendarSheet.getRange("D28:J44").getBackgrounds()

  for (var i = 0; i < secondMonthData.length; i = i + 3) {
    for (var j = 0; j < secondMonthData[i].length; j++) {
      if (secondMonthData[i][j] > 0) {
        calendarObj[nextMonthName + "-" + secondMonthData[i][j]] = secondMonthData[i + 1][j]
        calendarObj[nextMonthName + "-" + secondMonthData[i][j] + "-Color"] = secondMonthColor[i + 1][j]
      }
    }
  }





  let monthDate = new Date();

  let calendarDataArray = [[], []];
  let calendarColorArray = [[], []]

  for (var i = 0; i < monthDate.getDay(); i++) {
    calendarDataArray[0].push("")
    calendarDataArray[1].push("")

    calendarColorArray[0].push('<td style="text-align:center;">')
    calendarColorArray[1].push('<td style="text-align:center;">')
  }


  let count = 0;
  for (var i = 0; i < 14; i++) {

    let formateMonthDate = Utilities.formatDate(monthDate, "GMT-6", "dd-MMM")
    calendarDataArray[count].push(formateMonthDate)
    calendarColorArray[count].push('<td style="text-align:center; background-color: ' + '#cfe2f3" >')

    let monthStr = Utilities.formatDate(monthDate, "GMT-6", "MMMM")
    calendarDataArray[count + 1].push(calendarObj[monthStr + "-" + monthDate.getDate()].toString().replace(/\n/g, "<br>"))
    calendarColorArray[count + 1].push('<td style="text-align:center; background-color: ' + calendarObj[monthStr + "-" + monthDate.getDate() + "-Color"] + '" >')

    if (i < 13) {
      if (monthDate.getDay() == 6) {
        count++
        count++
        calendarDataArray.push([])
        calendarDataArray.push([])

        calendarColorArray.push([])
        calendarColorArray.push([])
      }

      monthDate.setDate(monthDate.getDate() + 1)
    }
  }



  for (var i = monthDate.getDay() + 1; i <= 6; i++) {
    //datesArray[datesArray.length - 1].push("")
    calendarDataArray[calendarDataArray.length - 2].push("")
    calendarDataArray[calendarDataArray.length - 1].push("")

    calendarColorArray[calendarColorArray.length - 2].push('<td style="text-align:center;">')
    calendarColorArray[calendarColorArray.length - 1].push('<td style="text-align:center;">')
  }



  let calendarDataObj = {
    calendarColorArray: calendarColorArray,
    calendarDataArray: calendarDataArray,
  }

  return calendarDataObj
}











function processBiopsy_(ss) {

  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  let yesterDayDate = new Date(new Date().setDate(new Date().getDate() - 1));
  let yesterDayDateStr = Utilities.formatDate(yesterDayDate, 'GMT-6', 'yyyy/M/d');

  let beforeYesterDayDate = new Date(new Date().setDate(new Date().getDate() - 2));
  let beforeYesterDayDateStr = Utilities.formatDate(beforeYesterDayDate, 'GMT-6', 'yyyy/M/d');


  let biopsySheet = ss.getSheetByName("Biopsy_Metrics")
  monthName = Utilities.formatDate(new Date(), 'GMT-6', 'MMM')
  biopsySheet.getRange("B1:C1").setValues([[todayDate.getFullYear(), monthName]])
  SpreadsheetApp.flush();
  let biopsyData = biopsySheet.getRange("A4:B35").getValues();
  let biopsyDispData = biopsySheet.getRange("A4:B35").getDisplayValues();
  biopsyDispData.splice(0, 1)[0];
  let biopsyHeaders = biopsyData.splice(0, 1)[0];
  let filteredBiopsyData = []
  for (var i = 0; i < biopsyData.length; i++) {
    if (!isValidDate_(biopsyData[i][0])) {
      continue
    }
    let biopsyDateStr = Utilities.formatDate(biopsyData[i][0], 'GMT-6', 'yyyy/M/d');
    if (biopsyDateStr == todayDateStr || biopsyDateStr == yesterDayDateStr || biopsyDateStr == beforeYesterDayDateStr) {
      filteredBiopsyData.push(biopsyDispData[i])
    }
  }



  return [biopsyHeaders, filteredBiopsyData]

}







function processBillingProvider_(ss) {

  let providerDailyBillingSheet = ss.getSheetByName("Providers_Daily_Billing")

  let filteredBillingData = []
  let providerDailyBillingData = []

  providerDailyBillingData = providerDailyBillingSheet.getRange("BE3:BJ").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])


  providerDailyBillingData = providerDailyBillingSheet.getRange("AY3:BD").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])


  providerDailyBillingData = providerDailyBillingSheet.getRange("AS3:AX").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("AM3:AR").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("AG3:AL").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("O3:T").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("AA3:AF").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("U3:Z").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])

  providerDailyBillingData = providerDailyBillingSheet.getRange("I3:N").getDisplayValues().filter(row => row[1] != "" && row[1] != null).map(r => [r[0], r[5], r[1], r[2], r[3]])
  filteredBillingData = filteredBillingData.concat([...providerDailyBillingData])




  let billingHeaders = ["DATE", "DAY", "PROVIDER", "TOTAL BILLING", "BIOPSIES PERFORMED"];


  let providerMonthlyBillingSheet = ss.getSheetByName("Providers_Monthly_Billing")

  let newMonthlyData = providerMonthlyBillingSheet.getRange("G1:M").getDisplayValues();
  let totalNewMonthlyData = newMonthlyData.splice(0, 1)[0]
  let monthHeaders = newMonthlyData.splice(0, 1)[0].filter(r => r != "")
  let belowMonthHeaders = newMonthlyData.splice(0, 1)[0]
  newMonthlyData = newMonthlyData.filter(r => r[0] != "" && (r[1] != "" || r[3] != "" || r[5] != ""))


  //Logger.log(filteredBillingData)
  return [billingHeaders, filteredBillingData, monthHeaders, newMonthlyData, totalNewMonthlyData]

}


function testAppSheet() {
  let apptSS = SpreadsheetApp.openById("1NV3IeUoAqzbxRiMQun-LChYfLuZcsOnw2SN17N2rRzc");
  Logger.log("Yes")
  let oldNotesSheet = apptSS.getSheetByName("Future_Appt_Notes_Summary")
}





function processFutureApptNotesSumamry_(ss) {


  //let apptSS=SpreadsheetApp.openById("1NV3IeUoAqzbxRiMQun-LChYfLuZcsOnw2SN17N2rRzc")
  //let apptSS = SpreadsheetApp.openById("1NV3IeUoAqzbxRiMQun-LChYfLuZcsOnw2SN17N2rRzc");


  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  let tomorrowDate = new Date(new Date().setDate(new Date().getDate() + 1));
  let tomorrowDateStr = Utilities.formatDate(tomorrowDate, 'GMT-6', 'yyyy/M/d');

  let afterTomorrowDate = new Date(new Date().setDate(new Date().getDate() + 2));
  let afterTomorrowDateStr = Utilities.formatDate(afterTomorrowDate, 'GMT-6', 'yyyy/M/d');


  let oldNotesSheet = ss.getSheetByName("Future_Appt_Notes_Summary")
  let oldNotesDispData = oldNotesSheet.getRange(1, 1, oldNotesSheet.getLastRow(), 7).getDisplayValues();
  let oldNotesHeaders = oldNotesDispData.splice(0, 1)[0];



  let filteredOldNotesData = []
  for (var i = 0; i < oldNotesDispData.length; i++) {

    let notesDate
    try {
      notesDate = new Date(oldNotesDispData[i][0])
    } catch (err) { }

    if (!isValidDate_(notesDate)) {
      continue
    }

    let dateSplit = oldNotesDispData[i][0].split(", ")[1].toString().split("/")
    let notesDateStr = Utilities.formatDate(new Date(dateSplit[2], Number(dateSplit[0]) - 1, dateSplit[1]), 'GMT-6', 'yyyy/M/d');
    //let notesDateStr = Utilities.formatDate(notesDate, 'GMT-6', 'yyyy/M/d');
    if (notesDateStr == todayDateStr || notesDateStr == tomorrowDateStr || notesDateStr == afterTomorrowDateStr) {
      filteredOldNotesData.push(oldNotesDispData[i])
    }
  }


  return [oldNotesHeaders, filteredOldNotesData]

}





function processClinicNotesSummary_(ss) {

  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  let yesterDayDate = new Date(new Date().setDate(new Date().getDate() - 1));
  let yesterDayDateStr = Utilities.formatDate(yesterDayDate, 'GMT-6', 'yyyy/M/d');

  let beforeYesterDayDate = new Date(new Date().setDate(new Date().getDate() - 2));
  let beforeYesterDayDateStr = Utilities.formatDate(beforeYesterDayDate, 'GMT-6', 'yyyy/M/d');


  let notesSheet = ss.getSheetByName("Clinic_Notes_Summary");
  let notesData = notesSheet.getDataRange().getValues();
  let notesDispData = notesSheet.getDataRange().getDisplayValues();
  notesDispData.splice(0, 1)
  let notesHeaders = notesData.splice(0, 1)[0];
  notesHeaders[0] = "Appt. Date";
  notesHeaders[4] = "# of Clinic Appts Scheduled"

  let filteredNotesData = []
  for (var i = 0; i < notesData.length; i++) {
    if (!isValidDate_(notesData[i][0])) {
      continue
    }
    let notesDateStr = Utilities.formatDate(notesData[i][0], 'GMT-6', 'yyyy/M/d');
    if (notesDateStr == todayDateStr || notesDateStr == yesterDayDateStr || notesDateStr == beforeYesterDayDateStr) {
      filteredNotesData.push(notesDispData[i])
    }
  }

  return [notesHeaders, filteredNotesData]

}





function processDocumentToReview_(ss) {
  let docSheet = ss.getSheetByName("Documents_to_Review");
  let docData = docSheet.getDataRange().getValues();
  let docHeaders = docData.splice(0, 1)[0];
  let filteredDocData = docData.filter(row => row[1] == "Documents, Ready for Review")

  return [docHeaders, filteredDocData]
}




function processOutgoingReferralsMetrics_(ss) {
  let outRefSheet = ss.getSheetByName("Outgoing_Referrals");
  let outRefData = outRefSheet.getRange("A1:M").getDisplayValues().filter(r => r[0] != "");
  let outRefHeaders = outRefData.splice(0, 1)[0]

  return [outRefHeaders, outRefData]
}




function processIncommingRefMetrics_(ss) {

  let incommingReferralsSheet = ss.getSheetByName("Incoming_Referrals_Metrics");
  let incommingReferralsData = incommingReferralsSheet.getRange("A1:G").getDisplayValues().filter(r => r[0] != "");
  let incommingReferralsHeaders = incommingReferralsData.splice(0, 1)[0]


  let incommingReferralsMonthlyData = incommingReferralsSheet.getRange("I1:P").getDisplayValues().filter(r => r[0] != "");
  let incommingReferralsMonthlyHeaders = incommingReferralsMonthlyData.splice(0, 1)[0]




  return [incommingReferralsHeaders, incommingReferralsData, incommingReferralsMonthlyHeaders, incommingReferralsMonthlyData]
}








function processApptMetrics_(ss) {

  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  let tomorrowDate = new Date(new Date().setDate(new Date().getDate() + 1));
  let tomorrowDateStr = Utilities.formatDate(tomorrowDate, 'GMT-6', 'yyyy/M/d');

  let todayPlusTwo = new Date(new Date().setDate(new Date().getDate() + 2));
  let todayPlusTwoStr = Utilities.formatDate(todayPlusTwo, 'GMT-6', 'yyyy/M/d');

  let todayPlusThree = new Date(new Date().setDate(new Date().getDate() + 3));
  let todayPlusThreeStr = Utilities.formatDate(todayPlusThree, 'GMT-6', 'yyyy/M/d');

  let todayPlusFour = new Date(new Date().setDate(new Date().getDate() + 4));
  let todayPlusFourStr = Utilities.formatDate(todayPlusFour, 'GMT-6', 'yyyy/M/d');


  let apptSheet = ss.getSheetByName("Appt_Metrics");
  let apptData = apptSheet.getRange(1, 2, apptSheet.getLastRow(), apptSheet.getLastColumn() - 1).getValues();
  let apptDispData = apptSheet.getRange(2, 2, apptSheet.getLastRow() - 1, apptSheet.getLastColumn() - 1).getDisplayValues();
  let apptHeaders = apptData.splice(0, 1)[0];
  let filteredApptData = []
  for (var i = 0; i < apptData.length; i++) {
    if (!isValidDate_(apptData[i][0])) {
      continue
    }
    let apptDateStr = Utilities.formatDate(apptData[i][0], 'GMT-6', 'yyyy/M/d');
    if (apptDateStr == todayDateStr || apptDateStr == tomorrowDateStr || apptDateStr == todayPlusTwoStr || apptDateStr == todayPlusThreeStr || apptDateStr == todayPlusFourStr) {
      filteredApptData.push(apptDispData[i])
      filteredApptData[filteredApptData.length - 1].splice(16, 0, "")
    }
  }


  let ssdSurgerySS = SpreadsheetApp.openById("19PoqebmN3LiMe1bHz_4YtjSW38rbl7pUIx0sJ9CjtDE")
  let surgeryScheduleCountsSheet = ssdSurgerySS.getSheetByName("Surgery_Schedule_Counts")
  let surgeryScheData = surgeryScheduleCountsSheet.getRange(1, 1, surgeryScheduleCountsSheet.getLastRow(), surgeryScheduleCountsSheet.getLastColumn()).getValues();


  for (let i = 0; i < filteredApptData.length; i++) {
    try {
      let apptDateStr = Utilities.formatDate(new Date(filteredApptData[i][0]), 'GMT-6', 'yyyy/M/d');

      surgeryScheData.forEach(r => {
        if (isValidDate_(r[1])) {
          let surgeryScheDateStr = Utilities.formatDate(r[1], 'GMT-6', 'yyyy/M/d');

          if (surgeryScheDateStr == apptDateStr && r[0] == filteredApptData[i][2] && r[2] == filteredApptData[i][3]) {
            filteredApptData[i][16] = r[5]
          }
        }
      })
    } catch (err) { }

  }



  apptHeaders.splice(16, 0, "Total Sites")


  return [apptHeaders, filteredApptData]
}






function processWebsiteMetrics_(ss) {

  let todayDate = new Date();
  let todayDateStr = Utilities.formatDate(todayDate, 'GMT-6', 'yyyy/M/d');

  //Logger.log(todayDateStr)
  let yesterDayDate = new Date(new Date().setDate(new Date().getDate() - 1));
  //Logger.log(yesterDayDate)
  let yesterDayDateStr = Utilities.formatDate(yesterDayDate, 'GMT-6', 'yyyy/M/d');

  let beforeYesterDayDate = new Date(new Date().setDate(new Date().getDate() - 2));
  let beforeYesterDayDateStr = Utilities.formatDate(beforeYesterDayDate, 'GMT-6', 'yyyy/M/d');

  let websiteDataSheet = ss.getSheetByName("Website_Metrics");
  let monthName = Utilities.formatDate(new Date(), 'GMT-6', 'MMM')
  websiteDataSheet.getRange("B1:C1").setValues([[todayDate.getFullYear(), monthName]])
  SpreadsheetApp.flush();
  let websiteData = websiteDataSheet.getRange(5, 1, websiteDataSheet.getLastRow() - 4, websiteDataSheet.getLastColumn()).getValues();
  let websiteDispData = websiteDataSheet.getRange(5, 1, websiteDataSheet.getLastRow() - 4, websiteDataSheet.getLastColumn()).getDisplayValues();
  let filteredWebsiteData = []
  for (var i = 0; i < websiteData.length; i++) {
    if (!isValidDate_(websiteData[i][0])) {
      continue
    }
    let websiteDateStr = Utilities.formatDate(websiteData[i][0], 'GMT-6', 'yyyy/M/d');
    if (websiteDateStr == todayDateStr || websiteDateStr == yesterDayDateStr || websiteDateStr == beforeYesterDayDateStr) {
      filteredWebsiteData.push(websiteDispData[i])
    }
  }


  let websiteMonthlySheet = ss.getSheetByName("Website_Metrics_Monthly");
  let websiteMonthlyData = websiteMonthlySheet.getRange("A5:I5").getDisplayValues()

  return [filteredWebsiteData, websiteMonthlyData]
}







function processFaxMetrics_(ss) {
  let faxSheet = ss.getSheetByName("Fax_Metrics");
  let faxData = faxSheet.getDataRange().getValues();
  let filteredFaxData = faxData.filter(row => row[0] != "" || row[1] != "")
  let faxHeaders = filteredFaxData.splice(0, 1)[0];

  let faxMonthlySheet = ss.getSheetByName("Fax_Metrics_Monthly");
  let faxMonthlyData = faxMonthlySheet.getRange("A2:D").getValues();
  let filteredFaxMonthlyData = faxMonthlyData.filter(row => row[0] != "" || row[1] != "")
  //let faxHeaders = filteredFaxData.splice(0, 1)[0];


  return [faxHeaders, filteredFaxData, filteredFaxMonthlyData]
}





function processRepeatCallsWeek_(ss) {
  let sheet = ss.getSheetByName("Repeat_Calls_Week");
  let data = sheet.getDataRange().getDisplayValues();
  let filteredData = data.filter(row => row[3] != "" || row[4] != "")
  let dataHeaders = filteredData.splice(0, 1)[0];

  return [dataHeaders, filteredData]
}








function processRepeatCallsToday_(ss) {
  let sheet = ss.getSheetByName("Repeat_Calls_Today");
  let data = sheet.getDataRange().getDisplayValues();
  let filteredData = data.filter(row => row[0] != "" || row[1] != "")
  let dataHeaders = filteredData.splice(0, 1)[0];

  return [dataHeaders, filteredData]
}


function processVoiceMailData_(ss) {
  let voiceMailSheet = ss.getSheetByName("Voicemail_Metrics_Today");
  let voiceMailData = voiceMailSheet.getDataRange().getValues();
  let filteredVoiceMailData = voiceMailData.filter(row => row[0] != "" || row[1] != "")
  let voiceMailHeaders = filteredVoiceMailData.splice(0, 1)[0];

  filteredVoiceMailData = filteredVoiceMailData.filter(r => r[2] > 0 || r[3] > 0)

  let voiceMail3Days = ss.getSheetByName("Voicemail_Metrics_3_Days")
  let voiceMail3DaysData = voiceMail3Days.getRange("A2:D2").getValues()


  let voiceMailMonthly = ss.getSheetByName("Voicemail_Metrics_Monthly")
  let voiceMailMonthlyData = voiceMailMonthly.getRange("A2:D").getValues();
  let filteredVoiceMailMonthlyData = voiceMailMonthlyData.filter(row => row[0] != "" || row[1] != "")
  //let voiceMailHeaders = filteredVoiceMailMonthlyData.splice(0, 1)[0];


  return [voiceMailHeaders, filteredVoiceMailData, voiceMail3DaysData, filteredVoiceMailMonthlyData]
}




function processPTOrequests_(ss) {

  let ptoSheet = ss.getSheetByName("PTO Request");
  let ptoData = ptoSheet.getRange("H1:M6").getDisplayValues();

  let ptoHeaders = ptoData.splice(0, 1)[0]
  let ptoTotals = ptoData.splice(ptoData.length - 1, 1)[0]

  return [ptoHeaders, ptoData, ptoTotals]
}



function processPTOrequestsList_(ss) {

  let ptoSheet = ss.getSheetByName("PTO Request");
  let ptoData = ptoSheet.getRange(1, 1, ptoSheet.getLastRow(), 6).getDisplayValues().filter(r => r[0] != "");

  let ptoHeaders = ptoData.splice(0, 1)[0]


  let pending = ptoData.filter(r => r[2] == "Pending")
  let cancelled = ptoData.filter(r => r[2] == "Canceled")
  let approved = ptoData.filter(r => r[2] == "Approved")

  let ptoListObj = {
    headers: ptoHeaders,
    pending: pending,
    cancelled: cancelled,
    approved: approved,
  }

  return ptoListObj
}









//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}








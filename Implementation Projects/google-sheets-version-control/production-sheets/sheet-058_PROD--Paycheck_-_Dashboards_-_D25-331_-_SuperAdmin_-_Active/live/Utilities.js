


// const CLIENT_ID ="8e1f5b59f24b535ad5cf"
// const CLIENT_SECRET ="1ZsuHZy2YjM1gUwWJnJuJChNgVbiHBKn9uKymRLwDzI"
// const SUBSCRIPTION_KEY ="961d57041b7240dbba759bdb35d44591"
// const SCOPE = "f0832cad9a06f011aaa7002248909106"



// const CLIENT_ID ="d95209226d62054fa853"
// const CLIENT_SECRET ="xhIP/3YJRWeH/2imRyhNpY14tSffNPAOrUvGqxv/Tss"
// const SUBSCRIPTION_KEY ="6aaad6647f46435c87c7205c1cf1d499"
// const SCOPE = "d42379499006f011aaa7002248909106"



const CLIENT_ID = "7549ecde9093df7f9970"
const CLIENT_SECRET = "Xj1XCy5cnwy4/7CdNO1Z3zU9q4YWwU2vTyol48Rf0"
const SUBSCRIPTION_KEY = "596a91795cf3460dacb36519e7bc1759"
const SCOPE = "bd9b2d308e06f011aaa7002248909106"






const CODE_CHALLENGE = "7a937ae89a67a8f415c6ef166be268c7e03e34da941ee1babc61c9990629179f"
const CODE_VERIFIER = "CA1d7NlwyPsKNbx~SCnBy-yqx98vJsh8AHA_NNsP.fHTJGlgtrKWVcvBGmVyaJ6HVhWOTQkTmX7v~RxHipdY.PdB3fntH3kfWFnESobpPsXQ23Z.6_.gl7IP_zVyIN-n"



const API_DETAILS_SHEET = "API_Details"

const EMPLOYEE_HOURS_SHEET = "Paycor_Employee_Hours"

const TIME_OFF_REQUEST_SHEET = "Time_Off_Requests"

const BALANCE_HOURS_SHEET = "Balance_Hours"


const ALL_BALANCE_HOURS_SHEET = "All_Balance_Hours"




const OUTPUT_FOLDER_ID = "1bh1Qh5lJni8Pwwt6NvUNQjHiVOHR5tTp"






//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}


function createTimeTrigger() {
  ScriptApp.newTrigger("getEmployeeHours")
    .timeBased()
    .everyDays(1)
    .atHour(4)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}


function createBalanceTimeTrigger() {
  ScriptApp.newTrigger("balanceHoursProcess")
    .timeBased()
    .everyHours(2)
    .create()
}



function createAllBalanceHoursProcessTrigger() {
  ScriptApp.newTrigger("getAllBalanceHoursProcess")
    .timeBased()
    .everyWeeks(2)
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(17)
    .nearMinute(30)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}



function createPaycheckTrigger() {
  ScriptApp.newTrigger("invoiceProcessMain")
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(18)
    .nearMinute(0)
    .inTimezone(Session.getScriptTimeZone())
    .create()
}
















function getSheetByID_(ss, sheetID) {
  let allSheets = ss.getSheets();

  return allSheets.filter(s => s.getSheetId().toString() == sheetID)[0]
}














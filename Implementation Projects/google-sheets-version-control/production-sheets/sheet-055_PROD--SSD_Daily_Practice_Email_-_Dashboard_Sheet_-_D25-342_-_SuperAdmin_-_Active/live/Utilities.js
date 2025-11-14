
//below function will return true if the arg is valid date and false if not.
function isValidDate_(d) {
  if (Object.prototype.toString.call(d) !== "[object Date]")
    return false;
  return !isNaN(d.getTime());
}


// function createDailyTrigger() {

//   deleteDailyTrigger();

//   ScriptApp.newTrigger("getTwoDaysAppointments_Data")
//     .timeBased()
//     .everyDays(1)
//     .atHour(1)
//     .nearMinute(0)
//     .create();

// }


// function deleteDailyTrigger() {
//   // Loop over all triggers.
//   const allTriggers = ScriptApp.getProjectTriggers();
//   for (let index = 0; index < allTriggers.length; index++) {
//     // If the current trigger is the correct one, delete it.
//     if (allTriggers[index].getHandlerFunction() === "getTwoDaysAppointments_Data") {
//       ScriptApp.deleteTrigger(allTriggers[index]);

//     }
//   }
// }



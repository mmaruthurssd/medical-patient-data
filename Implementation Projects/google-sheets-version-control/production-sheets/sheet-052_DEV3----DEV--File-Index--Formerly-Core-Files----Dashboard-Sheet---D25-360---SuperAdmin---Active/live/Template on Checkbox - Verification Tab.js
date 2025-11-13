function onEdit1(e) {
  var sheet = e.source.getSheetByName("Verification Sheet (Rodrigo's Usage)");
  var range = e.range;
  
  
  if (range.getColumn() == 4 && sheet.getName() == "Verification Sheet (Rodrigo's Usage)") {
    var row = range.getRow();
    var timestampCell = sheet.getRange(row, 5); // Column E (timestamp column)
    
    // Check if the checkbox was checked (TRUE)
    if (e.value == "TRUE") {
      timestampCell.setValue(new Date()); // Sets the current timestamp
    } else {
      timestampCell.setValue(""); // Clears the timestamp if checkbox is unchecked
    }
  }
}

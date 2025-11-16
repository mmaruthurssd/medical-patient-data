function renameFilesAllSSD() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const values = sheet.getRange("B2:B" + sheet.getLastRow()).getValues();

  values.forEach((row, index) => {
    const input = row[0];
    if (!input) return;

    try {
      // Extract file ID from URL or use as is
      const match = input.match(/[-\w]{25,}/);
      if (!match) throw new Error("Invalid ID or URL");

      const fileId = match[0];
      const file = DriveApp.getFileById(fileId);
      let fileName = file.getName();

      // Remove "All SSD - " (case-insensitive) and " - Active"
      fileName = fileName.replace(/all\s*ssd\s*-\s*/i, '');
      fileName = fileName.replace(/\s*-\s*Active$/i, '');

      // Append "All SSD - Active"
      const newName = fileName.trim() + " - All SSD - Active";

      file.setName(newName);

      Logger.log(`Row ${index + 2}: Renamed to "${newName}"`);
    } catch (error) {
      Logger.log(`Row ${index + 2}: Error with "${input}" - ${error.message}`);
    }
  });
}


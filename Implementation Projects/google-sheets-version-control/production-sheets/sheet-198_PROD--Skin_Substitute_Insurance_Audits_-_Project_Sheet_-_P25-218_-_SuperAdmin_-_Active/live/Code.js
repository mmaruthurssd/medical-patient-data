function listAndRenameFilesInFolder() {
  const folderId = '1jycT4qrFSFnHZ6KyNEDfFACeEQg3VWCY'; // Replace with your folder ID
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const renamedFilesLog = [];

  while (files.hasNext()) {
    const file = files.next();
    const oldName = file.getName();

    // Match and remove leading digits and '#' from filenames like '1 # something.pdf'
    const newName = oldName.replace(/^\d+\s*#\s*/, '');

    if (newName !== oldName) {
      file.setName(newName);
      renamedFilesLog.push(`Renamed: "${oldName}" → "${newName}"`);
    }
  }

  Logger.log("Renaming complete. Log:");
  renamedFilesLog.forEach(log => Logger.log(log));
}

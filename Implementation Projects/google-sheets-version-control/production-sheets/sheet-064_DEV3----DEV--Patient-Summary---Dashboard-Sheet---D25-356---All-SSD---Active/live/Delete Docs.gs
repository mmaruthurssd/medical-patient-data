
function deleteDocs_(NotesToDelete) {
  NotesToDelete.forEach(NoteId => {
    DriveApp.getFileById(NoteId).setTrashed(true);
  });
}




function onEditInstall(e) {

  let ss = e.source;
  let sheet = ss.getActiveSheet();

  if (sheet.getSheetId() != 80392462 && sheet.getSheetId() != 1834190191 && sheet.getSheetId() != 1385710772 && sheet.getSheetId() != 2083308314) return

  let range = e.range;
  let col = range.getColumn();
  let row = range.getRow();

  if (col == 10 || col == 16) {
    let rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (rowData[9] == 'APPLIED' && rowData[15] == 'YES') {

      let protectionRange = sheet.getRange(row, 1, 1, sheet.getLastColumn())
      const me = Session.getEffectiveUser().getEmail().toString().toLowerCase().trim()

      const protection = protectionRange.protect()
      protection.getEditors().forEach(user => {
        if (user.getEmail().toString().toLowerCase().trim() != me) {

          try {
            protection.removeEditor(user.getEmail())
          } catch (err) { }
        }
      })
      protection.addEditor(me)
      protection.addEditor("rkhan@ssdspc.com")
    }
  }

}




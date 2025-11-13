
function copyFilesFromOneFolderToAnother() {
  
  const SourceFolderId = '1zplfBvIEteb7b-ushtHuQUUtLDsFjJ6t';
  const DestinationFolderId = '1L2JGR-eoUtpVoGqt8rudQFtx-R_5RJ2S';
  
  const SourceFolder = DriveApp.getFolderById(SourceFolderId);
  const DestinationFolder = DriveApp.getFolderById(DestinationFolderId);

  const AllFiles = SourceFolder.getFiles();

  const TimeLimit = 1500; //25 minutes = 1500 seconds
  const StartTime = new Date().getTime() / 1000;
  let isTimeLimitReached = false;

  if (AllFiles.hasNext()) {

    console.log('copying files to destination folder ...');

    while (AllFiles.hasNext() && isTimeLimitReached === false) {
      const CurrentFile = AllFiles.next();
      
      console.log('copying file ' + CurrentFile.getName());
      
      CurrentFile.makeCopy(DestinationFolder);

      const CurrentTime = new Date().getTime() / 1000;
    
      if (CurrentTime - StartTime >= TimeLimit)
        isTimeLimitReached = true;
    }
  }
  else {
    console.log('no files were found to be copied ...');
  }

}



// test script by Andrea
function createBulkPDFs() {
const docFile = DriveApp.getFileById ("1qsixAV_NdXl2ihXJeAQW2FWpeeqeyTMEi-Zid6yYA3A");
const tempFolder = DriveApp.getFolderById ("1w_bnR_-Jydu8_XIAei7J5hRKa-VVLA5L");
const pdfFolder = DriveApp.getFolderById ("1Mm33sju1At5aiBbSgsQ4S5NCd8wfrAir");

const data = currentSheet.getRange(2,1,currentSheet.getLastRow()-1,4).getDisplayValues();

let errors = [];
data.forEach(row => {
       try{
        createPDF(row[0],row[1],row[3],row[0],+ " " + row[1],docFile,tempFolder,pdfFolder);
        errors.push([""])
       } catch(err){
        errors.push(["failed"]);
       }
      
}); //close forEach
      
  
}
 

function testing_() {
  const FileName = 'ADAIR_STE_230622_45635_1799924.pdf';
  const FileNameSplit = FileName.replace('.pdf', '').split('_').slice(0,-1);
  const PatientId = FileNameSplit.slice(-1, )[0];
  const PatientName = FileNameSplit.slice(0, -2).join(' ');
  const BiopsyDateSplit = FileNameSplit[FileNameSplit.length - 2].split('');
  const BiopsyYear = '20' + BiopsyDateSplit.slice(0,2).join('');
  const BiopsyMonth = BiopsyDateSplit.slice(2,4).join('');
  const BiopsyDay = BiopsyDateSplit.slice(4,).join('');
  const BiopsyDate = BiopsyMonth + '/' + BiopsyDay + '/' + BiopsyYear;
  console.log(PatientId, PatientName, BiopsyDate);
}


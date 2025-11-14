// IMPORTRANGE("https://docs.google.com/spreadsheets/d/1VH7MUFjLorfLCGNTz0b_fcsMlOutHpv0DwGW1dz5fso/edit#gid=1240735971", "Referral_Form!B2:z1000")


function getReferralFormData() {

  const SearchQuery = 'in:inbox label:unread subject:(submission from refer patient)';
  const Threads = GmailApp.search(SearchQuery,0,100);

  if (Threads.length > 0) {
    
    Threads.forEach(Thread => {
      const Messages = Thread.getMessages();

      Messages.forEach(Message => {
        const MsgId = Message.getId();
        const MsgIds = getMsgIds_();
        
        if (MsgIds.indexOf(MsgId) === -1 && Message.isUnread()) {
          
          const MsgDate = Message.getDate();
          const MsgBody = Message.getPlainBody();
          
          addReferralData_(MsgBody, MsgDate);
          addMsgId_(MsgId);
            
        }

        Message.markRead();

      });

    });    

    sortData_('Referral_Form');

  }

}

function addReferralData_(MsgBody, MsgDate) {

  const ReferralDataSheet = SpreadsheetApp.getActive().getSheetByName('Referral_Form');

  const DateValue = Utilities.formatDate(new Date(MsgDate),'GMT-06:00','M/dd/yyyy');
  const TimeValue = Utilities.formatDate(new Date(MsgDate),'GMT-06:00','H:mm:ss a');

  const DataArray = MsgBody.split('\n').map(row => row.trim()).filter(row => row !== '');
  DataArray.splice(0,1);

  const DataObj = {'*Patient Name*': '', '*Patient Phone*': '', '*Referrer point of contact*': '',
                   '*Referring provider*': '', '*Referring practice*': '',
                   '*Referring practice phone*': '', '*Message*': ''};

  let fieldName = '';
  let fieldValue = '';

  DataArray.forEach(row => {
    if (row.includes('*')) {
      fieldName = row
      fieldValue = '';
    }
    else {
      fieldValue = fieldValue === ''? row : fieldValue + '\n' + row;
      DataObj[fieldName] = fieldValue;
    }    
  });

  const DataValues = [];

  DataValues.push(DateValue);
  DataValues.push(TimeValue);

  for (let key in DataObj) {
    DataValues.push(DataObj[key])
  }

  // console.log(dataValues);
  ReferralDataSheet.appendRow(DataValues);

}

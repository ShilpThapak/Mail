document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#body-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('form').onsubmit = function(){
    console.log('click working!');
    

    var recipients = document.querySelector('#compose-recipients').value;
    var body = document.querySelector('#compose-body').value;
    var subject = document.querySelector('#compose-subject').value;


    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body:  body
      })
    })
    .then(response => {
      console.log(response);
      return response.json()
    })
    .then(result => {
        // Print result
        console.log(result);
        console.log(response);
    })
    .catch(error => {
      console.log('Error:', error);
    });
    load_mailbox('sent');
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#body-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => emaillist(email, mailbox));
  });
}

function emaillist(email, mailbox){
  var divgrid = document.createElement('div');
  var divone = document.createElement('div');
  var divtwo = document.createElement('div');
  var divthree = document.createElement('div');
  divone.id = 'divrow';
  divtwo.id = 'divrow';
  divthree.id = 'divrow';
  divgrid.id= 'divgrid';
  divone.innerHTML = email.sender;
  divtwo.innerHTML = email.subject;
  divthree.innerHTML = email.timestamp;
  var olddiv = document.querySelector('#emails-view');
  olddiv.append(divgrid);
  divgrid.append(divone);
  divgrid.append(divtwo);
  divgrid.append(divthree);

  if(email.read == true){
    //divgrid.style.backgroundColor = "rgba(242,245,245,0.8)";
    divgrid.style.backgroundColor = "#bfbfbf";
  }

  divgrid.addEventListener('click', function(){
    loadbody(email, mailbox);
  });
}

function loadbody(email, mailbox){
  
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#body-view').style.display = 'block';

  if (mailbox == "sent"){
    document.querySelector('#archivebtn').style.display='none';
  }
  else if(mailbox == "inbox"){
    document.querySelector('#archivebtn').style.display='block';
    document.querySelector('#archivebtn').innerHTML="Archive";
  }
  else if(mailbox == "archive"){
    document.querySelector('#archivebtn').style.display='block';
    document.querySelector('#archivebtn').innerHTML="Unarchive";
  }
  

  document.querySelector('#body-heading').innerHTML = `Subject: ${email.subject}`;
  document.querySelector('#body-divone').innerHTML = `Sender: ${email.sender}`;
  document.querySelector('#body-divtwo').innerHTML = `Time: ${email.timestamp}`;
  document.querySelector('#body-body').innerHTML = email.body;
  
  var recipientsdiv = document.querySelector('#body-recipients');
  recipientsdiv.innerHTML = "";
  var ul = document.createElement('ul');
  recipientsdiv.append(ul);
  ul.id="recipientlist";
  var recipients = email.recipients;

  for (var i=0; i<recipients.length; i++){
    var recipient = recipients[i];
    var li = document.createElement('li');
    li.innerHTML = `Recipient(${i+1}): ${recipient}`;
    ul.append(li);
  }
  
  if (mailbox == "inbox"){
    console.log("archive option is here");
    document.querySelector('#archivebtn').onclick = function(){
      console.log('archive button clicked');
      
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })   
      load_mailbox('inbox');
    };
  }

  if (mailbox == "archive"){
    console.log("archive option is here");
    archivebtn = document.querySelector('#archivebtn');
    archivebtn.innerHTML = 'Unarchive';
    archivebtn.onclick = function(){
      console.log('archive button clicked');
      
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })   
      load_mailbox('inbox');
    };
  }


  
  replybtn = document.querySelector('#replybtn');
  replybtn.addEventListener('click', function(){
   reply_email(email);
  });
}

function reply_email(email){
  console.log("reply btn clicked", email);

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#body-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
 
  var subject = email.subject;
  if(subject[0]=='R' && subject[1]=='e' && subject[2]==':'){
    console.log('its a reply email');
    document.querySelector('#compose-subject').value = email.subject;
  }
  else{
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }


  document.querySelector('form').onsubmit = function(){

    var recipients = document.querySelector('#compose-recipients').value;
    var body = document.querySelector('#compose-body').value;
    var subject = document.querySelector('#compose-subject').value;


    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body:  body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });

    load_mailbox('sent');
    return false;
  }
}


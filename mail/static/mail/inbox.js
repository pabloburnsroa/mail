document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
 
});

// Compose email function
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // "Listen" for form to be submitted when sending email and declare a function send_email
  document.querySelector('#compose-form').onsubmit = () => {
  
  // Capture the information submitted
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // POST request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      subject: subject,
      body: body,
      read: false 
    })
  })
  
  .then(response => response.json())
  .then(result => {
    
    // Print result to console
    console.log(result);
    
    // Load the sent mailbox
    load_mailbox('sent');
    });
  
    // Prevent default submission
  return false;
  };
}

// Load mailbox function
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      emailDiv.id = 'email-container';
      emailDiv.style.borderStyle = 'solid';
      emailDiv.style.borderWidth = '0.1rem';
      emailDiv.style.padding = '5px';
      // Add the contents of the email using .innerHTML
      emailDiv.innerHTML = `
        <span style="width: 240px; display: inline-block">${email.sender}</span>
        <span>${email.subject}</span> 
        <span style="float: right; font">${email.timestamp}</span>`
      // addEventListener to open email once clicked
      emailDiv.addEventListener('click', function() {
        fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(email => {
            // Set email to read if not read
            if (!email.read) {
              fetch(`/emails/${email.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    read: true
                  })
              })
            }
            // Load the email (go to loadEmail function)
            loadEmail(email)
        });
      });
      // Change background color if the email has been read (clicked)
      // White if unread, grey if read
      emailDiv.style.backgroundColor = 'white';
      if (email.read) {
        emailDiv.style.backgroundColor = 'grey';
      }
      document.querySelector('#emails-view').append(emailDiv)
    })
  });
}

// Open the email details when the email is clicked
function loadEmail(email) {
  // Change view 
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  
  document.querySelector('#email-view').innerHTML = `
  <span style="font-weight: bold">From: </span>${email["sender"]}<br>
  <span style="font-weight: bold">To: </span>${email["recipients"]}<br>
  <span style="font-weight: bold">Subject: </span>${email["subject"]}<br>
  <span style="font-weight: bold">Timestamp: </span>${email["timestamp"]}<br>
  <div class="email-buttons row">
    <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
    <button class="btn btn-sm btn-outline-primary" id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
  </div>
  <hr>
  ${email["body"]}
`;
}
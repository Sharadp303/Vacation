const { google } = require("googleapis");
const express = require("express");
require('dotenv').config()

const app = express();
app.use(express.json());

const oAuth2Client = new google.auth.OAuth2(
  process.env.Client_ID,
  process.env.Client_secret,
  process.env.redirect_uri
);


// Authorising User
app.get("/google/auth", (req, res) => {
  const authurl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });

  res.redirect(authurl);
});


app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  try {
    
	const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log("Authenticated to Gmail");

    setInterval(function (){
	 checkAndReplyTOEmails()}
	//Check for unread Messages in INBOX
	//Check whether the thread is already replied or not
	//IF NOT,Reply the thread and  Create Label for it
	,getIntervalTime())
	res.json({ message: "ENJOY YOUR VACATION" });
	

  } catch (err) {
    console.log("Authentication Error", err);
    res.status(500).json({ error: "Google Authenticaction Failed" });
  }
});

// For Random Interval between 45 to 120 seconds
function getIntervalTime(){
	return Math.floor(Math.random() * (120000 - 45000) + 45000)
   }

async function checkAndReplyTOEmails() {
	// Set up Gmail API
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const { data } = await gmail.users.getProfile({
    userId: "me",
  });
  // Getting Email adress of the Client
  const youremail = data.emailAddress;


	try {
		//Checking Unread messages in INBOX
		const response = await gmail.users.messages.list({
		  userId: "me",
		  labelIds: ["INBOX"],
		  q: "is:unread",
		});
	
		const messages = response.data.messages || [];
	
		for (const message of messages) {
		  // Check if the thread has prior replies by you
		  const threadMessages = await gmail.users.threads.get({
			userId: "me",
			id: message.threadId,
		  });
	
		  const firstMessage = threadMessages.data.messages[0];
		  const headers = firstMessage.payload.headers;
		  
		  const isReplied = headers.some(
			(header) => header.name === "From" && header.value.includes(youremail)
		  );
	
		  const senderEmail = headers.find(
			(header) => header.name === "Reply-To" || header.name === "From"
		  ).value;
	
		  //IF Email is not Replied 
		  if (!isReplied) {
			console.log("Sent a new Reply");
			const content ="Thank you for your email. I am currently on vacation and will get back to you as soon as possible.";
	
			const replyMessage =
			  `From: ${youremail}\r\n` +
			  `To: ${senderEmail}\r\n` +
			  `Subject: "Auto Reply" \r\n` +
			  `\r\n` +
			  `${content}`;
	
			const encodedMessage = Buffer.from(replyMessage).toString("base64");
	
			//Send the Message
			await gmail.users.messages.send({
			  userId: "me",
			  requestBody: {
				raw: encodedMessage,
			  },
			});
	
			//Add label and move this Email
			const newdata = await gmail.users.labels.list({
			  userId: "me",
			});
				
			const newlabel = newdata.data.labels;
				//Check the label is already Existed or not
			const matchingLabel = newlabel.find(
			  (label) => label.name == "Vacation"
			);
				//If not create a Label
			if (!matchingLabel) {
			  console.log("Not existed label");
			  await gmail.users.labels.create({
				userId: "me",
				requestBody: {
				  name: "Vacation",
				  labelListVisibility: "labelShow",
				  messageListVisibility: "show",
				},
			  });
			}
				//After Creating Label LabelId needed to move the in the Desired Label
			const labelID = await gmail.users.labels.list({
			  userId: "me",
			});
	
			const newlabelID = labelID.data.labels;
			const matchingLabelID = newlabelID.find(
			  (label) => label.name == "Vacation"
			);
				//Move the Email from INBOX to desired label
			await gmail.users.messages.modify({
			  userId: "me",
			  id: message.threadId,
			  requestBody: {
				addLabelIds: `${matchingLabelID.id}`,
				removeLabelIds: ["INBOX"],
			  },
			});
		  }
		}
	  } catch (err) {
		console.log(err);
	  }
  
  
}



app.listen(process.env.PORT||3000, () => {
  console.log(`http://localhost:${process.env.PORT}`);
});

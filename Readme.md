
## Features

- Checks for new emails in a given Gmail mailbox.
- Automatically sends replies to email threads that have no prior replies.
- Adds a label to the email and moves it to the labeled category in Gmail.
- Repeats the sequence of checking, replying, and labeling in random intervals between 45 to 120 seconds.

## Prerequisites

Before running the application, ensure you have the following prerequisites:

- Node.js (v12 or higher) installed on your machine.
- A Gmail account and access to the Gmail API. Follow the [Gmail API documentation](https://developers.google.com/gmail/api/quickstart) to enable the Gmail API and obtain the necessary credentials.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sharadp303/Vacation.git
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up the credentials:

   - There are four environment variables in it.(Client_ID,Client_secret,redirect_uri,PORT)
   - Place your Gmail API credentials obtained from the Google Developers Console into the `.env` file.

4. Start the application:

   ```bash
   npm start
   ```

   The application will start running on http://localhost:3000.

5. And the main URL to start the application is `http://localhost:3000/google/auth` 





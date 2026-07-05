# Gmail Auto-Forwarder

A Google Apps Script that automatically watches your Gmail inbox for new emails from a specific sender and forwards only the newest one to a list of email addresses. It never re-forwards an email it's already processed.

## How it works

- Runs on a schedule (every 1 minute) inside your Gmail account.
- Searches your inbox for unlabeled emails from a sender address you specify.
- Forwards **only the single most recent** matching email to your list of recipients.
- Labels every matching email it finds (including older ones) as `Forwarded` so it's never processed or forwarded again.

## Prerequisites

- A Gmail account (personal or Google Workspace).
- Access to [script.google.com](https://script.google.com) using that same Google account.

## Setup Instructions

### 1. Create the Apps Script project

1. Go to [script.google.com](https://script.google.com).
2. Click **New project**.
3. Rename the project (top left, click "Untitled project") to something like `Email Forwarder`.

### 2. Add the script code

1. Delete any placeholder code in the editor (`Code.gs`).
2. Paste in the following:

```javascript
function forwardNewEmails() {
  const SENDER = 'sender@example.com';
  const FORWARD_TO = 'email1@example.com,email2@example.com,email3@example.com,email4@example.com';
  const LABEL_NAME = 'Forwarded';

  let label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    label = GmailApp.createLabel(LABEL_NAME);
  }

  // Get all unlabeled threads from that sender, most recent first
  const threads = GmailApp.search(`from:${SENDER} in:inbox -label:${LABEL_NAME}`);

  if (threads.length === 0) {
    return; // nothing new
  }

  // Only forward the single most recent thread
  const newestThread = threads[0];
  const messages = newestThread.getMessages();
  const newestMessage = messages[messages.length - 1];

  if (newestMessage.getFrom().includes(SENDER)) {
    newestMessage.forward(FORWARD_TO);
  }

  // Label ALL matching threads so they're never re-processed or forwarded
  threads.forEach(thread => thread.addLabel(label));
}
```

3. Update the `SENDER` constant with the email address you want to watch for.
4. Update the `FORWARD_TO` constant with your real recipient addresses (comma-separated, no spaces needed).
5. Click the **Save** icon (or `Ctrl+S` / `Cmd+S`).

### 3. Authorize the script

1. In the toolbar, select `forwardNewEmails` from the function dropdown (next to **Run**).
2. Click **Run**.
3. Google will prompt you to authorize access — click **Review permissions**, choose your account, click **Advanced** (if shown), then **Go to Email Forwarder (unsafe)**, and **Allow**.
   - This warning is expected for personal scripts you write yourself — it's not a real security risk.
4. The script should run without errors. It won't forward anything yet unless you already have a matching email in your inbox.

### 4. Set up the trigger (automatic scheduling)

1. In the left sidebar of the Apps Script editor, click the **clock icon** (Triggers).
2. Click **+ Add Trigger** (bottom right).
3. Configure the trigger exactly as follows:
   | Setting | Value |
   |---|---|
   | Choose which function to run | `forwardNewEmails` |
   | Choose which deployment should run | `Head` |
   | Select event source | `Time-driven` |
   | Select type of time based trigger | `Minutes timer` |
   | Select minute interval | `Every minute` |
   | Failure notification settings | `Notify me daily` (recommended) |
4. Click **Save**.

That's it — the script will now check for new matching emails every minute and forward only new ones to your recipient list.

## Notes & Limitations

- **Quota usage:** Apps Script has daily quotas for Gmail reads and email sends, but for infrequent emails, this setup uses a negligible fraction of those limits.
- **Multiple recipients:** Forwarding to several addresses at once still only counts as a single "send" against your daily email quota.
- **Timing precision:** Time-driven triggers in Apps Script don't fire with exact precision — a "1 minute" trigger may occasionally run a little later.
- **First run behavior:** If there's already a matching email sitting in your inbox before you set this up, the first run will forward that one and mark any other existing matches as already-seen (they won't be forwarded).
- **Duplicate labels:** All processed emails get labeled `Forwarded` in Gmail. You can find them there if you want to review what's been forwarded.

## Troubleshooting

- **Nothing is being forwarded:** Check the label `Forwarded` in Gmail — if a matching email already has this label, it won't be forwarded again. Also confirm the `SENDER` address in the script exactly matches the sender's email.
- **Script errors on run:** Open the **Executions** tab (left sidebar, clock-adjacent icon) in the Apps Script editor to view error logs.
- **Want to stop forwarding:** Go to Triggers, and delete the trigger for `forwardNewEmails`.

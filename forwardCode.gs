function forwardEmails() {
  // Address the email is being sent from
  const SENDER = 'senderemail@gmail.com';
  //Address(es) the email is being sent to
  // Multiple emails can be inserted, separated by comma.
  // Ex. 'john@gmail.com,sarah@gmail.com,jack@gmail.com'
  const FORWARD_TO = 'example@gmail.com';
  const LABEL_NAME = 'Auto Forwarded Email';

  let label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    label = GmailApp.createLabel(LABEL_NAME);
  }

  // Get all unlabeled threads from that sender, most recent first (Gmail's default sort order)
  const threads = GmailApp.search(`from:${SENDER} in:inbox -label:${LABEL_NAME}`);

  if (threads.length === 0) {
    return; // nothing new
  }

  // Only forward the single most recent thread
  const newestThread = threads[0];
  const messages = newestThread.getMessages();
  const newestMessage = messages[messages.length - 1]; // last message in that thread

  if (newestMessage.getFrom().includes(SENDER)) {
    newestMessage.forward(FORWARD_TO);
  }

  // Label ALL matching threads (including older ones) so they're never re-processed or forwarded
  threads.forEach(thread => thread.addLabel(label));
}

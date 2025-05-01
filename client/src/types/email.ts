export interface Attachment {
  filename: string;
  contentType: string;
  content: string;
}

export interface Email {
  sender: string;
  to: string;
  cc: string;
  bcc: string;
  date: string;
  body: string;
  attachments: Attachment[];
}

export interface Thread {
  subject: string;
  emails: Email[];
}
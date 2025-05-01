const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { simpleParser } = require("mailparser");
const AdmZip = require("adm-zip");
const app = express();
// Multer handles multipart form uploads (file uploads)
const upload = multer({
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});

const SUBJECT_PREFIXES = ["re:", "fw:", "fwd:", "automatic reply:"];
function normalizeSubject(subject, attachments) {
  if (!subject || subject.trim() === "") return "(no subject)";
  let s = subject.trim();
  // Special handling for meeting invites with invite.ics
  const hasInviteIcs = (attachments || []).some((att) => att.filename && att.filename.toLowerCase() === "invite.ics");
  if (hasInviteIcs) {
    // Remove prefix up to and including first ':' (and any spaces after)
    const colonIdx = s.indexOf(":");
    if (colonIdx !== -1) {
      s = s.slice(colonIdx + 1).trim();
    }
    // Remove last string within parentheses (including the parentheses and any spaces before/after)
    s = s.replace(/\s*\([^)]*\)\s*$/, "").trim();
    return s || "(no subject)";
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of SUBJECT_PREFIXES) {
      if (s.toLowerCase().startsWith(prefix)) {
        s = s.slice(prefix.length).trim();
        changed = true;
      }
    }
  }
  return s || "(no subject)";
}

app.use(cors());

function splitMboxMessages(mboxBuffer) {
  const mboxStr = mboxBuffer.toString("utf8");
  // Split on lines that start with 'From ' (mbox delimiter)
  const rawMessages = mboxStr.split(/\n(?=From )/g);
  // Remove the initial 'From ' line from each message
  return rawMessages
    .map((msg) => {
      const firstNewline = msg.indexOf("\n");
      return firstNewline !== -1 ? msg.slice(firstNewline + 1) : msg;
    })
    .filter(Boolean);
}

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  let mboxBuffer = req.file.buffer;
  // Handle zip file: extract all .mbox files and merge their contents
  if (req.file.originalname.endsWith(".zip")) {
    try {
      const zip = new AdmZip(mboxBuffer);
      const mboxEntries = zip.getEntries().filter((e) => e.entryName.toLowerCase().endsWith(".mbox"));
      if (!mboxEntries.length) {
        return res.status(400).json({ error: "No .mbox file found in zip archive." });
      }
      // Concatenate all mbox file buffers
      mboxBuffer = Buffer.concat(mboxEntries.map((e) => e.getData()));
    } catch (err) {
      return res.status(400).json({ error: "Failed to extract zip: " + (err?.message || String(err)) });
    }
  }
  try {
    const messages = splitMboxMessages(mboxBuffer);
    const emails = [];
    for (const msg of messages) {
      try {
        const parsed = await simpleParser(msg);
        emails.push(parsed);
      } catch (e) {
        // Skip malformed messages, or optionally collect errors
      }
    }
    // Group emails by normalized subject
    const threads = {};
    for (const email of emails) {
      const subject = normalizeSubject(email.subject, email.attachments);
      if (!threads[subject]) threads[subject] = [];
      threads[subject].push(email);
    }
    // Prepare output
    const result = Object.entries(threads).map(([subject, thread]) => {
      // Sort thread by date ascending
      const sorted = thread.sort((a, b) => new Date(a.date) - new Date(b.date));
      const lastMessageDate = sorted[sorted.length - 1]?.date || null;
      const firstMessageDate = sorted[0]?.date || null;
      return {
        subject,
        lastMessageDate,
        firstMessageDate,
        emails: sorted.map((email) => ({
          sender: email.from?.text || "",
          to: email.to?.text || "",
          cc: email.cc?.text || "",
          bcc: email.bcc?.text || "",
          date: email.date,
          body: email.html || email.textAsHtml || email.text || "",
          attachments: (email.attachments || []).map((att) => ({
            filename: att.filename,
            contentType: att.contentType,
            content: att.content.toString("base64"),
          })),
        })),
      };
    });
    // Sort threads by most recent email in thread (descending)
    result.sort((a, b) => {
      const aDate = new Date(a.emails[a.emails.length - 1].date).getTime();
      const bDate = new Date(b.emails[b.emails.length - 1].date).getTime();
      return bDate - aDate;
    });
    res.json({ threads: result });
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

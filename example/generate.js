const fs = require("fs");
const path = require("path");
const subjects = ["Project Update", "Meeting Invitation", "Re: Project Update", "Fwd: Important Notice", "Lunch Plans"];
const senders = ["alice@example.com", "bob@example.com", "carol@example.com"];
const recipients = ["team@example.com", "devs@example.com", "managers@example.com"];

// Read the jpg and pdf files as base64
const jpgPath = path.join(__dirname, "July_night_sky_(35972569256).jpg");
const pdfPath = path.join(__dirname, "dummy.pdf");
const jpgBase64 = fs.existsSync(jpgPath) ? fs.readFileSync(jpgPath).toString("base64") : null;
const pdfBase64 = fs.existsSync(pdfPath) ? fs.readFileSync(pdfPath).toString("base64") : null;

let mbox = "";
for (let i = 1; i <= 100; i++) {
  const subj = subjects[i % subjects.length];
  const from = senders[i % senders.length];
  const to = recipients[i % recipients.length];
  const date = new Date(Date.now() - (100 - i) * 3600 * 1000).toUTCString();
  mbox += `From ${from} ${date}\n`;
  mbox += `Subject: ${subj}\n`;
  mbox += `From: ${from}\n`;
  mbox += `To: ${to}\n`;
  mbox += `Date: ${date}\n`;
  mbox += `Message-ID: <msg${i}@example.com>\n`;

  // Randomly embed the jpg inline (as a MIME part)
  const embedJpg = jpgBase64 && Math.random() < 0.2; // ~20% of emails
  // Randomly attach the pdf
  const attachPdf = pdfBase64 && Math.random() < 0.2; // ~20% of emails

  if (embedJpg || attachPdf) {
    mbox += `MIME-Version: 1.0\n`;
    mbox += `Content-Type: multipart/mixed; boundary="BOUNDARY${i}"\n\n`;
    mbox += `--BOUNDARY${i}\n`;
    mbox += `Content-Type: text/plain; charset="utf-8"\n\n`;
    let body = `This is the body of email #${i} with subject "${subj}".`;
    if (embedJpg) {
      body += `\n\nImage source: media/File:July_night_sky_(35972569256).jpg`;
    }
    if (attachPdf) {
      body += `\n\nAttachment source: https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
    }
    mbox += body + `\n\n`;
    if (embedJpg) {
      mbox += `--BOUNDARY${i}\n`;
      mbox += `Content-Type: image/jpeg; name="July_night_sky.jpg"\n`;
      mbox += `Content-Transfer-Encoding: base64\n`;
      mbox += `Content-Disposition: inline; filename="July_night_sky.jpg"\n\n`;
      mbox += jpgBase64.match(/.{1,76}/g).join("\n") + "\n\n";
    }
    if (attachPdf) {
      mbox += `--BOUNDARY${i}\n`;
      mbox += `Content-Type: application/pdf; name="dummy.pdf"\n`;
      mbox += `Content-Transfer-Encoding: base64\n`;
      mbox += `Content-Disposition: attachment; filename="dummy.pdf"\n\n`;
      mbox += pdfBase64.match(/.{1,76}/g).join("\n") + "\n\n";
    }
    mbox += `--BOUNDARY${i}--\n\n`;
  } else {
    mbox += `\nThis is the body of email #${i} with subject "${subj}".\n\n`;
  }
}

fs.writeFileSync("sample.mbox", mbox);
console.log("Sample mbox file generated: sample.mbox");

// Zip the mbox file using the zip command on Unix-like systems, keeping the original
const { execSync } = require("child_process");
try {
  execSync("zip -j sample.mbox.zip sample.mbox");
  console.log("Sample mbox file zipped: sample.mbox.zip");
} catch (err) {
  console.error(
    "Could not create sample.mbox.zip automatically. Are you usins a *nix machine? Please zip sample.mbox manually."
  );
}

// Remove all extended attributes from the mbox file (macOS only)
try {
  require("child_process").execSync("xattr -c sample.mbox.zip");
} catch (e) {
  // Ignore if not on macOS or xattr not available
}

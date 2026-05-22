const path = require("node:path");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.static(rootDir, {
  extensions: ["html"],
  setHeaders(res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
  },
}));

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validateAuditRequest(body) {
  const name = clean(body.name);
  const email = clean(body.email);
  const company = clean(body.company);
  const workflow = clean(body.workflow);

  if (!name || !email || !workflow) {
    return { error: "Please add your name, email, and workflow details." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (name.length > 120 || email.length > 180 || company.length > 180 || workflow.length > 3000) {
    return { error: "Please keep the form details shorter and try again." };
  }

  return { data: { name, email, company, workflow } };
}

function createTransporter() {
  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: Number(requiredEnv("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASSWORD"),
    },
  });
}

function buildEmail({ name, email, company, workflow }) {
  const fromName = process.env.SMTP_FROM_NAME || "Kapil Chauhan";
  const fromEmail = process.env.SMTP_FROM_EMAIL || requiredEnv("SMTP_USER");
  const toEmail = process.env.CONTACT_TO_EMAIL || fromEmail;
  const subject = `New AI Automation Audit request from ${name}`;

  const text = [
    "New AI Automation Audit request",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    "",
    "Workflow:",
    workflow,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #17201d; line-height: 1.55;">
      <h2 style="margin: 0 0 12px;">New AI Automation Audit request</h2>
      <table style="border-collapse: collapse; margin-bottom: 18px;">
        <tr><td style="padding: 6px 14px 6px 0; font-weight: 700;">Name</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 6px 14px 6px 0; font-weight: 700;">Email</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 6px 14px 6px 0; font-weight: 700;">Company</td><td>${escapeHtml(company || "Not provided")}</td></tr>
      </table>
      <h3 style="margin: 0 0 8px;">Workflow</h3>
      <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(workflow)}</p>
    </div>
  `;

  return {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    replyTo: email,
    subject,
    text,
    html,
  };
}

app.post("/api/audit-request", async (req, res) => {
  const validation = validateAuditRequest(req.body);

  if (validation.error) {
    res.status(400).json({ ok: false, message: validation.error });
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail(buildEmail(validation.data));
    res.json({ ok: true, message: "Thanks. Your audit request has been sent." });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({
      ok: false,
      message: "The form could not send right now. Please email Kapil directly.",
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.listen(port, () => {
  console.log(`Kapil AI automation funnel running at http://127.0.0.1:${port}`);
});

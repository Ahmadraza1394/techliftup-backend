// services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { LeadModel } from "../models/leadModel.js";

dotenv.config();

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer transporter verification failed:", error.message);
  } else {
    console.log("Nodemailer transporter is ready to send emails");
  }
});

export class EmailService {
  static async sendLeadNotificationEmail(name, email) {
    console.log(`Starting sendLeadNotificationEmail for ${name} (${email})...`);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "New Lead from TechLiftUp Chatbot",
      text: `A new user has started a chat session.\nName: ${name}\nEmail: ${email}\nTimestamp: ${new Date().toISOString()}`,
    };

    console.log("Mail options:", mailOptions);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `Lead notification email sent for ${name} (${email}): ${info.messageId}`
      );
      console.log("Email response:", info);
    } catch (error) {
      console.error(
        `Failed to send lead notification email for ${name} (${email}): ${error.message}`
      );
      console.error("Error details:", error);
      // Fallback to file storage
      await LeadModel.saveLeadToFile(name, email);
    }
  }

  static async sendTestEmail() {
    console.log("Sending test email...");
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Test Email from TechLiftUp Server",
      text: "This is a test email to verify Nodemailer configuration.",
    };

    console.log("Test email options:", mailOptions);

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Test email sent:", info);
      return `Test email sent: ${info.messageId}`;
    } catch (error) {
      console.error("Test email error:", error.message);
      console.error("Error details:", error);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }
}

// services/openaiService.js
import { OpenAI } from "openai";
import dotenv from "dotenv";
import { stripMarkdown } from "../utils/stripMarkdown.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIService {
  static async getChatResponse(messages, name, email) {
    const chatMessages = [
      {
        role: "system",
        content: `🤖 You are TechLiftUp AI Assistant, a professional and knowledgeable virtual assistant for TechLiftUp, a leading digital agency specializing in web development, app development, SEO, digital marketing, branding, AI solutions, and engineering services (only if relevant). Assist users with inquiries about TechLiftUp’s services, pricing, processes, and benefits. Provide concise (max 40 words), professional, and engaging responses. Guide users to schedule a meeting via https://calendly.com/ahmadraza13941394 for detailed discussions, or recommend the 'Contact Us' button in the navbar and don't say again and again about calendly only say when it needs most especially when conversation near to end. Do not answer unrelated queries. The user's name is ${name}, and their email is ${email}.`,
      },
      ...messages,
    ];

    console.log("Sending messages to OpenAI:", chatMessages);

    try {
      const completion = await openai.chat.completions.create({
        model: "ft:gpt-3.5-turbo-0125:personal::BE2K2d4p",
        messages: chatMessages,
        max_tokens: 60,
        temperature: 0.7,
      });

      let reply = completion.choices[0].message.content;
      reply = stripMarkdown(reply);
      console.log(`Response for ${name}: ${reply}`);
      return reply;
    } catch (error) {
      console.error(`OpenAI Error for ${name} (${email}): ${error.message}`);
      throw new Error(
        "Error communicating with OpenAI API. Please try again later."
      );
    }
  }
}

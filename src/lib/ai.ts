import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize SDKs
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Environment variable checks to dictate logic
const useAnthropic = !!process.env.ANTHROPIC_API_KEY;
const useOpenAI = !!process.env.OPENAI_API_KEY;
const isMock = !useAnthropic && !useOpenAI;

export async function getFinancialSummary(data: any) {
  const systemPrompt = "You are a strict, senior Indian financial mentor. Provide a short, highly professional, 3-4 sentence paragraph summarizing the user's financial health based strictly on the metrics provided. Do NOT output JSON. Do NOT do any calculations. Do NOT provide bullet points. Be direct, authoritative, and encouraging.";

  if (isMock) {
    console.log("Using Mock AI (Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY provided)");
    return "Based on your current numbers, you have established a foundational base but hold severe optimization gaps regarding tax-advantaged instruments and debt management. Your primary focus must aggressively pivot towards securing exactly 6 months of liquid emergency reserves while starting systematic SIPs. Strict adherence to the deterministic roadmap provided below will compound your wealth predictably toward your FIRE targets.";
  }

  try {
    const promptMessage = `User Data (Already scored and calculated. Explain the sentiment based on these insights):\n${JSON.stringify(data, null, 2)}`;
    
    // Priority logic: Prefer Anthropic > OpenAI
    if (useAnthropic) {
      console.log("Calling Anthropic Claude...");
      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: "user", content: promptMessage }]
      });
      
      // @ts-ignore
      return msg.content[0].text.trim();
      
    } else if (useOpenAI) {
      console.log("Calling OpenAI GPT...");
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: promptMessage }
        ]
      });
      
      return completion.choices[0].message.content?.trim() || "";
    }
    
  } catch (err) {
    console.error("AI API Error:", err);
    return "Your financial engine analysis is complete. Review the deterministic roadmap below to execute precise steps towards your goals.";
  }
}


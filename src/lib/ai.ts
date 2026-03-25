import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize SDKs (dummy keys prevent throwing instantly if omitted, allowing Graceful Mock fallback)
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

export async function getFinancialAdvice(data: any) {
  const systemPrompt = "You are an expert Indian financial advisor. Give practical, actionable, personalized advice. Use Indian financial instruments like SIP, PPF, NPS, FD, ELSS. Avoid generic advice.";
  
  const rules = `
Analyze the user's financial data and return a JSON object ONLY. Do not contain anything else outside the JSON object. Do not wrap it in markdown. Here is the expected format:
{
  "problems": ["string array of financial problems"],
  "actions": ["string array of immediate action steps"],
  "investments": ["string array of detailed investment advice including instruments like SIP, PPF, etc."],
  "warnings": ["string array of risk warnings"],
  "plan_3_months": {
    "month1": ["string array of steps for month 1"],
    "month2": ["string array of steps for month 2"],
    "month3": ["string array of steps for month 3"]
  }
}
`;

  if (isMock) {
    console.log("Using Mock AI (Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY provided)");
    return {
      problems: [
        "Your emergency fund is currently unoptimized.",
        "Potentially missing out on Section 80C tax benefits."
      ],
      actions: [
        "Start prioritizing emergency savings targeting 6 months of expenses.",
        "Review your budget to increase your savings rate."
      ],
      investments: [
        "Start an SIP of ₹5000 in a Nifty 50 Index Fund.",
        "Consider investing up to ₹1.5L annually in PPF or ELSS for tax savings."
      ],
      warnings: [
        "Avoid accumulating credit card debt.",
        "Ensure you have adequate term life and health insurance."
      ],
      plan_3_months: {
        month1: [
          "Track expenses to identify potential savings of at least 10%.",
          "Automate your savings to a separate account immediately on payday."
        ],
        month2: [
          "Open an account for your Mutual Fund SIPs and start the first installment.",
          "Check your CIBIL score."
        ],
        month3: [
          "Reallocate any excess cash to PPF or FDs.",
          "Re-evaluate your financial health score on the AI Money Mentor."
        ]
      }
    };
  }

  try {
    const promptMessage = `${rules}\n\nUser Data: \n${JSON.stringify(data, null, 2)}`;
    
    // Priority logic: Prefer Anthropic > OpenAI
    if (useAnthropic) {
      console.log("Calling Anthropic Claude...");
      const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        temperature: 0.5,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: promptMessage
          }
        ]
      });
      
      // @ts-ignore
      const content = msg.content[0].text.trim();
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(cleanContent);
      
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
      
      const content = completion.choices[0].message.content?.trim() || "{}";
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
      return JSON.parse(cleanContent);
    }
    
  } catch (err) {
    console.error("AI API Error:", err);
    throw new Error('Failed to generate AI advice');
  }
}

require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function translateToFrench(text) {
  if (!text || text.trim() === "") return "";

  const prompt = `Translate the following English text into Canadian French. Only return the French translation.\n\n"${text}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    let translated = completion.choices[0].message.content.trim();

    translated = translated.replace(/^["'](.+?)["']$/, "$1");

    return translated;
  } catch (error) {
    console.error("OpenAI translation error:", error);
    return text; 
  }
}

module.exports = {
  translateToFrench,
};

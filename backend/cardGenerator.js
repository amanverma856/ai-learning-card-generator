const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateCard(topic, cardIndex) {
  const cardNames = ["Introduction", "Core Mechanics", "Real World Impact"];
  const prompt = `Generate a learning card about "${topic}" focused on ${cardNames[cardIndex]}.
Respond ONLY with valid JSON nothing else no extra text:
{
  "title": "short title max 8 words",
  "concept": "2-3 sentence explanation",
  "funFact": "one fun fact starting with Did you know"
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
  });

  const text = completion.choices[0].message.content.trim();
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return { 
    index: cardIndex, 
    title: parsed.title, 
    concept: parsed.concept, 
    funFact: parsed.funFact 
  };
}

async function generateCards(topic, mode, onCard, onError, onDone) {
  for (let i = 0; i < 3; i++) {
    await new Promise((res) => setTimeout(res, 800));
    if (mode === "failure" && i === 2) {
      onError(i, "AI generation failed for this card. Please retry.");
      onDone();
      return;
    }
    try {
      const card = await generateCard(topic, i);
      onCard(card);
    } catch (err) {
      onError(i, `Failed to generate card ${i + 1}: ${err.message}`);
      onDone();
      return;
    }
  }
  onDone();
}

module.exports = { generateCards };
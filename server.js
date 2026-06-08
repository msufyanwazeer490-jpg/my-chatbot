const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.GROQ_API_KEY;

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 500,
        messages: [
          { role: "system", content: "You are a helpful AI assistant for a business. Answer customer queries politely and professionally. Keep answers short and clear." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from AI: " + JSON.stringify(data) });
    }

    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

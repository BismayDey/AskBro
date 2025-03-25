export const fetchAIResponse = async (
  messages: Message[],
  userMessage: Message,
  API_KEY: string
) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Ask Bro",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.1-24b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "You are Bro, a friendly and knowledgeable AI assistant. You speak in a casual, bro-like manner while maintaining professionalism and providing accurate, helpful information. You use phrases like 'Hey bro!', 'Got you covered, bro!', but you're also articulate and thorough in your explanations. You're like a smart friend who's always ready to help.",
            },
            ...messages,
            userMessage,
          ].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data: ChatResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to fetch AI response");
  }
};

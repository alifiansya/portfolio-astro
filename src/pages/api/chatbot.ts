import type { APIRoute } from "astro";


export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        // CV For LLM Data Feed
        console.log(process.env.CV_TEXT);
        const cvText = (process.env.CV_TEXT ?? "").replace(/\\n/g, "\n");
        const { message, history, counter } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        const botPrompt = `    
        ${cvText}
        chat history: {${history}}
        chat counter: {${counter}}
        user asks: {${message}}
        `;
        console.log(botPrompt)

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            body: JSON.stringify({
                "contents": [
                  {
                    "parts": [
                      {
                        "text": botPrompt
                      }
                    ]
                  }
                ]
              }),
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey ?? ""
            }
        })    
        
        const botResponse = await response.json()
        if (!response.ok) {
          console.error("Gemini API Error:", botResponse);
          return new Response(
            JSON.stringify({ reply: "Gemini API error" }),
            { status: response.status }
          );
        }
        const botText = botResponse.candidates[0].content.parts[0].text
    
        return new Response(
            JSON.stringify({ reply: `${botText}` }),
            { status: 200 }
        );
    }
    catch (e){
        console.log(e)
        return new Response(
            JSON.stringify({ reply: `Server Error, Please try again later.`, error: e}),
            { status: 500 }
        );
    }

};

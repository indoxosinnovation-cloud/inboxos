// Runs in the background, manages extension state
chrome.runtime.onInstalled.addListener(() => {
  console.log("InboxOS installed!");
});

import { GEMINI_API_KEY } from "../config";     

async function classifyEmail(subject: string, snippet: string, folders: string[]): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an email organizer. Given this email, choose the best folder from the list.
            
Email Subject: ${subject}
Email Preview: ${snippet}

Available folders: ${folders.join(", ")}

Reply with ONLY the folder name, nothing else.`
          }]
        }]
      })
    }
  );
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Miscellaneous";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AUTH_TOKEN") {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ token });
      }
    });
    return true;
  }

  if (message.type === "CLASSIFY_EMAIL") {
    const { subject, snippet, folders } = message;
    classifyEmail(subject, snippet, folders)
      .then(folder => sendResponse({ folder }))
      .catch(() => sendResponse({ folder: "Miscellaneous" }));
    return true;
  }
});   
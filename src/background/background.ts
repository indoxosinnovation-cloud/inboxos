// Runs in the background, manages extension state
chrome.runtime.onInstalled.addListener(() => {
  console.log("InboxOS installed!");
});

import { GEMINI_API_KEY } from "../config";

chrome.runtime.onInstalled.addListener(() => {
  console.log("InboxOS installed!");
});

// Step 1: Check if email matches any folder keywords directly
// This is fast and reliable — no AI needed for keyword matches
function keywordMatch(
  subject: string,
  snippet: string,
  folders: { name: string; keywords: string[] }[]
): string | null {
  const text = (subject + " " + snippet).toLowerCase();
  for (const folder of folders) {
    if (!folder.keywords || folder.keywords.length === 0) continue;
    for (const keyword of folder.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        console.log(`Keyword match: "${keyword}" → "${folder.name}"`);
        return folder.name;
      }
    }
  }
  return null;
}

// Step 2: If no keyword match, ask Gemini to classify
async function classifyWithGemini(
  subject: string,
  snippet: string,
  folders: { name: string; keywords: string[] }[]
): Promise<string> {
  const folderDescriptions = folders.map(f => {
    if (f.keywords && f.keywords.length > 0) {
      return `- ${f.name} (keywords: ${f.keywords.join(", ")})`;
    }
    return `- ${f.name}`;
  }).join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a strict email classifier. Choose the most specific folder.

Email Subject: ${subject}
Email Preview: ${snippet}

Available folders:
${folderDescriptions}

Reply with ONLY the exact folder name. Nothing else.`
          }]
        }]
      })
    }
  );

  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Miscellaneous";
  console.log(`Gemini: "${subject}" → "${result}"`);
  return result;
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

    // Try keyword matching first
    const keywordResult = keywordMatch(subject, snippet, folders);
    if (keywordResult) {
      sendResponse({ folder: keywordResult });
      return true;
    }

    // Fall back to Gemini for emails with no keyword match
    classifyWithGemini(subject, snippet, folders)
      .then(folder => {
        // Normalize folder name — case insensitive, partial match
        const normalized = folders.find((f: { name: string }) => {
          const a = f.name.toLowerCase().trim();
          const b = folder.toLowerCase().trim();
          return a === b || a.includes(b) || b.includes(a);
        });
        sendResponse({ folder: normalized?.name || "Miscellaneous" });
      })
      .catch(() => sendResponse({ folder: "Miscellaneous" }));
    return true;
  }
});  
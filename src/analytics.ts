// Firestore REST API approach — works reliably in Chrome extension service workers
const PROJECT_ID = "inboxos-35192";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/events`;

// Converts a plain object to Firestore REST API format
function toFirestoreFields(data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (typeof value === "number") {
      fields[key] = { integerValue: String(value) };
    }
  }
  return fields;
}

// Sends an event to Firestore
async function logEvent(data: Record<string, any>) {
  try {
    console.log("Sending to Firestore:", data);
    const response = await fetch(FIRESTORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(data) }),
    });
    const result = await response.json();
    console.log("Firestore response:", result);
  } catch (e) {
    console.error("Firestore error:", e);
  }
}

export async function logInstall() {
  await logEvent({ type: "install" });
}

export async function logClassification(folder: string, method: string) {
  await logEvent({ type: "classification", folder, method });
}

export async function logFolderCreated(folderName: string) {
  await logEvent({ type: "folder_created", folderName });
}

export async function logEmailMoved(toFolder: string, trainedAI: boolean) {
  await logEvent({ type: "email_moved", toFolder, trainedAI });
}

export async function logKeywordAdded(folderName: string) {
  await logEvent({ type: "keyword_added", folderName });
}

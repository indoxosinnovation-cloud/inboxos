import React, { useState, useEffect } from "react";

const DEFAULT_FOLDERS = [
  { id: 1, name: "Inbox", keywords: [] as string[] },
  { id: 2, name: "Bills", keywords: ["invoice", "payment", "receipt", "due", "electric", "bill"] },
  { id: 3, name: "Job Applications", keywords: ["interview", "offer", "application", "hiring", "resume"] },
  { id: 4, name: "Miscellaneous", keywords: [] as string[] },
];

interface Email {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  folder: string;
}

interface Folder {
  id: number;
  name: string;
  keywords: string[];
}

// Onboarding screen shown before the user connects Gmail
function OnboardingScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <div style={{
      width: "300px", height: "100vh", backgroundColor: "#fff",
      fontFamily: "Google Sans, sans-serif", display: "flex",
      flexDirection: "column", borderLeft: "1px solid #e0e0e0",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 20px", backgroundColor: "#1a73e8", color: "white",
        textAlign: "center",
      }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>InboxOS</h1>
        <p style={{ margin: "6px 0 0", fontSize: "13px", opacity: 0.85 }}>
          AI-powered Gmail organizer
        </p>
      </div>

      {/* Features list */}
      <div style={{ flex: 1, padding: "24px 20px" }}>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#444", lineHeight: 1.5 }}>
          InboxOS automatically organizes your Gmail into smart folders using AI.
        </p>

        {[
          { icon: "📁", title: "Smart Folders", desc: "AI sorts your emails automatically" },
          { icon: "🔑", title: "Keyword Training", desc: "Teach the AI your preferences" },
          { icon: "⚡", title: "Instant Access", desc: "Find any email in seconds" },
        ].map(feature => (
          <div key={feature.title} style={{
            display: "flex", alignItems: "flex-start", gap: "12px",
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "24px" }}>{feature.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#333" }}>
                {feature.title}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#888" }}>
                {feature.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Connect button */}
      <div style={{ padding: "20px" }}>
        <button
          onClick={onConnect}
          style={{
            width: "100%", padding: "14px",
            backgroundColor: "#1a73e8", color: "white",
            border: "none", borderRadius: "8px",
            cursor: "pointer", fontSize: "15px", fontWeight: 600,
            boxShadow: "0 2px 6px rgba(26,115,232,0.4)",
          }}
        >
          Connect Gmail to Get Started
        </button>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "10px" }}>
          Your emails never leave your device
        </p>
      </div>
    </div>
  );
}

// Loading animation shown while AI classifies emails
function LoadingScreen() {
  const [dotsCount, setDotsCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotsCount(d => d === 3 ? 1 : d + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(dotsCount);

  return (
    <div style={{
      width: "300px", height: "100vh", backgroundColor: "#fff",
      fontFamily: "Google Sans, sans-serif", display: "flex",
      flexDirection: "column", borderLeft: "1px solid #e0e0e0",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 16px", backgroundColor: "#1a73e8", color: "white",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>InboxOS</h1>
      </div>

      {/* Loading content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 20px",
      }}>
        {/* Spinning circle */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          border: "4px solid #e8f0fe",
          borderTop: "4px solid #1a73e8",
          animation: "spin 1s linear infinite",
          marginBottom: "24px",
        }} />

        <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#333" }}>
          AI is reading your emails{dots}
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#888", textAlign: "center" }}>
          Gemini is classifying and organizing your inbox
        </p>

        {/* Animated steps */}
        <div style={{ marginTop: "32px", width: "100%" }}>
          {[
            "Fetching your emails",
            "Analyzing content",
            "Organizing into folders",
          ].map((step, i) => (
            <div key={step} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 12px", marginBottom: "8px",
              backgroundColor: "#f8f9fa", borderRadius: "8px",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "#1a73e8",
                opacity: dotsCount > i ? 1 : 0.3,
                transition: "opacity 0.3s",
              }} />
              <span style={{ fontSize: "13px", color: "#555" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState(1);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [keywordFolderId, setKeywordFolderId] = useState<number | null>(null);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["authToken", "cachedEmails", "savedFolders"], (result) => {
      if (result.savedFolders) {
        const safeFolders = (result.savedFolders as Folder[]).map(f => ({
          ...f,
          keywords: Array.isArray(f.keywords) ? f.keywords : [],
        }));
        setFolders(safeFolders);
      }
      if (result.authToken) {
        setToken(result.authToken as string);
        if (result.cachedEmails) {
          setEmails(result.cachedEmails as Email[]);
        } else {
          fetchEmails(result.authToken as string);
        }
      }
    });
  }, []);

  const login = () => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_TOKEN" }, (response) => {
      if (response.error) {
        setError("Login failed: " + response.error);
        return;
      }
      chrome.storage.local.set({ authToken: response.token });
      setToken(response.token);
      fetchEmails(response.token);
    });
  };

  const fetchEmails = async (authToken: string) => {
    setLoading(true);
    setError("");
    try {
      const listRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25",
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const listData = await listRes.json();
      if (!listData.messages) {
        setEmails([]);
        setLoading(false);
        return;
      }
      const emailPromises = listData.messages.map(async (msg: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name === "Subject")?.value || "(No subject)";
        const from = headers.find((h: any) => h.name === "From")?.value || "Unknown";
        const snippet = msgData.snippet || "";
        const classification = await new Promise<string>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: "CLASSIFY_EMAIL",
              subject,
              snippet,
              folders: folders.map(f => ({
                name: f.name,
                keywords: Array.isArray(f.keywords) ? f.keywords : [],
              })),
            },
            (response) => {
              const raw = response?.folder?.trim() || "Miscellaneous";
              // Find exact match first, then try case-insensitive match
              const exactMatch = folders.find(f => f.name === raw);
              const looseMatch = folders.find(f => 
                f.name.toLowerCase() === raw.toLowerCase()
            );
              resolve(exactMatch?.name || looseMatch?.name || "Miscellaneous");
          }
          );
        });
        return { id: msg.id, subject, from, snippet, folder: classification };
      });
      const results = await Promise.all(emailPromises);
      chrome.storage.local.set({ cachedEmails: results });
      setEmails(results);
    } catch (err) {
      setError("Failed to fetch emails.");
    }
    setLoading(false);
  };

  const saveFolders = (updatedFolders: Folder[]) => {
    setFolders(updatedFolders);
    chrome.storage.local.set({ savedFolders: updatedFolders });
  };

  const addKeyword = (folderId: number) => {
    if (!newKeyword.trim()) return;
    const updatedFolders = folders.map(f =>
      f.id === folderId
        ? { ...f, keywords: [...(Array.isArray(f.keywords) ? f.keywords : []), newKeyword.trim().toLowerCase()] }
        : f
    );
    saveFolders(updatedFolders);
    setNewKeyword("");
  };

  const removeKeyword = (folderId: number, keyword: string) => {
    const updatedFolders = folders.map(f =>
      f.id === folderId
        ? { ...f, keywords: (Array.isArray(f.keywords) ? f.keywords : []).filter(k => k !== keyword) }
        : f
    );
    saveFolders(updatedFolders);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = { id: Date.now(), name: newFolderName.trim(), keywords: [] as string[] };
    const updatedFolders = [...folders, newFolder];
    saveFolders(updatedFolders);
    setNewFolderName("");
    setShowNewFolder(false);
    setSelected(newFolder.id);
  };

  const deleteFolder = (folderId: number) => {
    if (folderId === 4) return;
    const folderName = folders.find(f => f.id === folderId)?.name;
    const updatedEmails = emails.map(email =>
      email.folder === folderName ? { ...email, folder: "Miscellaneous" } : email
    );
    const updatedFolders = folders.filter(f => f.id !== folderId);
    setEmails(updatedEmails);
    saveFolders(updatedFolders);
    chrome.storage.local.set({ cachedEmails: updatedEmails });
    if (selected === folderId) setSelected(1);
    setMenuOpenId(null);
  };

  const startRename = (folder: Folder) => {
    setRenamingId(folder.id);
    setRenameValue(folder.name);
    setMenuOpenId(null);
  };

  const saveRename = (folderId: number) => {
    if (!renameValue.trim()) return;
    const oldName = folders.find(f => f.id === folderId)?.name;
    const updatedFolders = folders.map(f =>
      f.id === folderId ? { ...f, name: renameValue.trim() } : f
    );
    const updatedEmails = emails.map(email =>
      email.folder === oldName ? { ...email, folder: renameValue.trim() } : email
    );
    setEmails(updatedEmails);
    saveFolders(updatedFolders);
    chrome.storage.local.set({ cachedEmails: updatedEmails });
    setRenamingId(null);
    setRenameValue("");
  };

  // Show onboarding if not logged in
  if (!token) return <OnboardingScreen onConnect={login} />;

  // Show loading screen while AI classifies
  if (loading) return <LoadingScreen />;

  return (
    <div
      onClick={() => setMenuOpenId(null)}
      style={{
        width: "300px", height: "100vh", backgroundColor: "#f8f9fa",
        fontFamily: "Google Sans, sans-serif", display: "flex",
        flexDirection: "column", borderLeft: "1px solid #e0e0e0",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "20px 16px", backgroundColor: "#1a73e8", color: "white",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>InboxOS</h1>
          <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.85 }}>AI Gmail Organizer</p>
        </div>
        <button
          onClick={() => fetchEmails(token)}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "50%", width: "36px", height: "36px",
            cursor: "pointer", fontSize: "18px", display: "flex",
            alignItems: "center", justifyContent: "center", color: "white",
          }}
          title="Refresh emails"
        >↻</button>
      </div>

      {/* Folder list */}
      <div style={{ padding: "12px 8px", overflowY: "visible", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", color: "#888", padding: "0 8px", marginBottom: "8px" }}>FOLDERS</p>
        {folders.map(folder => {
          const count = emails.filter(e => e.folder === folder.name).length;
          const isSelected = selected === folder.id;
          const isRenaming = renamingId === folder.id;
          const folderKeywords = Array.isArray(folder.keywords) ? folder.keywords : [];

          return (
            <div key={folder.id} style={{ marginBottom: "4px" }}>
              {isRenaming ? (
                <div style={{ display: "flex", gap: "4px", padding: "4px 8px" }}>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(folder.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    style={{
                      flex: 1, padding: "6px 8px", borderRadius: "6px",
                      border: "1px solid #1a73e8", fontSize: "13px", outline: "none",
                    }}
                    autoFocus
                  />
                  <button onClick={() => saveRename(folder.id)} style={{
                    padding: "6px 10px", backgroundColor: "#1a73e8", color: "white",
                    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                  }}>Save</button>
                  <button onClick={() => setRenamingId(null)} style={{
                    padding: "6px 10px", backgroundColor: "#f1f3f4", color: "#333",
                    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                  }}>✕</button>
                </div>
              ) : (
                <div style={{ position: "relative" }}>
                  <div
                    onClick={(e) => { e.stopPropagation(); setSelected(folder.id); }}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                      backgroundColor: isSelected ? "#e8f0fe" : "transparent",
                      color: isSelected ? "#1a73e8" : "#333",
                    }}
                  >
                    <span style={{ fontSize: "14px", flex: 1 }}>{folder.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {count > 0 && (
                        <span style={{
                          fontSize: "12px",
                          backgroundColor: isSelected ? "#1a73e8" : "#e0e0e0",
                          color: isSelected ? "white" : "#666",
                          borderRadius: "10px", padding: "2px 8px",
                        }}>{count}</span>
                      )}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                        }}
                        style={{ fontSize: "16px", color: "#888", padding: "0 4px", cursor: "pointer" }}
                      >⋯</span>
                    </div>
                  </div>

                  {menuOpenId === folder.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute", right: "8px", top: "36px",
                        backgroundColor: "white", border: "1px solid #e0e0e0",
                        borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 100, overflow: "hidden", minWidth: "140px",
                      }}
                    >
                      <div
                        onClick={(e) => { e.stopPropagation(); startRename(folder); }}
                        style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#333" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f1f3f4")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}
                      >Rename</div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeywordFolderId(keywordFolderId === folder.id ? null : folder.id);
                          setMenuOpenId(null);
                        }}
                        style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#333" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f1f3f4")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}
                      >Edit Keywords</div>
                      {folder.id !== 4 && (
                        <div
                          onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                          style={{ padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#d93025" }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fce8e6")}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}
                        >Delete</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {keywordFolderId === folder.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    margin: "0 8px 8px", padding: "10px",
                    backgroundColor: "white", border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#888" }}>
                    KEYWORDS FOR {folder.name.toUpperCase()}
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <input
                      type="text"
                      placeholder="Add keyword..."
                      value={newKeyword}
                      onChange={(e) => { e.stopPropagation(); setNewKeyword(e.target.value); }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") addKeyword(folder.id);
                      }}
                      style={{
                        flex: 1, padding: "6px 8px", borderRadius: "6px",
                        border: "1px solid #ddd", fontSize: "12px", outline: "none",
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); addKeyword(folder.id); }}
                      style={{
                        padding: "6px 10px", backgroundColor: "#1a73e8", color: "white",
                        border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                      }}
                    >Add</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                    {folderKeywords.length === 0 && (
                      <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>No keywords yet</p>
                    )}
                    {folderKeywords.map(keyword => (
                      <span key={keyword} style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        backgroundColor: "#e8f0fe", color: "#1a73e8",
                        borderRadius: "12px", padding: "3px 10px", fontSize: "12px",
                      }}>
                        {keyword}
                        <span
                          onClick={(e) => { e.stopPropagation(); removeKeyword(folder.id, keyword); }}
                          style={{ cursor: "pointer", fontWeight: 700 }}
                        >✕</span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setKeywordFolderId(null);
                      setNewKeyword("");
                    }}
                    style={{
                      width: "100%", padding: "8px",
                      backgroundColor: "#1a73e8", color: "white",
                      border: "none", borderRadius: "6px",
                      cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    }}
                  >Done</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        <p style={{ fontSize: "11px", color: "#888", padding: "0 8px", marginBottom: "8px" }}>
          {folders.find(f => f.id === selected)?.name.toUpperCase()}
        </p>
        {error && (
          <p style={{ padding: "8px 12px", color: "red", fontSize: "13px" }}>{error}</p>
        )}
        {emails
          .filter(e => e.folder === folders.find(f => f.id === selected)?.name)
          .map(email => (
            <div key={email.id} style={{
              padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
              backgroundColor: "white", border: "1px solid #e0e0e0",
            }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#333" }}>{email.subject}</p>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#888" }}>{email.from}</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#555" }}>{email.snippet.slice(0, 60)}...</p>
            </div>
          ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
        {showNewFolder ? (
          <div>
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: "6px",
                border: "1px solid #1a73e8", fontSize: "13px",
                outline: "none", boxSizing: "border-box", marginBottom: "8px",
              }}
              autoFocus
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={createFolder} style={{
                flex: 1, padding: "8px", backgroundColor: "#1a73e8",
                color: "white", border: "none", borderRadius: "6px",
                cursor: "pointer", fontSize: "13px",
              }}>Create</button>
              <button onClick={() => setShowNewFolder(false)} style={{
                flex: 1, padding: "8px", backgroundColor: "#f1f3f4",
                color: "#333", border: "none", borderRadius: "6px",
                cursor: "pointer", fontSize: "13px",
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowNewFolder(true)}
            style={{ fontSize: "13px", color: "#1a73e8", textAlign: "center", cursor: "pointer" }}
          >
            + Create New Folder
          </div>
        )}
      </div>
    </div>
  );
}

export default App;  
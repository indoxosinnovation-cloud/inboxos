// This script runs inside Gmail
console.log("InboxOS content script loaded!");

// Create the sidebar container
const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("src/sidebar/index.html");
iframe.style.cssText = `
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  border: none;
  z-index: 9999;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
`;

document.body.appendChild(iframe);


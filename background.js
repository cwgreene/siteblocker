// Define the list of blocked URLs
let blockedSites = [];// Load blocked sites from storage
chrome.storage.local.get("blockedSites", (data) => {
  let sites = data.blockedSites || [];
  sites.forEach((x)=>blockedSites.push(x));
});

// Listen for web requests
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = new URL(details.url);
    // Check if the hostname is in the blockedSites list
    if (blockedSites.includes(url.hostname)) {
      return { cancel: true }; // Block the request
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Update the blocked sites list when modified in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
  }
});

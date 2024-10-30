const siteInput = document.getElementById("siteInput");
const addSiteButton = document.getElementById("addSiteButton");
const blockedSitesList = document.getElementById("blockedSitesList");

// Load blocked sites from storage
chrome.storage.local.get("blockedSites", (data) => {
  let sites = data.blockedSites || [];
  sites.forEach(addSiteToList);
});

function getFromStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

function setStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

// Add a site to the blocklist
addSiteButton.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (site) {
    chrome.storage.local.get("blockedSites", (data) => {
      let sites = data.blockedSites || [];
      if (!sites.includes(site)) {
        sites.push(site);
        chrome.storage.local.set({ blockedSites: sites }, () => {
          addSiteToList(site);
          siteInput.value = "";
        });
        update_background(sites);
      }
    });
  }
});

function update_background(sites) {
    // Update background script with the new list
    chrome.runtime.getBackgroundPage((bg) => {
      bg.blockedSites = sites;
    });
}

// Add site to the UI list
async function addSiteToList(site) {
  const li = document.createElement("li");
  // create clickable button
  const button = document.createElement("button")
  button.textContent = site;
  button.onclick = async function() {
    console.log(`reallow ${site}`);
    old_sites = await getFromStorage("blockedSites")
    old_sites = old_sites["blockedSites"]
    let new_sites = old_sites.filter(item => item !== site);
    await setStorage({blockedSites:new_sites});
    update_background(new_sites);
    blockedSitesList.removeChild(li);
  }
  li.appendChild(button);
  blockedSitesList.appendChild(li);
}


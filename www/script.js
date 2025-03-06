// Initialize when Python webview is ready
window.addEventListener("pywebviewready", function () {
  loadPlugins();
  loadBepinexStatus();
  setInterval(loadPlugins, 5000); // Refresh plugin list every 5 seconds
});

// Prevent default browser behavior for drag and drop
window.addEventListener("dragover", function (e) {
  e.preventDefault();
});
window.addEventListener("drop", function (e) {
  e.preventDefault();
});

// Track which plugin is targeted for deletion
let pluginToDelete = null;

// Fetch and display all plugin files
function loadPlugins() {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.getPlugins().then(function (files) {
      const pluginsList = document.getElementById("plugins-list");
      const otherList = document.getElementById("other-list");
      pluginsList.innerHTML = "";
      otherList.innerHTML = "";
      
      // Separate files into plugins (.dll) and other files
      const plugins = [];
      const others = [];
      files.forEach(function (file) {
        const lower = file.toLowerCase();
        if (lower.endsWith(".dll") || lower.endsWith(".dll.disabled")) {
          plugins.push(file);
        } else {
          others.push(file);
        }
      });
      
      // Add plugin files to the plugins tab
      plugins.forEach(function (plugin) {
        let displayName = plugin;
        let isEnabled = true;
        if (plugin.endsWith(".dll.disabled")) {
          displayName = plugin.replace(".dll.disabled", ".dll");
          isEnabled = false;
        }
        
        // Create list item with toggle switch and delete button
        const li = document.createElement("li");
        const spanName = document.createElement("span");
        spanName.className = "plugin-name";
        spanName.textContent = displayName;
        
        const controlsDiv = document.createElement("div");
        controlsDiv.className = "plugin-controls";
        
        // Create toggle switch
        const toggleLabel = document.createElement("label");
        toggleLabel.className = "switch";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isEnabled;
        checkbox.addEventListener("change", function () {
          togglePlugin(plugin);
        });
        const slider = document.createElement("span");
        slider.className = "slider";
        toggleLabel.appendChild(checkbox);
        toggleLabel.appendChild(slider);
        
        // Create delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 
            6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 
            96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 
            0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 
            64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 
            0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 
            0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/>
          </svg>`;
        deleteBtn.addEventListener("click", function () {
          showDeleteConfirmation(plugin);
        });
        
        // Assemble and add to DOM
        controlsDiv.appendChild(toggleLabel);
        controlsDiv.appendChild(deleteBtn);
        li.appendChild(spanName);
        li.appendChild(controlsDiv);
        pluginsList.appendChild(li);
      });
      
      // Add other files to the "Other" tab
      others.forEach(function (file) {
        const li = document.createElement("li");
        const spanName = document.createElement("span");
        spanName.className = "plugin-name";
        spanName.textContent = file;
        
        // Only delete button for non-plugin files
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 
            6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 
            96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 
            0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 
            64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 
            0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 
            0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/>
          </svg>`;
        deleteBtn.addEventListener("click", function () {
          showDeleteConfirmation(file);
        });
        
        li.appendChild(spanName);
        li.appendChild(deleteBtn);
        otherList.appendChild(li);
      });
    });
  }
}

// Enable or disable a plugin by toggling its file extension
function togglePlugin(plugin) {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.togglePlugin(plugin).then(function () {
      loadPlugins();
    });
  }
}

// Delete a plugin file
function deletePlugin(plugin) {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.deletePlugin(plugin).then(function () {
      loadPlugins();
    });
  }
}

// Display confirmation modal before deleting
function showDeleteConfirmation(plugin) {
  pluginToDelete = plugin;
  document.getElementById("confirm-modal").style.display = "block";
}

function hideDeleteConfirmation() {
  document.getElementById("confirm-modal").style.display = "none";
  pluginToDelete = null;
}

// Display warning modal with custom message
function showWarning(message) {
  const modal = document.getElementById("install-warning-modal");
  document.getElementById("install-warning-message").textContent = message;
  modal.style.display = "block";
}

function hideInstallWarning() {
  document.getElementById("install-warning-modal").style.display = "none";
}

// Check BepInEx installation status and render appropriate UI
function loadBepinexStatus() {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.checkBepInEx().then(function (response) {
      const bepinexContainer = document.getElementById("bepinex-container");
      bepinexContainer.innerHTML = "";

      // Management buttons row
      const managementRow = document.createElement("div");
      managementRow.className = "bepinex-management-row";
      
      // Show different buttons based on installation status
      if (response.installed) {
        // If installed, show reinstall and uninstall buttons
        const reinstallBtn = document.createElement("button");
        reinstallBtn.className = "bepinex-btn";
        reinstallBtn.textContent = "Reinstall BepInEx";
        reinstallBtn.onclick = function () {
          window.pywebview.api.reinstallBepInEx().then(function (result) {
            alert(result.status || result.error);
            loadBepinexStatus();
          });
        };
        
        const uninstallBtn = document.createElement("button");
        uninstallBtn.className = "bepinex-btn";
        uninstallBtn.textContent = "Uninstall BepInEx";
        uninstallBtn.onclick = function () {
          window.pywebview.api.uninstallBepInEx().then(function (result) {
            alert(result.status || result.error);
            loadBepinexStatus();
          });
        };
        
        managementRow.appendChild(reinstallBtn);
        managementRow.appendChild(uninstallBtn);
      } else {
        // If not installed, show install button
        const installBtn = document.createElement("button");
        installBtn.className = "bepinex-btn";
        installBtn.textContent = "Install BepInEx";
        installBtn.onclick = function () {
          window.pywebview.api.installBepInEx().then(function (result) {
            alert(result.status || result.error);
            loadBepinexStatus();
          });
        };
        managementRow.appendChild(installBtn);
      }
      bepinexContainer.appendChild(managementRow);

      // Folder navigation and game launch buttons row
      const folderRow = document.createElement("div");
      folderRow.className = "bepinex-folder-row";
      
      // Open game folder button (always available)
      const openGameBtn = document.createElement("button");
      openGameBtn.className = "bepinex-btn";
      openGameBtn.textContent = "Open Gorilla Tag Folder";
      openGameBtn.onclick = function () {
        window.pywebview.api.openGameFolder();
      };
      folderRow.appendChild(openGameBtn);
      
      // Open plugins folder (only if BepInEx is installed)
      if (response.installed) {
        const openPluginsBtn = document.createElement("button");
        openPluginsBtn.className = "bepinex-btn";
        openPluginsBtn.textContent = "Open Plugins Folder";
        openPluginsBtn.onclick = function () {
          window.pywebview.api.openPluginsFolder();
        };
        folderRow.appendChild(openPluginsBtn);
      }
      
      // Game launch buttons
      const launchSteamBtn = document.createElement("button");
      launchSteamBtn.className = "bepinex-btn";
      launchSteamBtn.textContent = "Launch GorillaTag Steam";
      launchSteamBtn.onclick = function () {
        window.pywebview.api.launchSteamGame();
      };
      folderRow.appendChild(launchSteamBtn);
      
      const launchEXEBtn = document.createElement("button");
      launchEXEBtn.className = "bepinex-btn";
      launchEXEBtn.textContent = "Launch GorillaTag EXE";
      launchEXEBtn.onclick = function () {
        window.pywebview.api.launchEXEGame();
      };
      folderRow.appendChild(launchEXEBtn);

      bepinexContainer.appendChild(folderRow);
    });
  }
}

// Tab switching functionality
function showTab(tab) {
  const pluginsTab = document.getElementById("plugins-tab");
  const otherTab = document.getElementById("other-tab");
  const pluginsContent = document.getElementById("plugins-content");
  const otherContent = document.getElementById("other-content");
  
  if (tab === "plugins") {
    pluginsTab.classList.add("active");
    otherTab.classList.remove("active");
    pluginsContent.classList.add("active");
    otherContent.classList.remove("active");
  } else if (tab === "other") {
    otherTab.classList.add("active");
    pluginsTab.classList.remove("active");
    otherContent.classList.add("active");
    pluginsContent.classList.remove("active");
  }
}

// Handle downloading plugin from URL
function handleLinkUpload(url) {
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.downloadPluginFromUrl(url).then(function(response) {
      if (response.error) {
        showWarning(response.error);
      } else {
        loadPlugins();
      }
    }).catch(function(error) {
      showWarning("Failed to download file from the dropped link.");
    });
  }
}

// Handle local file uploads
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const base64Data = event.target.result.split(",")[1];
    if (window.pywebview && window.pywebview.api) {
      window.pywebview.api.uploadPlugin(file.name, base64Data)
        .then(function (response) {
          if (response.error) {
            showWarning(response.error);
          }
          loadPlugins();
        });
    }
  };
  reader.onerror = function (error) {
    showWarning("Error reading file " + file.name);
  };
  reader.readAsDataURL(file);
}

// Setup drag and drop functionality
const dropContainer = document.querySelector(".list-container");
if (dropContainer) {
  dropContainer.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropContainer.classList.add("drag-over");
  });
  dropContainer.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dropContainer.classList.remove("drag-over");
  });
  dropContainer.addEventListener("drop", function (e) {
    e.preventDefault();
    dropContainer.classList.remove("drag-over");
    handleDropEvent(e);
  });
}

// Process dropped files or URLs
function handleDropEvent(e) {
  e.preventDefault();
  const dt = e.dataTransfer;
  const capturedFiles = dt.files;
  const capturedItems = dt.items;
  const plainData = dt.getData("text/plain") || "";
  const uriData = dt.getData("text/uri-list") || "";
  
  // Check BepInEx installation before processing uploads
  window.pywebview.api.checkBepInEx().then(function (res) {
    if (!res.installed) {
      showWarning("You need to install BepInEx before adding plugins!");
      return;
    } else if (!res.plugins_exists) {
      showWarning("Your BepInEx installation is missing the plugins folder. Please reinstall or repair your installation.");
      return;
    }
    
    // Handle file drops
    if (capturedFiles && capturedFiles.length > 0) {
      for (let i = 0; i < capturedFiles.length; i++) {
        const file = capturedFiles[i];
        handleFileUpload(file);
      }
      return;
    }
    
    // Handle data transfer items (can be files or strings)
    if (capturedItems && capturedItems.length > 0) {
      for (let i = 0; i < capturedItems.length; i++) {
        let item = capturedItems[i];
        if (item.kind === "file") {
          let file = item.getAsFile();
          if (file) {
            handleFileUpload(file);
          }
        } else if (item.kind === "string") {
          item.getAsString(function (data) {
            const url = data.trim();
            if (url && url.startsWith("http")) {
              handleLinkUpload(url);
            }
          });
        }
      }
      return;
    }
    
    // Handle plain URL drops
    const urlCandidate = (plainData || uriData).trim();
    if (urlCandidate && urlCandidate.startsWith("http")) {
      handleLinkUpload(urlCandidate);
    }
  });
}

// Set up event listeners
document.getElementById("plugins-tab").addEventListener("click", function () {
  showTab("plugins");
});
document.getElementById("other-tab").addEventListener("click", function () {
  showTab("other");
});
document.getElementById("confirm-yes").addEventListener("click", function () {
  if (pluginToDelete) {
    deletePlugin(pluginToDelete);
  }
  hideDeleteConfirmation();
});
document.getElementById("confirm-no").addEventListener("click", function () {
  hideDeleteConfirmation();
});
document.getElementById("warning-ok").addEventListener("click", function () {
  hideInstallWarning();
});

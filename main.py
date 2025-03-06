import os
import shutil
import base64
import zipfile
import io
import requests
import webview

class API:
    def __init__(self):
        # Game installation directory
        self.game_dir = r"C:\Program Files (x86)\Steam\steamapps\common\Gorilla Tag"
        self.install_base = self.game_dir
        self.bepinex_path = os.path.join(self.install_base, "BepInEx")
        self.plugins_path = os.path.join(self.bepinex_path, "plugins")
        
        # Core files that identify a valid BepInEx installation
        self.bepinex_items = [
            "BepInEx",              # Main directory
            ".doorstop_version",    # Configuration files
            "changelog.txt",
            "doorstop_config.ini",
            "winhttp.dll"           # Proxy DLL
        ]
        
        # URL for BepInEx release download
        self.download_url = ("https://github.com/BepInEx/BepInEx/releases/download/"
                             "v5.4.23.2/BepInEx_win_x64_5.4.23.2.zip")

    def _is_bepinex_installed(self):
        """Check if all required BepInEx files exist in the game directory."""
        for item in self.bepinex_items:
            target = os.path.join(self.install_base, item)
            if not os.path.exists(target):
                return False
        return True

    def getPlugins(self):
        """Get list of all plugin files in the plugins directory."""
        try:
            if not os.path.exists(self.plugins_path):
                return []
            files = os.listdir(self.plugins_path)
            plugin_files = [f for f in files if os.path.isfile(os.path.join(self.plugins_path, f))]
            return plugin_files
        except Exception as e:
            return {"error": str(e)}

    def togglePlugin(self, plugin):
        """Enable or disable a plugin by renaming its file extension."""
        old_path = os.path.join(self.plugins_path, plugin)
        if not os.path.exists(old_path):
            return {"error": "File does not exist."}
            
        # Toggle between enabled (.dll) and disabled (.dll.disabled) states
        if plugin.endswith(".dll.disabled"):
            new_plugin = plugin.replace(".dll.disabled", ".dll")
        elif plugin.endswith(".dll"):
            new_plugin = plugin + ".disabled"
        else:
            return {"error": "Not a valid plugin file."}
            
        new_path = os.path.join(self.plugins_path, new_plugin)
        try:
            os.rename(old_path, new_path)
            return {"status": "success", "new_name": new_plugin}
        except Exception as e:
            return {"error": str(e)}

    def deletePlugin(self, plugin):
        """Remove a plugin file from the plugins directory."""
        file_path = os.path.join(self.plugins_path, plugin)
        if not os.path.exists(file_path):
            return {"error": "Plugin does not exist."}
        try:
            os.remove(file_path)
            return {"status": "Plugin deleted successfully."}
        except Exception as e:
            return {"error": str(e)}

    def uploadPlugin(self, pluginName, fileDataBase64):
        """Save a plugin file from base64-encoded data."""
        try:
            # Create plugins folder if it doesn't exist
            if not os.path.exists(self.plugins_path):
                os.makedirs(self.plugins_path)
                print(f"Created missing plugins folder at: {self.plugins_path}")
                
            # Decode and save the file
            file_bytes = base64.b64decode(fileDataBase64)
            file_path = os.path.join(self.plugins_path, pluginName)
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            print(f"Uploaded plugin file: {file_path}")
            return {"status": "Plugin uploaded successfully."}
        except Exception as e:
            print(f"Error uploading plugin: {str(e)}")
            return {"error": str(e)}

    def checkBepInEx(self):
        """Check BepInEx installation status."""
        installed = self._is_bepinex_installed()
        plugins_exists = os.path.exists(self.plugins_path)
        return {"installed": installed, "plugins_exists": plugins_exists}

    def installBepInEx(self):
        """Download and install BepInEx from GitHub."""
        if self._is_bepinex_installed():
            return {"error": "BepInEx is already installed."}
        try:
            # Download the ZIP file
            r = requests.get(self.download_url)
            if r.status_code != 200:
                return {"error": f"Failed to download BepInEx. HTTP Status: {r.status_code}"}
                
            # Extract ZIP contents to game directory
            zip_data = io.BytesIO(r.content)
            with zipfile.ZipFile(zip_data) as z:
                z.extractall(self.install_base)
                
            # Ensure plugins folder exists
            if not os.path.exists(self.plugins_path):
                os.makedirs(self.plugins_path)
            return {"status": "BepInEx installed successfully."}
        except Exception as e:
            return {"error": str(e)}

    def reinstallBepInEx(self):
        """Remove existing BepInEx and install fresh copy."""
        try:
            if self._is_bepinex_installed():
                self.uninstallBepInEx()
            return self.installBepInEx()
        except Exception as e:
            return {"error": str(e)}

    def uninstallBepInEx(self):
        """Remove all BepInEx files from game directory."""
        try:
            removed_any = False
            for item in self.bepinex_items:
                target = os.path.join(self.install_base, item)
                if os.path.exists(target):
                    if os.path.isdir(target):
                        shutil.rmtree(target)
                    else:
                        os.remove(target)
                    removed_any = True
            if removed_any:
                return {"status": "BepInEx uninstalled successfully."}
            else:
                return {"error": "BepInEx is not installed."}
        except Exception as e:
            return {"error": str(e)}
        
    def downloadPluginFromUrl(self, url):
        """Download a plugin file from a URL."""
        try:
            r = requests.get(url)
            r.raise_for_status()
        except Exception as e:
            return {"error": f"Failed to download file: {str(e)}"}
            
        # Extract filename from URL
        filename = url.split("/")[-1].split("?")[0] or "downloaded_plugin"
        file_path = os.path.join(self.plugins_path, filename)
        
        try:
            with open(file_path, "wb") as f:
                f.write(r.content)
            return {"status": "Plugin downloaded successfully via backend."}
        except Exception as e:
            return {"error": f"Failed to save plugin: {str(e)}"}

    def openGameFolder(self):
        """Open the game installation directory in file explorer."""
        try:
            os.startfile(self.install_base)
            return {"status": "Game folder opened."}
        except Exception as e:
            return {"error": str(e)}

    def openPluginsFolder(self):
        """Open the plugins directory in file explorer."""
        try:
            os.startfile(self.plugins_path)
            return {"status": "Plugins folder opened."}
        except Exception as e:
            return {"error": str(e)}
    
    def launchSteamGame(self):
        """Launch Gorilla Tag through Steam."""
        try:
            # Use Steam protocol with Gorilla Tag's app ID
            os.startfile("steam://run/1533390")
            return {"status": "GorillaTag launched via Steam."}
        except Exception as e:
            return {"error": str(e)}

    def launchEXEGame(self):
        """Launch Gorilla Tag directly via its executable."""
        try:
            exe_path = os.path.join(self.game_dir, "GorillaTag.exe")
            if not os.path.exists(exe_path):
                return {"error": "GorillaTag executable not found."}
            os.startfile(exe_path)
            return {"status": "GorillaTag launched via EXE."}
        except Exception as e:
            return {"error": str(e)}


if __name__ == '__main__':
    # Create and start the webview window with our API
    window = webview.create_window(
        "GorillaTag Plugin Manager",
        "www/index.html",
        width=600,
        height=670,
        js_api=API(),
        resizable=False
    )
    webview.start(http_server=True)

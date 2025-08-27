// ==UserScript==
// @name         Starcheat Client Loader Enhanced
// @namespace    https://starblast.io/
// @version      0.3
// @description  Erweiterte Starcheat-Loader mit Menü, Radar Zoom, Fast Respawn, Lowercase Name, Zoom und Blank Emotes Cheats
// @author       Du
// @match        https://starblast.io/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Logging Funktion
    function log(msg) {
        console.log('%c[Client] ' + msg, 'color: #Ffffff');
    }

    // Default Settings
    const defaultSettings = {
        loadSettingsCSS: true,
        useCustomSplashScreen: false,
        customSplashScreen: "",
        logToConsole: true,
        injectIntoCustomSRC: false,
        customSRCURL: "https://starblast.io/",
        customSRC: null,
        cheats: {
            radarZoom: false,
            fastRespawn: false,
            lowercaseName: false,
            mouseWheelZoom: false,
            blankEmotes: false
        }
    };

    // Settings initialisieren
    if (window.starcheatSettings == null) {
        log("Settings not found, setting to default");
        window.starcheatSettings = defaultSettings;
    } else {
        // Sicherstellen, dass cheats existiert und neue Cheats hinzufügen
        if (!window.starcheatSettings.cheats) {
            window.starcheatSettings.cheats = defaultSettings.cheats;
        } else {
            // Neue Cheats zu bestehenden Settings hinzufügen
            Object.keys(defaultSettings.cheats).forEach(cheat => {
                if (window.starcheatSettings.cheats[cheat] === undefined) {
                    window.starcheatSettings.cheats[cheat] = defaultSettings.cheats[cheat];
                }
            });
        }
    }

    // Cheats aus localStorage laden (überschreibt window.starcheatSettings.cheats)
    const savedCheatsJSON = localStorage.getItem('starcheat_cheats');
    if (savedCheatsJSON) {
        try {
            const savedCheats = JSON.parse(savedCheatsJSON);
            // Merge mit default settings um neue Cheats zu berücksichtigen
            window.starcheatSettings.cheats = { ...defaultSettings.cheats, ...savedCheats };
            log("Cheat settings loaded from localStorage");
        } catch (e) {
            log("Failed to parse cheats from localStorage");
        }
    }

    // Splash Screen
    if (!window.starcheatSettings.useCustomSplashScreen) {
        document.open();
        document.write(`
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>Starcheat lädt...</title>
<style>
  body {
    margin: 0;
    background: linear-gradient(135deg, #4b006e, #a100a6);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    flex-direction: column;
  }
  h1 {
    font-weight: 600;
    margin-bottom: 20px;
  }
  .loader {
    border: 6px solid rgba(255, 255, 255, 0.2);
    border-top: 6px solid #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .subtext {
    margin-top: 15px;
    font-size: 1rem;
    opacity: 0.8;
  }
</style>
</head>
<body>
  <h1>Starcheat lädt...</h1>
  <div class="loader"></div>
  <div class="subtext">Bitte warten Sie einen Moment</div>
</body>
</html>
        `);
        document.close();
    } else {
        document.open();
        document.write(window.starcheatSettings.customSplashScreen);
        document.close();
    }

    log("Started");

    // SRC laden
    var srcUrl = window.starcheatSettings.injectIntoCustomSRC && window.starcheatSettings.customSRC
        ? window.starcheatSettings.customSRCURL
        : "https://starblast.io/";

    var xhr = new XMLHttpRequest();
    log("Fetching starblast src...");
    xhr.open("GET", srcUrl);
    xhr.setRequestHeader("package", "true");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            var src = xhr.responseText;
            if (window.starcheatSettings.injectIntoCustomSRC && window.starcheatSettings.customSRC) {
                log("Using custom SRC");
                src = window.starcheatSettings.customSRC;
            }
            if (src == null) {
                log("Src fetch failed");
                alert("An error occurred whilst fetching game code");
                return;
            }

            log("Patching src...");

            // Radar Zoom Cheat
            if (window.starcheatSettings.cheats.radarZoom === true) {
                log("Applying Radar Zoom Cheat");
                src = src.replace(/this\.radar_zoom=([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/g, "this.radar_zoom=1");
            }

            // Fast Respawn Cheat
            if (window.starcheatSettings.cheats.fastRespawn === true) {
                log("Applying Fast Respawn Cheat");
                src = src.replace(/respawn_delay=([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/g, "respawn_delay=0");
            }

            // Lowercase Name Cheat
            if (window.starcheatSettings.cheats.lowercaseName === true) {
                log("Applying Lowercase Name Cheat");
                src = src.replace(/\.toUpperCase\(\)/g, "");
                src = src.replace(/text-transform\s*:\s*uppercase\s*;?/gi, "");
            }

            // Blank Emotes Cheat
            if (window.starcheatSettings.cheats.blankEmotes === true) {
                log("Applying Blank Emotes Cheat");
                
                // Versuche verschiedene Patterns für vocabulary
                const patterns = [
                    /(this\.vocabulary\s*=\s*\[)([\s\S]*?)(\])/g,
                    /(\.vocabulary\s*=\s*\[)([\s\S]*?)(\])/g,
                    /(\w+\.vocabulary\s*=\s*\[)([\s\S]*?)(\])/g
                ];
                
                const emotes = [
                    '{text:"Example",icon:"®",key:"I"}',
                    '{text:"Me",icon:"?",key:"E"}',
                    '{text:"You",icon:">",key:"D"}'
                ].join(",");
                
                let modified = false;
                patterns.forEach(regex => {
                    if (modified) return;
                    const matches = src.match(regex);
                    if (matches) {
                        src = src.replace(regex, (match, p1, p2, p3) => {
                            if (p2.includes('"Example"') || p2.includes("'Example'")) {
                                return match; // Emotes schon drin
                            }
                            modified = true;
                            log("Found vocabulary array, adding emotes");
                            // Füge Komma hinzu wenn der Array nicht leer ist
                            const separator = p2.trim() && !p2.trim().endsWith(',') ? ',' : '';
                            return `${p1}${p2}${separator}${emotes}${p3}`;
                        });
                    }
                });
                
                if (!modified) {
                    log("Warning: Could not find vocabulary array to modify");
                }
            }

            log("Patched src successfully");

            // Zoom Cheat Script (wird nach dem Laden der Seite ausgeführt)
            const zoomCheatScript = `
                (function () {
                    'use strict';
                    if (!${window.starcheatSettings.cheats.mouseWheelZoom}) return;
                    
                    // Warte, bis das Spiel geladen ist
                    const waitForSettings = setInterval(() => {
                        try {
                            // Greife auf das globale settings-Objekt zu
                            const settings = window.module?.exports?.settings;
                            if (!settings) return;
                            const modeObject = Object.values(settings).find(e => e && e.mode);
                            if (!modeObject) return;
                            // Mausrad-Zoom-Funktion aktivieren
                            let zoomQueue = [];
                            let zoomInterval = null;
                            document.body.addEventListener("wheel", (e) => {
                                try {
                                    const currentMode = Object.values(settings).find(e => e && e.mode)?.mode?.id;
                                    if (currentMode === "welcome") return;
                                    // Zoomrichtung bestimmen
                                    let deltaZoom = e.deltaY < 0 ? -5 : (e.deltaY > 0 ? 5 : 0);
                                    if (deltaZoom === 0) return;
                                    zoomQueue.push(deltaZoom);
                                    e.stopPropagation();
                                    function processZoomQueue() {
                                        if (zoomQueue.length === 0 || zoomInterval) return;
                                        // Kamera-Zugriff: fov.position.z
                                        const seedObj = Object.values(modeObject).find(e => e && e.seed);
                                        const fovObj = Object.values(seedObj || {}).find(e => e && e.fov);
                                        if (!fovObj || !fovObj.position) return;
                                        let currentZ = fovObj.position.z;
                                        let targetZ = currentZ + zoomQueue.shift();
                                        let step = (targetZ - currentZ) / 12;
                                        zoomInterval = setInterval(() => {
                                            if (Math.abs(currentZ - targetZ) <= 1) {
                                                fovObj.translateZ(targetZ - currentZ);
                                                clearInterval(zoomInterval);
                                                zoomInterval = null;
                                                processZoomQueue(); // Weiter mit nächstem Eintrag
                                            } else {
                                                currentZ += step;
                                                fovObj.translateZ(step);
                                            }
                                        }, 1);
                                    }
                                    processZoomQueue();
                                } catch (err) {
                                    console.error("Zoom error:", err);
                                }
                            });
                            console.log("[Zoom With Mouse Wheel] aktiviert.");
                            clearInterval(waitForSettings);
                        } catch (err) {
                            // Warten, bis window.module.exports.settings verfügbar ist
                        }
                    }, 250);
                })();
            `;

            // Menü einfügen und auf Strg + A reagieren
            const menuScript = `
                (function(){
                    // Menü HTML + Styles
                    const menuHTML = \`
                    <style>
                        #starcheatMenu {
                            position: fixed;
                            top: 50px;
                            right: 50px;
                            width: 350px;
                            background: rgba(0,0,0,0.9);
                            color: white;
                            border: 2px solid #a100a6;
                            border-radius: 12px;
                            padding: 20px;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            z-index: 99999;
                            display: none;
                            user-select: none;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.7);
                        }
                        #starcheatMenu h2 {
                            margin-top: 0;
                            margin-bottom: 20px;
                            font-weight: 600;
                            font-size: 1.4rem;
                            text-align: center;
                            color: #a100a6;
                            text-shadow: 0 0 10px rgba(161,0,166,0.5);
                        }
                        #starcheatMenu .cheat-section {
                            margin-bottom: 15px;
                            padding: 10px;
                            background: rgba(255,255,255,0.05);
                            border-radius: 8px;
                            border-left: 3px solid #a100a6;
                        }
                        #starcheatMenu label {
                            display: flex;
                            align-items: center;
                            cursor: pointer;
                            margin-bottom: 8px;
                            font-size: 1rem;
                            transition: color 0.2s;
                        }
                        #starcheatMenu label:hover {
                            color: #a100a6;
                        }
                        #starcheatMenu input[type=checkbox] {
                            margin-right: 12px;
                            width: 18px;
                            height: 18px;
                            accent-color: #a100a6;
                        }
                        #starcheatMenu .cheat-description {
                            font-size: 0.85rem;
                            color: #ccc;
                            margin-left: 30px;
                            margin-top: -5px;
                            margin-bottom: 10px;
                        }
                        #starcheatMenu button {
                            background: linear-gradient(135deg, #a100a6, #7a007a);
                            border: none;
                            padding: 12px 16px;
                            color: white;
                            cursor: pointer;
                            border-radius: 8px;
                            font-weight: 600;
                            width: 100%;
                            margin-top: 15px;
                            font-size: 1rem;
                            transition: all 0.3s;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        #starcheatMenu button:hover {
                            background: linear-gradient(135deg, #7a007a, #5a005a);
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(161,0,166,0.4);
                        }
                        #starcheatMenu .controls-info {
                            text-align: center;
                            font-size: 0.8rem;
                            color: #aaa;
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px solid rgba(255,255,255,0.1);
                        }
                    </style>
                    <div id="starcheatMenu" tabindex="0">
                        <h2>🌟 Starcheat Menü</h2>
                        
                        <div class="cheat-section">
                            <label><input type="checkbox" id="radarZoomToggle"> Radar Zoom</label>
                            <div class="cheat-description">Aktiviert permanenten Radar-Zoom für bessere Übersicht</div>
                        </div>
                        
                        <div class="cheat-section">
                            <label><input type="checkbox" id="fastRespawnToggle"> Fast Respawn</label>
                            <div class="cheat-description">Entfernt die Respawn-Verzögerung nach dem Tod</div>
                        </div>
                        
                        <div class="cheat-section">
                            <label><input type="checkbox" id="lowercaseNameToggle"> Lowercase Names</label>
                            <div class="cheat-description">Zeigt Spielernamen in normaler Groß-/Kleinschreibung</div>
                        </div>
                        
                        <div class="cheat-section">
                            <label><input type="checkbox" id="mouseWheelZoomToggle"> Mouse Wheel Zoom</label>
                            <div class="cheat-description">Aktiviert Zoom mit dem Mausrad im Spiel</div>
                        </div>
                        
                        <div class="cheat-section">
                            <label><input type="checkbox" id="blankEmotesToggle"> Blank Emotes</label>
                            <div class="cheat-description">Fügt zusätzliche Emotes hinzu (I, E, D Tasten)</div>
                        </div>
                        
                        <button id="closeMenuBtn">Schließen</button>
                        
                        <div class="controls-info">
                            Drücke <strong>Strg + A</strong> um das Menü zu öffnen/schließen
                        </div>
                    </div>
                    \`;

                    document.body.insertAdjacentHTML('beforeend', menuHTML);

                    const menu = document.getElementById('starcheatMenu');
                    const radarToggle = document.getElementById('radarZoomToggle');
                    const fastRespawnToggle = document.getElementById('fastRespawnToggle');
                    const lowercaseNameToggle = document.getElementById('lowercaseNameToggle');
                    const mouseWheelZoomToggle = document.getElementById('mouseWheelZoomToggle');
                    const blankEmotesToggle = document.getElementById('blankEmotesToggle');
                    const closeBtn = document.getElementById('closeMenuBtn');

                    // Einstellungen aus localStorage laden
                    function loadSettings() {
                        const stored = localStorage.getItem('starcheat_cheats');
                        if (stored) {
                            try {
                                const cheats = JSON.parse(stored);
                                radarToggle.checked = !!cheats.radarZoom;
                                fastRespawnToggle.checked = !!cheats.fastRespawn;
                                lowercaseNameToggle.checked = !!cheats.lowercaseName;
                                mouseWheelZoomToggle.checked = !!cheats.mouseWheelZoom;
                                blankEmotesToggle.checked = !!cheats.blankEmotes;
                            } catch(e) {}
                        }
                    }
                    loadSettings();

                    // Einstellungen speichern
                    function saveSettings() {
                        const cheats = {
                            radarZoom: radarToggle.checked,
                            fastRespawn: fastRespawnToggle.checked,
                            lowercaseName: lowercaseNameToggle.checked,
                            mouseWheelZoom: mouseWheelZoomToggle.checked,
                            blankEmotes: blankEmotesToggle.checked
                        };
                        localStorage.setItem('starcheat_cheats', JSON.stringify(cheats));
                    }

                    // Menü schließen
                    function closeMenu() {
                        menu.style.display = 'none';
                    }

                    // Menü öffnen
                    function openMenu() {
                        menu.style.display = 'block';
                        menu.focus();
                    }

                    // Strg + A öffnet das Menü
                    window.addEventListener('keydown', function(e){
                        if(e.ctrlKey && e.key.toLowerCase() === 'a') {
                            e.preventDefault();
                            if(menu.style.display === 'block'){
                                closeMenu();
                            } else {
                                openMenu();
                            }
                        }
                    });

                    // Event Listener für alle Checkboxen
                    function setupCheatToggle(toggle, requiresReload = true) {
                        toggle.addEventListener('change', function(){
                            saveSettings();
                            if (requiresReload) {
                                alert('Einstellung gespeichert. Bitte Seite neu laden, damit Änderungen aktiv werden.');
                            }
                        });
                    }

                    setupCheatToggle(radarToggle);
                    setupCheatToggle(fastRespawnToggle);
                    setupCheatToggle(lowercaseNameToggle);
                    setupCheatToggle(blankEmotesToggle);
                    setupCheatToggle(mouseWheelZoomToggle, false); // Mouse Wheel Zoom braucht kein Reload

                    // Schließen-Button
                    closeBtn.addEventListener('click', closeMenu);

                    // Mouse Wheel Zoom Toggle Handler (ohne Reload)
                    mouseWheelZoomToggle.addEventListener('change', function(){
                        saveSettings();
                        if (mouseWheelZoomToggle.checked) {
                            // Zoom Script aktivieren
                            ${zoomCheatScript}
                        }
                    });
                })();
            `;

            // Scripts anhängen
            src += `\n<script>${menuScript}<\/script>\n`;
            
            // Zoom Script nur hinzufügen, wenn aktiviert
            if (window.starcheatSettings.cheats.mouseWheelZoom === true) {
                src += `\n<script>${zoomCheatScript}<\/script>\n`;
            }

            document.open();
            document.write(src);
            document.close();

            log("Document loaded");
        }
    };
    xhr.send();

})();

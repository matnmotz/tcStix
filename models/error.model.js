const fs = require('fs');
const path = require('path'); // Modul für sichere Pfade

function appendToLogs(msg) {
    // __dirname sorgt dafür, dass der Pfad immer relativ zur Skript-Datei ist
    const logPath = path.join(__dirname, '../config', 'errorLog.txt');
    const txt = `[${formatDateTime()}] - ${msg}\n`;

    fs.appendFile(logPath, txt, (err) => {
        if (err) {
            console.error("LOG-FEHLER:", err.message);
            return;
        }
        console.log('Text erfolgreich geschrieben!');
    });
}

function formatDateTime() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0"); // Monat korrigiert (+1)
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    
    // Tipp: Nutze Doppelpunkte für die Zeit, außer Dateinamen verbieten es
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

module.exports = { appendToLogs };
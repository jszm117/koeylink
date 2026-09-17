// ==============================================================
// CODE.GS - GOOGLE APPS SCRIPT WEB APP BACKEND DATABASE
// ==============================================================
// This script serves the Link Hub webpage, maintains the database using
// Google Sheets automatically, and supports live CRUD updates from the app.

const SPREADSHEET_NAME = "LinkHub_Database";
const ADMIN_PIN = "0115"; // Admin Password/PIN to authorize updates

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Koey Links | Managed Link Hub')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Automatically initializes or retrieves the correct Google Sheet database
function getOrCreateSheet() {
  let ss;
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    const file = files.next();
    ss = SpreadsheetApp.openById(file.getId());
  } else {
    // Create new sheet
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    const sheet = ss.getActiveSheet();
    sheet.setName("Links");
    // Headers
    sheet.appendRow(["id", "title", "url", "category", "clicks", "active"]);
    
    // Seed initial values
    const initialLinks = [
  {
    "id": "1782363834608",
    "title": "MC Analysis",
    "url": "https://docs.google.com/spreadsheets/d/1yELj0ZLpXJ_cnbxUshWNDISNVWJscdMdSTR3iGLlUYk/edit",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363805462",
    "title": "MC Scanner",
    "url": "https://sites.google.com/cch.edu.hk/mc-scanner/mc",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363789973",
    "title": "JPG to PDF",
    "url": "https://sites.google.com/cch.edu.hk/mc-scanner/jpg-to-pdf",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363761008",
    "title": "QR Code Generator",
    "url": "https://script.google.com/a/macros/cch.edu.hk/s/AKfycbwU3ktJLf9ImW-pwsmqbYXmA7D4gFPd_D8OhQtnPLLai6qmolneaSKyB7F5QkNJIDNpcw/exec",
    "category": "Admin",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363697343",
    "title": "Volume of Cones and Pyramids",
    "url": "https://sites.google.com/d/1WcjXq8NFPHRSrpD1dTX-VMgkfV41I-fQ/p/1Nm8pi3fUCS93Dm35O7YGc166Ha_Z7INH/edit",
    "category": "Teaching Resources",
    "clicks": 0,
    "active": true
  }
];
    initialLinks.forEach(function(link) {
      sheet.appendRow([
        link.id,
        link.title,
        link.url,
        link.category,
        link.clicks || 0,
        link.active ? "TRUE" : "FALSE"
      ]);
    });
    
    // Create an auxiliary sheet for Profile config
    const profileSheet = ss.insertSheet("Profile");
    profileSheet.appendRow(["key", "value"]);
    profileSheet.appendRow(["profileName", "Koey Links"]);
    profileSheet.appendRow(["profileBio", ""]);
  }
  return ss;
}

// Server method to fetch all live configuration and links
function getLiveDatabase() {
  try {
    const ss = getOrCreateSheet();
    const linkSheet = ss.getSheetByName("Links");
    const profileSheet = ss.getSheetByName("Profile") || ss.insertSheet("Profile");
    
    // Read Profile Information
    let name = "Koey Links";
    let bio = "";
    const profileData = profileSheet.getDataRange().getValues();
    profileData.forEach(function(row) {
      if (row[0] === "profileName") name = row[1];
      if (row[0] === "profileBio") bio = row[1];
    });

    // Read Links
    const linkData = linkSheet.getDataRange().getValues();
    const links = [];
    for (let i = 1; i < linkData.length; i++) {
      if (!linkData[i][0]) continue;
      links.push({
        id: linkData[i][0].toString(),
        title: linkData[i][1],
        url: linkData[i][2],
        category: linkData[i][3] || 'General',
        clicks: Number(linkData[i][4]) || 0,
        active: linkData[i][5] === true || linkData[i][5] === 'TRUE'
      });
    }

    return {
      profileName: name,
      profileBio: bio,
      links: links
    };
  } catch(e) {
    Logger.log("Error loading: " + e.toString());
    // Fallback static structure
    return {
      profileName: "Koey Links",
      profileBio: "",
      links: [
  {
    "id": "1782363834608",
    "title": "MC Analysis",
    "url": "https://docs.google.com/spreadsheets/d/1yELj0ZLpXJ_cnbxUshWNDISNVWJscdMdSTR3iGLlUYk/edit",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363805462",
    "title": "MC Scanner",
    "url": "https://sites.google.com/cch.edu.hk/mc-scanner/mc",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363789973",
    "title": "JPG to PDF",
    "url": "https://sites.google.com/cch.edu.hk/mc-scanner/jpg-to-pdf",
    "category": "Exam",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363761008",
    "title": "QR Code Generator",
    "url": "https://script.google.com/a/macros/cch.edu.hk/s/AKfycbwU3ktJLf9ImW-pwsmqbYXmA7D4gFPd_D8OhQtnPLLai6qmolneaSKyB7F5QkNJIDNpcw/exec",
    "category": "Admin",
    "clicks": 0,
    "active": true
  },
  {
    "id": "1782363697343",
    "title": "Volume of Cones and Pyramids",
    "url": "https://sites.google.com/d/1WcjXq8NFPHRSrpD1dTX-VMgkfV41I-fQ/p/1Nm8pi3fUCS93Dm35O7YGc166Ha_Z7INH/edit",
    "category": "Teaching Resources",
    "clicks": 0,
    "active": true
  }
]
    };
  }
}

// Server method to dynamically INSERT, UPDATE, or SAVE a link
function saveLinkLive(pin, linkData) {
  if (pin !== ADMIN_PIN) {
    throw new Error("Unauthorized: Invalid Admin PIN entered.");
  }
  
  const ss = getOrCreateSheet();
  const sheet = ss.getSheetByName("Links");
  const data = sheet.getDataRange().getValues();
  let foundRowIdx = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === linkData.id.toString()) {
      foundRowIdx = i + 1;
      break;
    }
  }
  
  if (foundRowIdx !== -1) {
    // Update existing row
    sheet.getRange(foundRowIdx, 2).setValue(linkData.title);
    sheet.getRange(foundRowIdx, 3).setValue(linkData.url);
    sheet.getRange(foundRowIdx, 4).setValue(linkData.category);
    sheet.getRange(foundRowIdx, 6).setValue(linkData.active ? "TRUE" : "FALSE");
  } else {
    // Append new row
    sheet.appendRow([
      linkData.id || Date.now().toString(),
      linkData.title,
      linkData.url,
      linkData.category,
      0,
      "TRUE"
    ]);
  }
  return getLiveDatabase();
}

// Server method to DELETE a link
function deleteLinkLive(pin, linkId) {
  if (pin !== ADMIN_PIN) {
    throw new Error("Unauthorized: Invalid Admin PIN.");
  }
  
  const ss = getOrCreateSheet();
  const sheet = ss.getSheetByName("Links");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === linkId.toString()) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return getLiveDatabase();
}

// Server method to update profile details live
function updateProfileLive(pin, name, bio) {
  if (pin !== ADMIN_PIN) {
    throw new Error("Unauthorized.");
  }
  
  const ss = getOrCreateSheet();
  const profileSheet = ss.getSheetByName("Profile");
  profileSheet.clear();
  profileSheet.appendRow(["key", "value"]);
  profileSheet.appendRow(["profileName", name]);
  profileSheet.appendRow(["profileBio", bio]);
  
  return getLiveDatabase();
}

// Increments live click count inside the sheet
function registerClick(linkId) {
  try {
    const ss = getOrCreateSheet();
    const sheet = ss.getSheetByName("Links");
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === linkId.toString()) {
        const currentClicks = Number(data[i][4]) || 0;
        sheet.getRange(i + 1, 5).setValue(currentClicks + 1);
        return true;
      }
    }
  } catch(e) {}
  return false;
}

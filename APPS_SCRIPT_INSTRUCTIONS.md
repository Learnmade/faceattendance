# Google Apps Script for Face Attendance

To store data in Google Sheets, follow these steps:

1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Columns: Date, Time, Name, Type (Check-In/Out), Shift, Verified
    sheet.appendRow([
      data.date,
      data.time,
      data.name,
      data.type,
      data.shift,
      data.verified
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy > New Deployment**.
5. Select **Type**: "Web App".
6. Set **Execute as**: "Me".
7. Set **Who has access**: "Anyone".
8. Click **Deploy** and copy the **Web App URL**.
9. Paste this URL into the application code where `SHEET_URL` is defined.

import fs from 'fs';
const filePath = 'c:\\Users\\ASUS\\Desktop\\clone1\\frontend\\src\\pages\\CustomerView.jsx';
try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log("File read successfully, length:", content.length);
    // Let's try to fix the line 246 specifically if it exists
    const lines = content.split('\n');
    console.log("Total lines:", lines.length);
    if (lines.length >= 246) {
        console.log("Line 246:", lines[245]);
        // Simple fix if line 246 is exactly as reported
        if (lines[245].includes("VERY ADVANCE LEVEL PRINT VIEW") && !lines[245].includes("}}>")) {
            lines[245] = lines[245].replace("alignItems: 'center'      {", "alignItems: 'center' }}>      {");
            console.log("Fixed Line 246:", lines[245]);
            fs.writeFileSync(filePath, lines.join('\n'));
            console.log("File saved.");
        } else {
            console.log("Line 246 doesn't seem to have the error, or already fixed.");
        }
    }
} catch (e) {
    console.error("Error:", e);
}

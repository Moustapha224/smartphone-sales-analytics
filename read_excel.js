const XLSX = require('xlsx');
const fs = require('fs');

try {
    const wb = XLSX.readFile('Samsung_sales.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);

    let out = "";
    out += "Total rows: " + data.length + "\n";
    out += "Headers: " + JSON.stringify(Object.keys(data[0])) + "\n\n";

    out += "--- First 5 rows ---\n";
    data.slice(0, 5).forEach((r, i) => { out += JSON.stringify(r) + "\n"; });

    out += "\n--- Last 3 rows ---\n";
    data.slice(-3).forEach((r, i) => { out += JSON.stringify(r) + "\n"; });

    // Unique values for all columns
    const headers = Object.keys(data[0]);
    headers.forEach(key => {
        const vals = [...new Set(data.map(r => r[key]).filter(v => v != null))].sort();
        out += "\n" + key + " (" + vals.length + " unique): " + JSON.stringify(vals.slice(0, 50)) + "\n";
    });

    // Export all data as JSON for sample-data generation
    out += "\n\n--- ALL DATA JSON ---\n";
    out += JSON.stringify(data, null, 0);

    fs.writeFileSync('excel_output.txt', out, 'utf8');
    console.log("Done - see excel_output.txt");
} catch (e) {
    fs.writeFileSync('excel_output.txt', 'ERROR: ' + e.message + '\n' + e.stack, 'utf8');
    console.log("Error - see excel_output.txt");
}

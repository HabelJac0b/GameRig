const fs = require('fs');
const { execSync } = require('child_process');
const { PDFParse } = require('./backend/node_modules/pdf-parse');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///c:/Users/hadan/.gemini/antigravity-ide/scratch/GameRig/documentation.html';
const pdfPath = 'c:\\Users\\hadan\\.gemini\\antigravity-ide\\scratch\\GameRig\\GameRig_Documentation.pdf';

const topics = [
    { num: '1', key: '1. Introduction' },
    { num: '1.1', key: '1.1 Objectives' },
    { num: '1.2', key: '1.2 Project Description' },
    { num: '2', key: '2. Phase I Database Design' },
    { num: '2.1', key: '2.1 Identification of Entities and Attributes' },
    { num: '2.2', key: '2.2 ER Diagram' },
    { num: '2.3', key: '2.3 Relational Schema' },
    { num: '2.4', key: '2.4 Normalization' },
    { num: '3', key: '3. Phase II Database Creation and Queries' },
    { num: '3.1', key: '3.1 Creating Tables Using SQL' },
    { num: '3.2', key: '3.2 Inserting and Updating Records' },
    { num: '3.3', key: '3.3 SQL Queries' },
    { num: '3.4', key: '3.4 Aggregate Functions' },
    { num: '4', key: '4. Phase III Data Querying Join and Views' },
    { num: '4.1', key: '4.1 Joins' },
    { num: '4.2', key: '4.2 Subqueries' },
    { num: '4.3', key: '4.3 Views' },
    { num: '4.4', key: '4.4 Functions and Procedures' },
    { num: '5', key: '5. Phase IV Transactions and Data Integrity' },
    { num: '5.1', key: '5.1 COMMIT, ROLLBACK and SAVEPOINT' },
    { num: '5.2', key: '5.2 Integrity Constraints' },
    { num: '5.3', key: '5.3 Concurrency Issues' },
    { num: '7', key: '7. Conclusion' },
    { num: '8', key: '8. References' },
    { num: '9', key: '9. Appendix' }
];

async function generatePdf() {
    const cmd = `"${chromePath}" --headless --disable-gpu --display-header-footer --header-template="<div style='font-size:8pt;color:#94a3b8;width:100%;text-align:right;padding-right:15mm;font-family:sans-serif;'>GameRig — Digital Game Library Management System (ADBMS)</div>" --footer-template="<div style='font-size:8pt;color:#94a3b8;width:100%;text-align:right;padding-right:15mm;font-family:sans-serif;'>Page <span class='pageNumber'></span> of <span class='totalPages'></span></div>" --print-to-pdf="${pdfPath}" "${htmlPath}"`;
    execSync(cmd, { stdio: 'inherit' });
}

async function findTopicPages() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    await parser.load();
    const textObj = await parser.getText();
    
    const pageMap = {};
    textObj.pages.forEach((p, idx) => {
        const pageNum = idx + 1;
        // Skip cover (page 1) and TOC (page 2)
        if (pageNum <= 2) return;
        const pageText = p.text || '';
        topics.forEach(t => {
            if (!pageMap[t.num] && pageText.includes(t.key)) {
                pageMap[t.num] = pageNum;
            }
        });
    });
    return pageMap;
}

async function main() {
    console.log('Generating Initial PDF...');
    await generatePdf();
    
    console.log('Detecting page numbers...');
    let pageMap = await findTopicPages();
    console.log('Detected mapping:', pageMap);
    
    // Update documentation.html with discovered page numbers
    let html = fs.readFileSync('documentation.html', 'utf-8');
    topics.forEach(t => {
        const p = pageMap[t.num] || '-';
        // Replace in TOC table
        // Format: <td class="toc-num">1.1</td> ... <td class="toc-page">...</td>
        const regex = new RegExp(`(<td class="toc-num">${t.num.replace('.', '\\.')}<\\/td>[\\s\\S]*?<td class="toc-page">)[^<]*(<\\/td>)`, 'g');
        html = html.replace(regex, `$1${p}$2`);
    });
    
    fs.writeFileSync('documentation.html', html, 'utf-8');
    
    console.log('Re-generating Final PDF with exact page numbers...');
    await generatePdf();
    console.log('Done! Final PDF created at:', pdfPath);
}

main().catch(console.error);

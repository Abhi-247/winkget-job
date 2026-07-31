const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Abhishek verma\\.gemini\\antigravity-ide\\brain\\ab49ba76-bbaa-4d2e-b3ac-c0594f7134aa\\hero_workspace_1785517670925.png";
const dest = path.join(__dirname, "public", "hero-workspace.png");

fs.copyFileSync(src, dest);
console.log("Image copied successfully to", dest);

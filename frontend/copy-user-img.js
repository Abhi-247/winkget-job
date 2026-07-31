const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Abhishek verma\\.gemini\\antigravity-ide\\brain\\ab49ba76-bbaa-4d2e-b3ac-c0594f7134aa\\media__1785519068175.png";
const dest = path.join(__dirname, "public", "hero-banner.png");

fs.copyFileSync(src, dest);
console.log("User media image copied successfully to", dest);

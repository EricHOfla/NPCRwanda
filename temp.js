const fs=require('fs');
const lines=fs.readFileSync('news.html','utf8').split('\n');
lines.forEach((line,i)= console.log(`${i+1}: ${line.trim()}`);});

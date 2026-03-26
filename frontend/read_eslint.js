const fs = require('fs');
try {
  let content = fs.readFileSync('eslint-report.json');
  if (content[0] === 0xFF && content[1] === 0xFE) {
    content = content.toString('utf16le');
  } else {
    content = content.toString('utf8');
  }
  
  if (content.startsWith('\uFEFF')) {
    content = content.slice(1);
  }
  
  // Sometimes npx prints "Need to install..." before JSON
  const jsonStart = content.indexOf('[');
  content = content.slice(jsonStart);

  const data = JSON.parse(content);
  data.forEach(file => {
    file.messages.forEach(msg => {
      if (msg.severity === 2) {
        console.log(`${file.filePath.split('frontend\\\\')[1] || file.filePath}:${msg.line} - ${msg.message} (${msg.ruleId})`);
      }
    });
  });
} catch(e) {
  console.log(e.message);
}

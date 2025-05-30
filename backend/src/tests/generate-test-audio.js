const { exec } = require('child_process');
const path = require('path');

// Check if say command is available (macOS)
const useSay = process.platform === 'darwin';

const testText = "Create a high priority task to review the project documentation by next Wednesday. Assign it to Mike and tag it as documentation and review.";
const outputFile = path.join(__dirname, 'test-audio.mp3');

if (useSay) {
  // macOS - use say command
  exec(`say "${testText}" -o "${outputFile}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error}`);
      return;
    }
    console.log(`Test audio file created at: ${outputFile}`);
  });
} else {
  console.log('This script currently only supports macOS. Please provide your own test audio file.');
} 
// Script to start the secure-auth-server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Secure Auth Server...');

// Start the secure-auth-server.js
const authServer = spawn('node', [path.join(__dirname, 'secure-auth-server.js')], {
  stdio: 'inherit'
});

authServer.on('error', (err) => {
  console.error('Failed to start secure auth server:', err);
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('Stopping Secure Auth Server...');
  authServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping Secure Auth Server...');
  authServer.kill('SIGTERM');
  process.exit(0);
});

authServer.on('close', (code) => {
  console.log(`Secure Auth Server exited with code ${code}`);
  process.exit(code);
});
// Health check script for Docker container
import http from 'http';

const options = {
  host: 'localhost',
  port: 5000,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR: Health check failed', err);
  process.exit(1);
});

request.on('timeout', () => {
  console.log('ERROR: Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
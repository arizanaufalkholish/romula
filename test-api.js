const http = require('http');

const payload = JSON.stringify({ email: 'demo@romula.app', password: 'romula123' });

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const auth = JSON.parse(body);
      const token = auth.data.token;
      console.log('Got token:', token ? 'YES' : 'NO');
      
      if (!token) {
        console.error('Auth response:', body);
        return;
      }
      
      const newsReq = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/news?search=&sortBy=createdAt&sortOrder=desc',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, newsRes => {
        let newsBody = '';
        newsRes.on('data', c => newsBody += c);
        newsRes.on('end', () => {
          console.log('News API Response:', newsBody);
        });
      });
      newsReq.end();
      
      const financeReq = http.request({
        hostname: 'localhost',
        port: 4000,
        path: '/api/finance?search=&sortBy=date&sortOrder=desc',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, finRes => {
        let finBody = '';
        finRes.on('data', c => finBody += c);
        finRes.on('end', () => {
          console.log('Finance API Response:', finBody);
        });
      });
      financeReq.end();

    } catch(e) { console.error('Error parsing auth:', e) }
  });
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();

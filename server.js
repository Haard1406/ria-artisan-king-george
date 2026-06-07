const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo123';
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, '[]', 'utf8');

const services = [
  {
    title: 'Send Money Worldwide',
    icon: '🌍',
    summary: 'Help customers prepare to send money to family, friends, or business contacts through Ria Money Transfer service availability.',
    details: ['Support for many international destinations through Ria network availability.', 'In-store help to understand required sender and receiver details.', 'Final rates, fees, limits, and delivery choices must be confirmed inside the official Ria system.']
  },
  {
    title: 'Cash Pickup Support',
    icon: '💸',
    summary: 'Many transfers may be collected as cash at Ria payout locations depending on country, partner, and compliance approval.',
    details: ['Receiver may need valid government ID.', 'Payout location and timing depend on destination.', 'Customer must keep the receipt/reference number safe.']
  },
  {
    title: 'Bank Deposit Information',
    icon: '🏦',
    summary: 'Where available, transfers may be sent directly to a receiver bank account.',
    details: ['Receiver name must match bank records.', 'Bank name, account number, and other local details may be required.', 'Processing time depends on country and bank partner.']
  },
  {
    title: 'Mobile Wallet Options',
    icon: '📲',
    summary: 'Some countries may support mobile wallet delivery through Ria partner options.',
    details: ['Wallet availability depends on destination.', 'Receiver phone number and wallet provider may be required.', 'Details must be checked before sending.']
  },
  {
    title: 'Customer Preparation Help',
    icon: '✅',
    summary: 'Customers can prepare the right information before visiting the store to reduce delays.',
    details: ['Bring valid ID.', 'Know exact receiver legal name.', 'Confirm destination country, city, phone number, and payout method.', 'Ask staff to confirm current rate, fee, and total before paying.']
  },
  {
    title: 'Receipt & Tracking Guidance',
    icon: '🧾',
    summary: 'Customers receive guidance to understand their receipt and reference number after a transfer.',
    details: ['Keep receipt private.', 'Share reference details only with the receiver.', 'Contact the store or Ria support if there is a transfer question.']
  }
];

const faqs = [
  { q: 'Can I send money from this store?', a: 'This website is for the Ria Money Transfer service offered at Artisan Smoke Shop King George. Visit or contact the store to confirm staff availability, current Ria system status, rates, fees, and destination options.' },
  { q: 'What do I need to bring?', a: 'Bring valid government-issued photo ID, your phone number, receiver full legal name, receiver country, city, phone number, and delivery method details such as cash pickup, bank account, or mobile wallet where available.' },
  { q: 'Are rates and fees shown on this website final?', a: 'No. Rates, fees, limits, timing, and payout options change and must be confirmed through Ria’s live system in-store before sending.' },
  { q: 'Can a receiver collect cash?', a: 'Cash pickup may be available depending on destination country, payout partner, transfer approval, and Ria availability.' },
  { q: 'Is bank deposit available?', a: 'Bank deposit may be available for selected destinations. Receiver bank details must be accurate and match the receiver legal name.' },
  { q: 'Can I use mobile wallet?', a: 'Mobile wallet delivery depends on the destination country and wallet partner. Staff can check availability in the official system.' },
  { q: 'How long does a transfer take?', a: 'Timing depends on destination, payout method, compliance review, local banking hours, partner availability, and transaction approval.' },
  { q: 'What if I made a mistake?', a: 'Contact the store or Ria support quickly. Corrections, cancellations, refunds, or changes depend on Ria policy and transfer status.' },
  { q: 'Is the website a real transfer processor?', a: 'No. This website provides information and collects customer requests. Actual money transfers are handled through official Ria systems and store staff.' }
];

const countries = ['India', 'Philippines', 'Mexico', 'Pakistan', 'Nepal', 'Bangladesh', 'Sri Lanka', 'Vietnam', 'United States', 'United Kingdom', 'Nigeria', 'Ghana', 'Kenya', 'UAE', 'Morocco'];

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Request too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function clean(input, max = 500) {
  return String(input || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function readLeads() {
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

function staticFile(reqPath, res) {
  let safePath = decodeURIComponent(reqPath.split('?')[0]);
  if (safePath === '/') safePath = '/index.html';
  const filePath = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!filePath.startsWith(PUBLIC_DIR)) return sendText(res, 403, 'Forbidden');
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return sendText(res, 404, 'Not found');
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  if (url.pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true, service: 'ria-artisan-king-george', time: new Date().toISOString(), port: PORT });
  }

  if (url.pathname === '/api/services' && req.method === 'GET') return sendJson(res, 200, services);
  if (url.pathname === '/api/faqs' && req.method === 'GET') return sendJson(res, 200, faqs);
  if (url.pathname === '/api/countries' && req.method === 'GET') return sendJson(res, 200, countries);

  if (url.pathname === '/api/contact' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const data = JSON.parse(raw || '{}');
      const lead = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        createdAt: new Date().toISOString(),
        name: clean(data.name, 80),
        phone: clean(data.phone, 40),
        email: clean(data.email, 120),
        destination: clean(data.destination, 80),
        method: clean(data.method, 80),
        amount: clean(data.amount, 40),
        message: clean(data.message, 700),
        source: 'website'
      };

      const phoneLike = lead.phone.replace(/[^0-9+]/g, '');
      if (!lead.name || lead.name.length < 2) return sendJson(res, 400, { ok: false, error: 'Please enter a valid name.' });
      if (!phoneLike || phoneLike.length < 7) return sendJson(res, 400, { ok: false, error: 'Please enter a valid phone number.' });
      if (!lead.destination) return sendJson(res, 400, { ok: false, error: 'Please enter the receiver destination country.' });

      const leads = readLeads();
      leads.unshift(lead);
      writeLeads(leads.slice(0, 500));
      return sendJson(res, 201, { ok: true, message: 'Request received. Store staff can review it from the admin page.', leadId: lead.id });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: 'Invalid request. Please try again.' });
    }
  }

  if (url.pathname === '/api/admin/leads' && req.method === 'GET') {
    const token = url.searchParams.get('token') || req.headers['x-admin-token'];
    if (token !== ADMIN_TOKEN) return sendJson(res, 401, { ok: false, error: 'Unauthorized admin token.' });
    return sendJson(res, 200, { ok: true, count: readLeads().length, leads: readLeads() });
  }

  return staticFile(url.pathname, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin token configured: ${ADMIN_TOKEN ? 'yes' : 'no'}`);
});

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'demo123';
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

const store = {
  businessName: 'Artisan Smoke Shop King George',
  serviceName: 'Ria Money Transfer',
  pageTitle: 'Ria Money Transfer at Artisan Smoke Shop King George',
  address: '9801 King George Blvd #201, Surrey, BC V3T 5H5',
  phone: '+16045891649',
  phoneDisplay: '(604) 589-1649',
  email: 'artisansmokeshop@gmail.com',
  hours: 'Open 24 hours, 7 days a week',
  mapQuery: 'Artisan Smoke Shop King George 9801 King George Blvd #201 Surrey BC',
  disclaimer: 'This website is an informational service page for customers. Actual transfers, rates, fees, limits, compliance checks, payout options, and delivery timing must be confirmed through Ria’s live system at the time of service.'
};

const services = [
  { icon: '🌍', title: 'International money transfer', description: 'Send money to loved ones and trusted recipients through Ria’s global transfer network, with in-store support from the King George location.', highlight: '190+ countries', audience: 'Families, students, workers, and everyday customers' },
  { icon: '💵', title: 'Cash pickup', description: 'Recipients may be able to pick up cash at a Ria payout partner, depending on country, transfer details, and availability.', highlight: '500,000+ pickup locations worldwide', audience: 'Urgent family support and emergency transfers' },
  { icon: '🏦', title: 'Bank deposit', description: 'Where supported, funds can be sent directly to a recipient’s bank account after the customer confirms accurate banking details.', highlight: 'Convenient account delivery', audience: 'Customers who prefer direct deposit' },
  { icon: '📲', title: 'Mobile wallet and digital payout', description: 'Some destinations may support mobile wallet or other digital payout options. Availability changes by country and partner network.', highlight: 'Digital-friendly option', audience: 'Younger customers and app-first recipients' },
  { icon: '🧾', title: 'Transfer tracking support', description: 'Customers receive a receipt with transfer details such as PIN or order number, which can be used to check transfer status.', highlight: 'Track with PIN/order number', audience: 'Customers who want peace of mind' },
  { icon: '🪪', title: 'ID and information checklist', description: 'The site helps customers prepare ID, recipient spelling, destination, payout method, and bank or wallet details before visiting.', highlight: 'Less confusion at the counter', audience: 'First-time senders and seniors' }
];

const countries = ['India','Philippines','Pakistan','Nepal','Bangladesh','Sri Lanka','Nigeria','Ghana','Kenya','Mexico','Colombia','Jamaica','Vietnam','United Kingdom','United States','Other / ask in store'];

const faqs = [
  { q: 'Is this website the actual Ria transfer system?', a: 'No. This is a customer information and request website for the store. Actual transfers, pricing, fees, exchange rates, limits, compliance checks, and availability must be confirmed through Ria’s official live system.' },
  { q: 'What should I bring to send money?', a: 'Bring valid government-issued photo ID, your active phone number, recipient full legal name, destination country, recipient phone number, and bank or wallet details if that payout method is selected.' },
  { q: 'Can I send money to India, Philippines, Pakistan, Nigeria, Mexico, or Nepal?', a: 'Ria supports many countries and corridors, but exact availability, payout method, fee, rate, and timing must be checked for the specific transfer at the time of service.' },
  { q: 'Can the recipient collect cash?', a: 'Cash pickup may be available depending on destination country, local Ria partners, receiver details, and compliance approval.' },
  { q: 'Can I send directly to a bank account?', a: 'Bank deposit may be available in supported countries. Customers must provide accurate recipient bank details before confirming the transfer.' },
  { q: 'Are mobile wallet transfers available?', a: 'Some destinations support mobile wallet or digital payout options. Availability depends on the country and Ria partner network.' },
  { q: 'How long does the money transfer take?', a: 'Timing varies by destination, payout method, payment method, local partner availability, and compliance checks. Always confirm the estimated timing before paying.' },
  { q: 'Are fees and exchange rates fixed?', a: 'No. Fees and exchange rates may change and depend on transfer amount, destination, payout method, payment method, and Ria’s live pricing.' },
  { q: 'How do I track my transfer?', a: 'Keep the receipt safe. Use the Ria PIN or order number from the receipt to check the status and update the recipient.' },
  { q: 'Is the King George location open 24/7?', a: 'The public Artisan Smoke Shop listing shows the King George location as open 24 hours, 7 days a week. For Ria-specific service availability, calling before visiting is recommended.' },
  { q: 'Can staff correct wrong recipient information after sending?', a: 'Corrections may not always be possible and can cause delays. Customers should carefully check spelling, country, phone, bank details, and payout method before payment.' },
  { q: 'Can I use this website to submit a request?', a: 'Yes. The request form saves your name, phone, destination, method, and note so the store can review it. It does not complete or reserve a transfer.' }
];

function sanitize(value, max = 200) {
  return String(value || '').trim().replace(/[<>]/g, '').slice(0, max);
}
function isValidPhone(value) {
  return /^[+()\-\s\d]{7,24}$/.test(String(value || '').trim());
}
function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}
async function ensureLeadsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(LEADS_FILE); } catch { await fs.writeFile(LEADS_FILE, '[]', 'utf8'); }
}
async function readLeads() {
  await ensureLeadsFile();
  const raw = await fs.readFile(LEADS_FILE, 'utf8');
  try { return JSON.parse(raw || '[]'); } catch { return []; }
}
async function writeLeads(leads) {
  await ensureLeadsFile();
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads.slice(0, 1000), null, 2), 'utf8');
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'ria-artisan-site', time: new Date().toISOString() }));
app.get('/api/store', (req, res) => res.json(store));
app.get('/api/services', (req, res) => res.json(services));
app.get('/api/faqs', (req, res) => res.json(faqs));
app.get('/api/countries', (req, res) => res.json(countries));

app.post('/api/contact', async (req, res) => {
  const lead = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    name: sanitize(req.body.name, 80),
    phone: sanitize(req.body.phone, 30),
    email: sanitize(req.body.email, 120),
    destination: sanitize(req.body.destination, 80),
    amount: sanitize(req.body.amount, 60),
    method: sanitize(req.body.method, 60),
    message: sanitize(req.body.message, 700),
    status: 'new',
    source: 'website-form'
  };

  const errors = [];
  if (!lead.name) errors.push('Name is required.');
  if (!lead.phone || !isValidPhone(lead.phone)) errors.push('A valid phone number is required.');
  if (!lead.destination) errors.push('Destination country is required.');
  if (!isValidEmail(lead.email)) errors.push('Email format looks incorrect.');
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const leads = await readLeads();
  leads.unshift(lead);
  await writeLeads(leads);
  res.json({ ok: true, message: 'Request saved. Please call or visit the store to confirm live Ria rates, fees, timing, limits, and final availability.', id: lead.id });
});

app.get('/api/admin/leads', async (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized. Add ?token=YOUR_ADMIN_TOKEN to view leads.' });
  const leads = await readLeads();
  res.json({ ok: true, total: leads.length, leads });
});

app.patch('/api/admin/leads/:id', async (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ ok: false, error: 'Unauthorized' });
  const leads = await readLeads();
  const lead = leads.find(item => item.id === req.params.id);
  if (!lead) return res.status(404).json({ ok: false, error: 'Lead not found' });
  lead.status = sanitize(req.body.status || lead.status, 40);
  lead.updatedAt = new Date().toISOString();
  await writeLeads(leads);
  res.json({ ok: true, lead });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

ensureLeadsFile().then(() => {
  app.listen(PORT, () => console.log(`Ria Artisan website running on http://localhost:${PORT}`));
});

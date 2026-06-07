const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

$('#year').textContent = new Date().getFullYear();
$('#menuBtn').addEventListener('click', () => $('#nav').classList.toggle('open'));
$$('.nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));

async function getJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error('Load failed'); return r.json(); }

async function loadServices(){
  const grid = $('#serviceGrid');
  try{
    const services = await getJSON('/api/services');
    grid.innerHTML = services.map(s => `<article class="service-card"><div class="icon">${s.icon}</div><h3>${s.title}</h3><p>${s.summary}</p><ul>${s.details.map(d=>`<li>${d}</li>`).join('')}</ul></article>`).join('');
  }catch{ grid.innerHTML = '<p>Services are temporarily unavailable. Please refresh.</p>'; }
}

let allFaqs = [];
function renderFaqs(list){
  $('#faqList').innerHTML = list.map((f,i)=>`<article class="faq-item"><button type="button">${f.q}<span>+</span></button><p>${f.a}</p></article>`).join('');
  $$('.faq-item button').forEach(btn => btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open')));
}
async function loadFaqs(){ allFaqs = await getJSON('/api/faqs'); renderFaqs(allFaqs); }
$('#faqSearch').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderFaqs(allFaqs.filter(f => `${f.q} ${f.a}`.toLowerCase().includes(q)));
});

async function loadCountries(){
  const countries = await getJSON('/api/countries');
  $('#countryList').innerHTML = countries.map(c=>`<option value="${c}"></option>`).join('');
}

$('#planBtn').addEventListener('click', () => {
  const dest = $('#destInput').value.trim() || 'your destination';
  const method = $('#methodInput').value;
  $('#planOutput').innerHTML = `<strong>Your quick checklist for ${dest}:</strong><ol><li>Bring valid government photo ID.</li><li>Confirm receiver full legal name exactly as shown on ID/bank/wallet.</li><li>Ask store staff to check if ${method} is available for ${dest}.</li><li>Confirm live rate, fee, estimated delivery time, limits, and total before paying.</li><li>Keep receipt safe and share reference details only with the receiver.</li></ol>`;
});

$('#contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#formMsg');
  msg.textContent = 'Submitting...';
  const data = Object.fromEntries(new FormData(e.target).entries());
  try{
    const res = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    const out = await res.json();
    if(!res.ok) throw new Error(out.error || 'Could not submit.');
    msg.textContent = '✅ Request saved. Staff can check it on the admin page.';
    e.target.reset();
  }catch(err){ msg.textContent = '⚠️ ' + err.message; }
});

loadServices(); loadFaqs(); loadCountries();

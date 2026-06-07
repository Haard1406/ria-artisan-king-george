const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const api = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.errors ? data.errors.join(' ') : (data.error || 'Something went wrong. Please call the store.');
    throw new Error(message);
  }
  return data;
};

$('#year').textContent = new Date().getFullYear();

const nav = $('#nav');
const menuToggle = $('#menuToggle');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

$('#purposeGrid').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-purpose]');
  if (!button) return;
  $$('#purposeGrid button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  $('#selectedPurpose').textContent = `${button.dataset.purpose}: bring ID, confirm recipient spelling, and ask staff to confirm live Ria rates and timing.`;
  $('#progressLine').style.width = '72%';
});

async function loadServices() {
  const services = await api('/api/services');
  $('#serviceGrid').innerHTML = services.map(service => `
    <article class="service-card reveal visible">
      <div class="icon" aria-hidden="true">${service.icon}</div>
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      <span class="badge">${service.highlight}</span>
      <p class="audience">Best for: ${service.audience}</p>
    </article>
  `).join('');
}

async function loadCountries() {
  const countries = await api('/api/countries');
  $('#countrySelect').innerHTML = countries.map(country => `<option>${country}</option>`).join('');
}

async function loadFaqs() {
  const faqs = await api('/api/faqs');
  const render = (items) => {
    $('#faqList').innerHTML = items.length ? items.map((item, index) => `
      <article class="faq-item">
        <button type="button" aria-expanded="false">
          <span>${item.q}</span><span aria-hidden="true">+</span>
        </button>
        <div class="faq-answer">${item.a}</div>
      </article>
    `).join('') : '<p class="form-status">No FAQ matched your search. Try another keyword or call the store.</p>';
  };
  render(faqs);
  $('#faqSearch').addEventListener('input', (event) => {
    const keyword = event.target.value.toLowerCase().trim();
    render(faqs.filter(item => `${item.q} ${item.a}`.toLowerCase().includes(keyword)));
  });
}

$('#faqList').addEventListener('click', (event) => {
  const button = event.target.closest('.faq-item button');
  if (!button) return;
  const item = button.closest('.faq-item');
  item.classList.toggle('open');
  const open = item.classList.contains('open');
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('span:last-child').textContent = open ? '−' : '+';
});

$('#buildChecklist').addEventListener('click', () => {
  const country = $('#countrySelect').value;
  const method = $('#deliverySelect').value;
  const amount = $('#amountInput').value.trim() || 'your chosen amount';
  $('#smartResult').innerHTML = `For <strong>${country}</strong>, bring valid ID, your phone number, recipient legal name, recipient phone number, and details needed for <strong>${method}</strong>. Ask the store to confirm live fee, exchange rate, payout availability, estimated timing, and final total for <strong>${amount}</strong>.`;
});

const checkboxes = $$('#checkGrid input[type="checkbox"]');
function updateCheckProgress() {
  const done = checkboxes.filter(item => item.checked).length;
  $('#checkProgress').textContent = `${done} of ${checkboxes.length} completed`;
}
checkboxes.forEach(item => item.addEventListener('change', updateCheckProgress));
updateCheckProgress();

$('#contactForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target).entries());
  $('#formStatus').textContent = 'Saving request...';
  try {
    const result = await api('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    $('#formStatus').textContent = result.message;
    event.target.reset();
  } catch (error) {
    $('#formStatus').textContent = error.message;
  }
});

Promise.all([loadServices(), loadCountries(), loadFaqs()]).catch(() => {
  $('#serviceGrid').innerHTML = '<p class="form-status">The website is online, but service data could not load. Please refresh or call the store.</p>';
});

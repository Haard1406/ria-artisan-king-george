# Ria Money Transfer at Artisan Smoke Shop King George

A professional full-stack demo website for the Ria Money Transfer service page at Artisan Smoke Shop King George in Surrey, BC.

## Main features

- Fully responsive layout for phone, tablet, laptop, and desktop
- Modern Gen Z-friendly design while still simple for all age groups
- Node.js + Express backend
- Dynamic services loaded from `/api/services`
- Dynamic FAQ loaded from `/api/faqs`
- Contact/request form saved to `data/leads.json`
- Admin leads API and admin page
- Google Maps embed and directions button
- Click-to-call and email links
- Transfer preparation planner
- Customer checklist with progress count
- Basic input validation and sanitization
- Render free hosting config included

## Local run

Install Node.js 18 or newer.

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Admin page:

```text
http://localhost:3000/admin.html
```

Default token:

```text
demo123
```

Admin API:

```text
http://localhost:3000/api/admin/leads?token=demo123
```

## Recommended demo setup for manager/owner

Before showing the demo, use a stronger admin token.

Mac/Linux:

```bash
ADMIN_TOKEN=yourStrongPassword npm start
```

Windows PowerShell:

```powershell
$env:ADMIN_TOKEN="yourStrongPassword"; npm start
```

Then open:

```text
http://localhost:3000/admin.html
```

## Free deployment on Render

1. Create a free GitHub account if needed.
2. Create a new public GitHub repository.
3. Upload all files from this folder, not the zip file only.
4. Go to Render and create a new Web Service.
5. Connect the GitHub repository.
6. Use these settings:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
```

7. Add environment variable:

```text
ADMIN_TOKEN = choose-a-strong-password
```

8. Deploy. Render will provide a free URL such as:

```text
https://ria-artisan-king-george.onrender.com
```

## Important business/legal note

This website does not process money transfers. It is a customer information and lead/request website only. Actual Ria transfers, rates, fees, limits, payout methods, compliance checks, and timing must be confirmed through the official Ria system in-store at the time of service.

## Public information used in the site

- Artisan Smoke Shop King George address: 9801 King George Blvd #201, Surrey, BC V3T 5H5
- Public phone listing: +1 604-589-1649
- Public hours listing: open 24 hours, 7 days a week
- Ria Canada publicly states it supports sending to 190+ countries and cash pickup at more than 500,000 locations worldwide.

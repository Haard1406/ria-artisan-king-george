# Ria Artisan King George Website - V5 Zero Dependency

This is a dynamic frontend + backend website with **no external npm dependencies**. It avoids Render `express` install errors and runs using Node's built-in HTTP server.

## Local run
npm start
Open http://localhost:3000

## Render settings
Build Command: leave blank OR use `echo "No build needed"`
Start Command: `npm start`
Environment Variables:
NODE_VERSION=20
ADMIN_TOKEN=demo123

## Test URLs
/ - website
/admin.html - admin page
/api/health - backend health
/api/services - service cards
/api/faqs - FAQ
/api/countries - country list
/api/admin/leads?token=demo123 - leads JSON

## Important
This website collects customer requests and explains Ria service preparation. It does not process real money transfers. Final rates, fees, timing, limits, and compliance decisions must be checked through the official Ria system in-store.

# Kora | Business Control Room

Kora is a React, TypeScript, and Vite dashboard prototype for reviewing example financial, sales and marketing, operations, team, and strategic-growth indicators. Every figure and activity shown in the dashboard is synthetic sample data. The prototype is not connected to a business, accounting, customer, staff, or other live system and must not be used to make operational or financial decisions.

## Run locally

Requirements: Node.js 22.13+ and npm.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. In Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if script execution policy blocks `npm`.

## Dashboard prototype

- Review synthetic revenue, pipeline, operating-margin, and satisfaction indicators.
- Change the chart's displayed time period and explore the financial, sales, operations, team, and growth sections.
- Export a CSV containing clearly illustrative sample metrics.
- Use the responsive navigation on smaller screens.

The indicators, team labels, activities, objectives, and exported report are hard-coded examples. They do not represent verified business performance, real people, or real organizations, and they are not personalized or connected to live services. Dashboard access uses the existing SQLite-backed account API: users can register with a name, email, and password or sign in with an existing account. Passwords are stored as scrypt hashes and sign-in sessions use an HttpOnly cookie. The account feature is a prototype, not a production identity system. Use synthetic test names, email addresses, and passwords only; do not enter real financial, customer, staff, citizen, or other sensitive information.

## Existing demo components

The Node server and SQLite database in this repository retain the earlier Imboni public-service catalogue API and sample records. They are not connected to the Kora dashboard UI. The catalogue's records are illustrative and are not official or verified information. Its API still supports account registration and sign-in; use synthetic test names, email addresses, and passwords only. The SQLite database stores account details and password hashes, and the server can record opened catalogue links. Do not enter identity numbers, application documents, or other personal or sensitive information. The local database is not configured for production-grade protection.

The sample catalogue is initialized from `database/schema.sql` in `data/imboni.sqlite`. Set `DATABASE_PATH` to choose another SQLite file. The data directory is not intended for committing database files.

## Host a public demo on Render

The included `render.yaml` defines a Node web service with persistent SQLite storage. Connect this repository to Render and create a Blueprint from it to deploy. Review the selected service and disk pricing before applying the Blueprint; persistent storage may incur charges.

The hosted database is initialized with the synthetic catalogue sample from `database/schema.sql`; it does not upload or copy your local `data/imboni.sqlite`. The Kora dashboard still uses hard-coded sample data and is not connected to the hosted database or its catalogue API. This project has not been reviewed or configured for production use with real personal data. Before exposing any of the legacy account or catalogue functionality, obtain appropriate security and privacy reviews and configure secure transport, storage, backups, monitoring, and database access controls.

The separate `voting/` folder contains a local Flask demonstration of a registration, sign-in, age-eligibility, and one-time sample ballot flow. It is not connected to the Kora dashboard or the Node server. Candidate names and ballot records are synthetic; this is not an official voting service or secure election system.

To run it locally, install Flask with `python -m pip install -r voting/requirements.txt`, then start it with `python voting/app.py`. Open `http://127.0.0.1:5000`. Accounts must be at least 18 years old to open or submit a ballot; age is checked on the server. Candidate names and votes are synthetic examples stored in `voting/voting.sqlite3`. To run its tests, use `python -m unittest discover -s voting -p "test_*.py"`. Before any deployment, configure a strong `FLASK_SECRET_KEY`, enable HTTPS and secure cookies with `COOKIE_SECURE=true`, and obtain appropriate security, privacy, accessibility, and legal reviews.

## Build

```bash
npm run dev
npm run build
npm run preview
npm run start
```

- `npm run dev` starts the local API, SQLite database, and Vite development server.
- `npm run build` type-checks the app and creates a production build in `dist/`.
- `npm run preview` serves the production build and API locally after building.
- `npm run start` starts the production server; run `npm run build` first.

A successful build does not make this prototype suitable for production use. Real integrations or real financial, customer, staff, or citizen data require explicit authorization, suitable privacy and security design, accessibility review, and validation of every data source.

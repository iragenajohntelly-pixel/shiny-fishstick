PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'kin'
    CHECK (preferred_language IN ('kin', 'en')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_kin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_catalogue (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  title_en TEXT NOT NULL,
  title_kin TEXT NOT NULL,
  requirements_en TEXT NOT NULL,
  requirements_kin TEXT NOT NULL,
  fee_rwf INTEGER NOT NULL CHECK (fee_rwf >= 0),
  processing_days INTEGER NOT NULL CHECK (processing_days >= 0),
  irembo_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'verified')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES service_catalogue(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action = 'irembo_link_opened'),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_activity_user_created
  ON service_activity(user_id, created_at DESC);

INSERT INTO categories (id, name_en, name_kin) VALUES
  ('GOV_CIVIL', 'Civil Status & Identification', 'Ibyerekeye irangamimerere n’indangamuntu'),
  ('JUSTICE', 'Justice & Legal Affairs', 'Ubutabera n’amategeko'),
  ('TRANSPORT', 'Transport & Vehicles', 'Ibinyabiziga n’ingendo'),
  ('LAND', 'Land Registration', 'Ibyerekeye ubutaka')
ON CONFLICT(id) DO UPDATE SET
  name_en = excluded.name_en,
  name_kin = excluded.name_kin;

INSERT INTO service_catalogue (
  id, category_id, title_en, title_kin,
  requirements_en, requirements_kin,
  fee_rwf, processing_days, irembo_url, verification_status
) VALUES
  (
    'SRV_CRIM_01', 'JUSTICE',
    'Criminal Record Certificate', 'Icyemezo cy’uko umuntu atahamwe n’icyaha',
    'Valid National ID or Passport; phone number or email.',
    'Indangamuntu cyangwa pasiporo yemewe; nomero ya telefone cyangwa imeli.',
    1200, 1, 'https://irembo.gov.rw/home/citizen/all_services', 'unverified'
  ),
  (
    'SRV_BIRTH_01', 'GOV_CIVIL',
    'Birth Certificate', 'Icyemezo cy’amavuko',
    'Child details; National ID numbers of parents.',
    'Amakuru y’umwana; nomero z’indangamuntu z’ababyeyi.',
    500, 1, 'https://irembo.gov.rw/home/citizen/all_services', 'unverified'
  ),
  (
    'SRV_DRIVE_PROV', 'TRANSPORT',
    'Provisional Driving License Exam', 'Ikizamini cy’uruhushya rw’agateganyo rwo gutwara ibinyabiziga',
    'Age 18+; National ID card; valid phone number.',
    'Kuba ufite nibura imyaka 18; indangamuntu; nomero ya telefone ikora.',
    5000, 1, 'https://irembo.gov.rw/home/citizen/all_services', 'unverified'
  ),
  (
    'SRV_DRIVE_PERM', 'TRANSPORT',
    'Permanent Driving License Registration', 'Kwiyandikisha ku ruhushya rwa burundu rwo gutwara ibinyabiziga',
    'Passed provisional test record; passport photo metadata.',
    'Icyemezo cy’uko watsinze ikizamini cy’agateganyo; amakuru ajyanye n’ifoto ya pasiporo.',
    50000, 14, 'https://irembo.gov.rw/home/citizen/all_services', 'unverified'
  ),
  (
    'SRV_LAND_TRANS', 'LAND',
    'Voluntary Land Title Transfer', 'Ihererekanya ry’uburenganzira ku butaka ku bushake',
    'Unique UPI number; National ID of both buyer and seller.',
    'Nomero yihariye y’ubutaka (UPI); indangamuntu z’umuguzi n’ugurisha.',
    27000, 7, 'https://irembo.gov.rw/home/citizen/all_services', 'unverified'
  )
ON CONFLICT(id) DO UPDATE SET
  category_id = excluded.category_id,
  title_en = excluded.title_en,
  title_kin = excluded.title_kin,
  requirements_en = excluded.requirements_en,
  requirements_kin = excluded.requirements_kin,
  fee_rwf = excluded.fee_rwf,
  processing_days = excluded.processing_days,
  irembo_url = excluded.irembo_url,
  verification_status = excluded.verification_status,
  updated_at = CURRENT_TIMESTAMP;

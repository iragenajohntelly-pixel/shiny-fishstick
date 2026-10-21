CREATE DATABASE IF NOT EXISTS rwanda_ai_dss;
USE rwanda_ai_dss;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  count INT NOT NULL,
  share INT NOT NULL,
  color ENUM('green','ochre','blue','sage') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(20) PRIMARY KEY,
  service_id INT NOT NULL,
  days_open INT NOT NULL,
  target_days INT NOT NULL,
  risk_level ENUM('High','Medium','Low') NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS case_factors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL,
  factor_label VARCHAR(100) NOT NULL,
  factor_value VARCHAR(255) NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  INDEX idx_case_factors_case_id (case_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(20) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id),
  INDEX idx_reviews_case_id (case_id)
);

INSERT INTO services (name, count, share, color) VALUES
  ('Business registration', 412, 32, 'green'),
  ('Land administration', 338, 26, 'ochre'),
  ('Permit applications', 291, 23, 'blue'),
  ('Civil documentation', 243, 19, 'sage')
ON DUPLICATE KEY UPDATE
  count = VALUES(count),
  share = VALUES(share),
  color = VALUES(color);

INSERT INTO cases (id, service_id, days_open, target_days, risk_level, status) VALUES
  ('RW-BR-2048', 1, 18, 14, 'High', 'Awaiting review'),
  ('RW-LA-1982', 2, 12, 15, 'Medium', 'In progress'),
  ('RW-PA-2156', 3, 21, 20, 'High', 'Awaiting documents'),
  ('RW-CD-1874', 4, 6, 10, 'Low', 'In progress'),
  ('RW-BR-2091', 1, 15, 14, 'Medium', 'In progress'),
  ('RW-LA-2015', 2, 23, 15, 'High', 'Awaiting review')
ON DUPLICATE KEY UPDATE
  service_id = VALUES(service_id),
  days_open = VALUES(days_open),
  target_days = VALUES(target_days),
  risk_level = VALUES(risk_level),
  status = VALUES(status);

INSERT INTO case_factors (case_id, factor_label, factor_value) VALUES
  ('RW-BR-2048', 'Time against target', '4 days overdue'),
  ('RW-BR-2048', 'Open workload', 'Above weekly range'),
  ('RW-BR-2048', 'Data confidence', 'Moderate'),
  ('RW-LA-1982', 'Time against target', '3 days remaining'),
  ('RW-LA-1982', 'Open workload', 'Elevated'),
  ('RW-LA-1982', 'Data confidence', 'Moderate'),
  ('RW-PA-2156', 'Time against target', '1 day overdue'),
  ('RW-PA-2156', 'Queue volume', 'Above weekly range'),
  ('RW-PA-2156', 'Data confidence', 'Low'),
  ('RW-CD-1874', 'Time against target', '4 days remaining'),
  ('RW-CD-1874', 'Open workload', 'Within weekly range'),
  ('RW-CD-1874', 'Data confidence', 'High'),
  ('RW-BR-2091', 'Time against target', '1 day overdue'),
  ('RW-BR-2091', 'Open workload', 'Above weekly range'),
  ('RW-BR-2091', 'Data confidence', 'Moderate'),
  ('RW-LA-2015', 'Time against target', '8 days overdue'),
  ('RW-LA-2015', 'Open workload', 'Elevated'),
  ('RW-LA-2015', 'Data confidence', 'Moderate')
ON DUPLICATE KEY UPDATE
  factor_value = VALUES(factor_value);

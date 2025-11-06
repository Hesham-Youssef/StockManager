
INSERT INTO stock (name, description, current_price, last_update) VALUES
('Apple Inc.', 'Technology company that designs, manufactures, and markets consumer electronics and software.', 192.45, CURRENT_TIMESTAMP),
('Microsoft Corp.', 'Global leader in software, cloud computing, and AI solutions.', 345.22, CURRENT_TIMESTAMP),
('Tesla Inc.', 'Electric vehicle and clean energy company.', 248.77, CURRENT_TIMESTAMP),
('Amazon.com Inc.', 'E-commerce and cloud computing giant.', 134.89, CURRENT_TIMESTAMP),
('Alphabet Inc.', 'Parent company of Google, specializing in internet and AI technologies.', 141.05, CURRENT_TIMESTAMP),
('NVIDIA Corp.', 'Leading manufacturer of GPUs for gaming and AI.', 468.32, CURRENT_TIMESTAMP),
('Meta Platforms Inc.', 'Social media and virtual reality company (Facebook, Instagram, etc.).', 310.40, CURRENT_TIMESTAMP),
('Intel Corp.', 'Semiconductor manufacturer focused on CPUs and data center technologies.', 43.10, CURRENT_TIMESTAMP),
('Saudi Aramco', 'Saudi Arabian national petroleum and natural gas company.', 55.30, CURRENT_TIMESTAMP),
('IBM Corp.', 'Enterprise software, consulting, and cloud computing company.', 172.14, CURRENT_TIMESTAMP),
('Oracle Corp.', 'Enterprise software and database company.', 125.18, CURRENT_TIMESTAMP),
('Cisco Systems Inc.', 'Networking hardware and telecommunications equipment provider.', 52.67, CURRENT_TIMESTAMP),
('Adobe Inc.', 'Software company best known for Photoshop and Acrobat.', 568.44, CURRENT_TIMESTAMP),
('Broadcom Inc.', 'Semiconductor and infrastructure software company.', 921.12, CURRENT_TIMESTAMP),
('Qualcomm Inc.', 'Wireless telecommunications and chip manufacturer.', 129.40, CURRENT_TIMESTAMP);

-- =========================
-- EXCHANGE SEED DATA
-- =========================

INSERT INTO stock_exchange (name, description, live_in_market) VALUES
('New York Stock Exchange', 'World’s largest stock exchange by market capitalization.', TRUE),
('NASDAQ', 'U.S.-based exchange specializing in technology and growth companies.', TRUE),
('London Stock Exchange', 'Primary stock exchange in the United Kingdom.', TRUE),
('Tokyo Stock Exchange', 'Japan’s main stock exchange.', FALSE),
('Saudi Exchange (Tadawul)', 'Saudi Arabia’s main stock exchange.', FALSE);

-- =========================
-- STOCK-EXCHANGE LINKS
-- =========================

-- NYSE
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'New York Stock Exchange' AND s.name IN (
  'Apple Inc.', 'Microsoft Corp.', 'Tesla Inc.', 'Amazon.com Inc.', 'IBM Corp.',
  'Intel Corp.', 'Oracle Corp.', 'Cisco Systems Inc.', 'Adobe Inc.', 'Broadcom Inc.'
);

-- NASDAQ
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'NASDAQ' AND s.name IN (
  'Apple Inc.', 'Microsoft Corp.', 'Tesla Inc.', 'Amazon.com Inc.', 'Alphabet Inc.',
  'NVIDIA Corp.', 'Meta Platforms Inc.', 'Qualcomm Inc.', 'Adobe Inc.', 'Broadcom Inc.'
);

-- LSE
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'London Stock Exchange' AND s.name IN (
  'IBM Corp.', 'Microsoft Corp.', 'Oracle Corp.', 'Cisco Systems Inc.', 'Intel Corp.',
  'Apple Inc.', 'NVIDIA Corp.', 'Amazon.com Inc.', 'Tesla Inc.', 'Broadcom Inc.'
);

-- Tokyo SE
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'Tokyo Stock Exchange' AND s.name IN (
  'Apple Inc.', 'Tesla Inc.', 'NVIDIA Corp.', 'Intel Corp.'
);

-- Tadawul
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'Saudi Exchange (Tadawul)' AND s.name IN (
  'Saudi Aramco', 'Apple Inc.', 'Microsoft Corp.', 'IBM Corp.'
);

-- =========================
-- STOCK PRICE HISTORY
-- =========================
INSERT INTO stock_price_history (stock_id, price, timestamp)
SELECT s.id,
       CASE s.name
         WHEN 'Apple Inc.' THEN s.current_price * 0.92
         WHEN 'Microsoft Corp.' THEN s.current_price * 0.94
         WHEN 'Tesla Inc.' THEN s.current_price * 0.90
         WHEN 'Amazon.com Inc.' THEN s.current_price * 0.93
         WHEN 'Alphabet Inc.' THEN s.current_price * 0.95
         WHEN 'NVIDIA Corp.' THEN s.current_price * 0.97
         WHEN 'Meta Platforms Inc.' THEN s.current_price * 0.96
         WHEN 'Intel Corp.' THEN s.current_price * 0.91
         WHEN 'Saudi Aramco' THEN s.current_price * 0.94
         WHEN 'IBM Corp.' THEN s.current_price * 0.95
         WHEN 'Oracle Corp.' THEN s.current_price * 0.96
         WHEN 'Cisco Systems Inc.' THEN s.current_price * 0.92
         WHEN 'Adobe Inc.' THEN s.current_price * 0.97
         WHEN 'Broadcom Inc.' THEN s.current_price * 0.98
         WHEN 'Qualcomm Inc.' THEN s.current_price * 0.95
       END AS price,
       DATEADD('DAY', -5, CURRENT_TIMESTAMP)
FROM stock s;

-- 3 days ago
INSERT INTO stock_price_history (stock_id, price, timestamp)
SELECT s.id,
       CASE s.name
         WHEN 'Apple Inc.' THEN s.current_price * 0.94
         WHEN 'Microsoft Corp.' THEN s.current_price * 0.96
         WHEN 'Tesla Inc.' THEN s.current_price * 0.92
         WHEN 'Amazon.com Inc.' THEN s.current_price * 0.95
         WHEN 'Alphabet Inc.' THEN s.current_price * 0.97
         WHEN 'NVIDIA Corp.' THEN s.current_price * 0.99
         WHEN 'Meta Platforms Inc.' THEN s.current_price * 0.98
         WHEN 'Intel Corp.' THEN s.current_price * 0.93
         WHEN 'Saudi Aramco' THEN s.current_price * 0.96
         WHEN 'IBM Corp.' THEN s.current_price * 0.97
         WHEN 'Oracle Corp.' THEN s.current_price * 0.98
         WHEN 'Cisco Systems Inc.' THEN s.current_price * 0.94
         WHEN 'Adobe Inc.' THEN s.current_price * 0.99
         WHEN 'Broadcom Inc.' THEN s.current_price * 1.00
         WHEN 'Qualcomm Inc.' THEN s.current_price * 0.97
       END AS price,
       DATEADD('DAY', -3, CURRENT_TIMESTAMP)
FROM stock s;

-- 2 days ago
INSERT INTO stock_price_history (stock_id, price, timestamp)
SELECT s.id,
       CASE s.name
         WHEN 'Apple Inc.' THEN s.current_price * 0.95
         WHEN 'Microsoft Corp.' THEN s.current_price * 0.97
         WHEN 'Tesla Inc.' THEN s.current_price * 0.94
         WHEN 'Amazon.com Inc.' THEN s.current_price * 0.96
         WHEN 'Alphabet Inc.' THEN s.current_price * 0.98
         WHEN 'NVIDIA Corp.' THEN s.current_price * 1.01
         WHEN 'Meta Platforms Inc.' THEN s.current_price * 0.99
         WHEN 'Intel Corp.' THEN s.current_price * 0.94
         WHEN 'Saudi Aramco' THEN s.current_price * 0.97
         WHEN 'IBM Corp.' THEN s.current_price * 0.98
         WHEN 'Oracle Corp.' THEN s.current_price * 0.99
         WHEN 'Cisco Systems Inc.' THEN s.current_price * 0.95
         WHEN 'Adobe Inc.' THEN s.current_price * 1.00
         WHEN 'Broadcom Inc.' THEN s.current_price * 1.01
         WHEN 'Qualcomm Inc.' THEN s.current_price * 0.98
       END AS price,
       DATEADD('DAY', -2, CURRENT_TIMESTAMP)
FROM stock s;

-- 1 day ago
INSERT INTO stock_price_history (stock_id, price, timestamp)
SELECT s.id,
       CASE s.name
         WHEN 'Apple Inc.' THEN s.current_price * 0.97
         WHEN 'Microsoft Corp.' THEN s.current_price * 0.98
         WHEN 'Tesla Inc.' THEN s.current_price * 0.96
         WHEN 'Amazon.com Inc.' THEN s.current_price * 0.98
         WHEN 'Alphabet Inc.' THEN s.current_price * 1.00
         WHEN 'NVIDIA Corp.' THEN s.current_price * 1.02
         WHEN 'Meta Platforms Inc.' THEN s.current_price * 1.01
         WHEN 'Intel Corp.' THEN s.current_price * 0.96
         WHEN 'Saudi Aramco' THEN s.current_price * 0.98
         WHEN 'IBM Corp.' THEN s.current_price * 0.99
         WHEN 'Oracle Corp.' THEN s.current_price * 1.00
         WHEN 'Cisco Systems Inc.' THEN s.current_price * 0.97
         WHEN 'Adobe Inc.' THEN s.current_price * 1.02
         WHEN 'Broadcom Inc.' THEN s.current_price * 1.03
         WHEN 'Qualcomm Inc.' THEN s.current_price * 1.00
       END AS price,
       DATEADD('DAY', -1, CURRENT_TIMESTAMP)
FROM stock s;

-- Today
INSERT INTO stock_price_history (stock_id, price, timestamp)
SELECT s.id, s.current_price, CURRENT_TIMESTAMP
FROM stock s;
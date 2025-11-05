-- =========================
-- STOCK TABLE SEED DATA
-- =========================
INSERT INTO stock (name, description, current_price, last_update, version) VALUES
('Apple Inc.', 'Technology company that designs, manufactures, and markets consumer electronics and software.', 192.45, CURRENT_TIMESTAMP, 1),
('Microsoft Corp.', 'Global leader in software, cloud computing, and AI solutions.', 345.22, CURRENT_TIMESTAMP, 1),
('Tesla Inc.', 'Electric vehicle and clean energy company.', 248.77, CURRENT_TIMESTAMP, 1),
('Amazon.com Inc.', 'E-commerce and cloud computing giant.', 134.89, CURRENT_TIMESTAMP, 1),
('Alphabet Inc.', 'Parent company of Google, specializing in internet and AI technologies.', 141.05, CURRENT_TIMESTAMP, 1),
('NVIDIA Corp.', 'Leading manufacturer of GPUs for gaming and AI.', 468.32, CURRENT_TIMESTAMP, 1),
('Meta Platforms Inc.', 'Social media and virtual reality company (Facebook, Instagram, etc.).', 310.40, CURRENT_TIMESTAMP, 1),
('Intel Corp.', 'Semiconductor manufacturer focused on CPUs and data center technologies.', 43.10, CURRENT_TIMESTAMP, 1),
('Saudi Aramco', 'Saudi Arabian national petroleum and natural gas company.', 55.30, CURRENT_TIMESTAMP, 1),
('IBM Corp.', 'Enterprise software, consulting, and cloud computing company.', 172.14, CURRENT_TIMESTAMP, 1),
('Oracle Corp.', 'Enterprise software and database company.', 125.18, CURRENT_TIMESTAMP, 1),
('Cisco Systems Inc.', 'Networking hardware and telecommunications equipment provider.', 52.67, CURRENT_TIMESTAMP, 1),
('Adobe Inc.', 'Software company best known for Photoshop and Acrobat.', 568.44, CURRENT_TIMESTAMP, 1),
('Broadcom Inc.', 'Semiconductor and infrastructure software company.', 921.12, CURRENT_TIMESTAMP, 1),
('Qualcomm Inc.', 'Wireless telecommunications and chip manufacturer.', 129.40, CURRENT_TIMESTAMP, 1);

-- =========================
-- STOCK EXCHANGE SEED DATA
-- =========================
INSERT INTO stock_exchange (name, description, live_in_market) VALUES
('New York Stock Exchange', 'World’s largest stock exchange by market capitalization.', TRUE),
('NASDAQ', 'U.S.-based exchange specializing in technology and growth companies.', TRUE),
('London Stock Exchange', 'Primary stock exchange in the United Kingdom.', TRUE),
('Tokyo Stock Exchange', 'Japan’s main stock exchange.', FALSE),
('Saudi Exchange (Tadawul)', 'Saudi Arabia’s main stock exchange.', FALSE);

-- =========================
-- STOCK_EXCHANGE_STOCK LINKS
-- =========================

-- NYSE: 10+ stocks
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'New York Stock Exchange' AND s.name IN (
  'Apple Inc.', 'Microsoft Corp.', 'Tesla Inc.', 'Amazon.com Inc.', 'IBM Corp.',
  'Intel Corp.', 'Oracle Corp.', 'Cisco Systems Inc.', 'Adobe Inc.', 'Broadcom Inc.'
);

-- NASDAQ: 10+ stocks
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'NASDAQ' AND s.name IN (
  'Apple Inc.', 'Microsoft Corp.', 'Tesla Inc.', 'Amazon.com Inc.', 'Alphabet Inc.',
  'NVIDIA Corp.', 'Meta Platforms Inc.', 'Qualcomm Inc.', 'Adobe Inc.', 'Broadcom Inc.'
);

-- LSE: 10+ stocks
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'London Stock Exchange' AND s.name IN (
  'IBM Corp.', 'Microsoft Corp.', 'Oracle Corp.', 'Cisco Systems Inc.', 'Intel Corp.',
  'Apple Inc.', 'NVIDIA Corp.', 'Amazon.com Inc.', 'Tesla Inc.', 'Broadcom Inc.'
);

-- Tokyo SE: <10 stocks → must not be live
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'Tokyo Stock Exchange' AND s.name IN (
  'Apple Inc.', 'Tesla Inc.', 'NVIDIA Corp.', 'Intel Corp.'
);

-- Tadawul: <10 stocks → must not be live
INSERT INTO stock_exchange_stock (exchange_id, stock_id)
SELECT e.id, s.id FROM stock_exchange e, stock s
WHERE e.name = 'Saudi Exchange (Tadawul)' AND s.name IN (
  'Saudi Aramco', 'Apple Inc.', 'Microsoft Corp.', 'IBM Corp.'
);

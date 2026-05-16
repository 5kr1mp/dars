-- Active: 1778748742576@@127.0.0.1@3306@dars
-- =====================================================
-- sampleData.sql
-- Sample data for DARS (Domestic Abuse Report System)
--
-- All staff accounts use the password: Password@123
-- Run this on a fresh/empty database after dars.sql
-- and changesdDars.sql have been applied.
-- =====================================================

USE dars;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- Barangays (Cebu City)
-- =====================================================
INSERT INTO barangay (id, barangay_name, latitude, longitude, radius) VALUES
(1, 'Lahug',     10.32000000, 123.91500000, 500.00),
(2, 'Mabolo',    10.32900000, 123.92100000, 600.00),
(3, 'Banilad',   10.34000000, 123.90800000, 550.00),
(4, 'Talamban',  10.37000000, 123.91500000, 700.00),
(5, 'Guadalupe', 10.31200000, 123.90000000, 450.00);

-- =====================================================
-- Abuse Types (based on RA 9262)
-- =====================================================
INSERT INTO abuse_type (abuse_name, abuse_description, severity, law_reference) VALUES
('Physical',      'Physical harm or bodily injury inflicted on victim',         8,  'RA 9262 Sec 3(a)'),
('Psychological', 'Mental or emotional harm through threats or coercion',       6,  'RA 9262 Sec 3(b)'),
('Sexual',        'Non-consensual sexual acts or harassment',                   10, 'RA 9262 Sec 3(c)'),
('Economic',      'Financial abuse or deprivation of resources',                4,  'RA 9262 Sec 3(d)'),
('Stalking',      'Persistent unwanted contact causing fear or distress',       5,  'RA 9262 Sec 3(a)');

-- =====================================================
-- Staff (password for all accounts: Password@123)
-- =====================================================
INSERT INTO staff (id, email, password, first_name, middle_name, last_name, user_role, contact_number, barangay_id) VALUES
(1, 'sysadmin@dars.gov.ph',  '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Maria',   'Corazon',  'Santos',    'system_admin', '09121000001', NULL),
(2, 'admin1@dars.gov.ph',    '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Juan',    'Bartolome','dela Cruz', 'admin',        '09121000002', NULL),
(3, 'admin2@dars.gov.ph',    '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Ana',     'Rosa',     'Reyes',     'admin',        '09121000003', NULL),
(4, 'operator1@dars.gov.ph', '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Pedro',   'Alfonso',  'Bautista',  'operator',     '09121000004', 1),
(5, 'operator2@dars.gov.ph', '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Rosario', 'Mae',      'Mendoza',   'operator',     '09121000005', 2),
(6, 'operator3@dars.gov.ph', '$2b$10$FcoQoJCl11HTyQN3Y.r0OOs9wcqiUJfiqLuRJ6PcPFTW573LyiSXW', 'Carlo',   'Vicente',  'Villanueva','operator',     '09121000006', 3);

-- =====================================================
-- Victims
-- =====================================================
INSERT INTO victim (id, first_name, middle_name, last_name, contact_number, email, barangay_id, address) VALUES
(1, 'Elena',  'Mae',   'Santos',  '09123456789', 'elena.santos@email.com',  1, '12 Sampaguita St, Lahug'),
(2, 'Maria',  'Luz',   'Garcia',  '09234567890', 'maria.garcia@email.com',  2, '45 Rosal St, Mabolo'),
(3, 'Ana',    'Rose',  'Reyes',   '09345678901', 'ana.reyes@email.com',     1, '78 Camia St, Lahug'),
(4, 'Liza',   'Pearl', 'Torres',  '09456789012', NULL,                      3, '21 Gumamela Rd, Banilad'),
(5, 'Carmen', 'Belle', 'Flores',  '09567890123', 'carmen.flores@email.com', 4, '56 Ilang-Ilang Ave, Talamban'),
(6, 'Rosa',   'Diana', 'Cruz',    '09678901234', NULL,                      2, '33 Jasmin St, Mabolo');

-- =====================================================
-- Offenders
-- =====================================================
INSERT INTO offender (id, first_name, middle_name, last_name, sex, contact_number, address, barangay_id) VALUES
(1, 'Ricardo', 'Alvin', 'Santos',  'male', '09121112222', '12 Sampaguita St, Lahug',  1),
(2, 'Jose',    'Bong',  'Garcia',  'male', '09232223333', '45 Rosal St, Mabolo',      2),
(3, 'Marco',   'Cris',  'Reyes',   'male', '09343334444', '78 Camia St, Lahug',        1),
(4, 'Antonio', 'Dan',   'Torres',  'male', '09454445555', '21 Gumamela Rd, Banilad',  3);

-- =====================================================
-- Responders
-- =====================================================
INSERT INTO responder (id, responder_name, agency, contact_number) VALUES
(1, 'Lahug Police Station',     'PNP',  '09322321111'),
(2, 'DSWD Cebu City Office',    'DSWD', '09322322222'),
(3, 'Cebu City Medical Center', 'CCMC', '09322323333'),
(4, 'Banilad Barangay Hall',    'BPO',  '09322324444');

-- =====================================================
-- Seed report_id_seq so IDs match the fixed values above
-- =====================================================
INSERT INTO report_id_seq (seq_date, last_seq) VALUES
('2026-04-10', 1),
('2026-04-12', 1),
('2026-04-15', 1),
('2026-04-20', 1),
('2026-05-01', 1),
('2026-05-05', 1);

-- =====================================================
-- Reports
-- Fixed IDs make it easy to reference in reset script.
-- Statuses are driven by dispatches and resolved_report below.
-- =====================================================
SET @r1 = 'RP-20260410-0001';
SET @r2 = 'RP-20260412-0001';
SET @r3 = 'RP-20260415-0001';
SET @r4 = 'RP-20260420-0001';
SET @r5 = 'RP-20260501-0001';
SET @r6 = 'RP-20260505-0001';

INSERT INTO report (id, victim_id, offender_id, abuse_name, barangay_id, latitude, longitude, report_description, reported_at) VALUES
(@r1, 1, 1, 'Physical',      1, 10.32050000, 123.91520000,
    'Victim reported repeated physical assaults at home. Bruising visible on arms and face. Victim fears escalation.',
    '2026-04-10 08:30:00'),
(@r2, 2, 2, 'Psychological', 2, 10.32920000, 123.92130000,
    'Victim experiencing ongoing threats and isolation. Partner monitors all communications and controls daily movement.',
    '2026-04-12 10:15:00'),
(@r3, 3, 3, 'Sexual',        1, 10.32100000, 123.91600000,
    'Victim reported sexual violence by live-in partner. Physical evidence present. Victim requests immediate assistance.',
    '2026-04-15 14:00:00'),
(@r4, 4, 4, 'Economic',      3, 10.34010000, 123.90820000,
    'Victim unable to access personal finances. Partner seized all bank documents, ID cards, and employment papers.',
    '2026-04-20 09:00:00'),
(@r5, 5, NULL, 'Physical',   4, 10.37020000, 123.91510000,
    'Victim reports physical abuse from a household member. Offender identity withheld by victim request. Medical attention needed.',
    '2026-05-01 11:00:00'),
(@r6, 6, 1, 'Stalking',      2, 10.32950000, 123.92200000,
    'Victim receiving threatening messages and is being followed near residence. Offender is a former partner.',
    '2026-05-05 16:30:00');

-- =====================================================
-- Dispatches
-- Inserting a dispatch triggers the report status →
-- 'Dispatched'. Updating to 'Completed' triggers →
-- 'Under Investigation'. Resolved reports trigger →
-- 'Resolved'.
-- =====================================================

-- r2: status will be Dispatched (dispatch assigned, not completed)
INSERT INTO dispatch (id, report_id, responder_id, dispatch_time, dispatch_status, remarks) VALUES
(1, @r2, 1, '2026-04-12 10:45:00', 'Assigned', 'Police unit assigned to reported location in Mabolo.');

-- r3: status will be Under Investigation (dispatch completed)
INSERT INTO dispatch (id, report_id, responder_id, dispatch_time, dispatch_status, remarks) VALUES
(2, @r3, 2, '2026-04-15 14:30:00', 'Assigned', 'DSWD officer dispatched for immediate victim support.');
UPDATE dispatch SET dispatch_status = 'Completed',
    remarks = 'DSWD officer arrived on-site. Victim support provided. Case documented and referred for investigation.'
WHERE id = 2;

-- r4: status will be Under Investigation, then Resolved via resolved_report below
INSERT INTO dispatch (id, report_id, responder_id, dispatch_time, dispatch_status, remarks) VALUES
(3, @r4, 4, '2026-04-20 09:30:00', 'Assigned', 'BPO officer dispatched to assist victim in Banilad.');
UPDATE dispatch SET dispatch_status = 'Completed',
    remarks = 'BPO officer arrived. Victim assisted and documentation completed. Forwarded to admin.'
WHERE id = 3;

-- r6: status will be Dispatched (unit on the way)
INSERT INTO dispatch (id, report_id, responder_id, dispatch_time, dispatch_status, remarks) VALUES
(4, @r6, 1, '2026-05-05 17:00:00', 'Assigned', 'Police unit dispatched to victim location in Mabolo.');
UPDATE dispatch SET dispatch_status = 'On The Way',
    remarks = 'Unit en route. ETA 10 minutes.'
WHERE id = 4;

-- =====================================================
-- Resolved Report
-- Inserting here auto-sets r4 status → 'Resolved'
-- =====================================================
INSERT INTO resolved_report (report_id, operator_id, resolution_summary, resolved_at) VALUES
(@r4, 6,
    'Victim provided temporary shelter through DSWD referral. Barangay protection order issued against offender. Case forwarded to DSWD for continued support and legal assistance. Offender warned and placed under barangay monitoring.',
    '2026-05-02 14:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Expected final report statuses:
--   r1 (Elena Santos / Physical / Lahug)     → Reported
--   r2 (Maria Garcia / Psychological / Mabolo) → Dispatched
--   r3 (Ana Reyes / Sexual / Lahug)          → Under Investigation
--   r4 (Liza Torres / Economic / Banilad)    → Resolved
--   r5 (Carmen Flores / Physical / Talamban) → Reported
--   r6 (Rosa Cruz / Stalking / Mabolo)       → Dispatched
-- =====================================================
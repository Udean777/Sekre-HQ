-- Seed demo data for testing
-- Password for all demo users: password123

-- Temporarily disable RLS for seeding
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE division_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Demo Organization 1: HIMTI UNPAB
INSERT INTO organizations (id, name, subdomain, subscription_plan, created_at)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'HIMTI UNPAB', 'himti', 'FREE', NOW());

-- Demo Organization 2: BEM Universitas
INSERT INTO organizations (id, name, subdomain, subscription_plan, created_at)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'BEM Universitas', 'bem', 'LITE', NOW());

-- Demo Users
-- Password: password123 (hashed with bcrypt cost 10)
INSERT INTO users (id, email, password_hash, full_name, created_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sajudin@himti.org', '$2a$10$xb4r2CBzIupxG2nMniiW3eGTxtXC0Y1EWiEmhrSLe5WusSuC2J00K', 'Sajudin Ma''ruf', NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@bem.org', '$2a$10$xb4r2CBzIupxG2nMniiW3eGTxtXC0Y1EWiEmhrSLe5WusSuC2J00K', 'Admin BEM', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'zulhamdani@himti.org', '$2a$10$xb4r2CBzIupxG2nMniiW3eGTxtXC0Y1EWiEmhrSLe5WusSuC2J00K', 'Zulhamdani', NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'gilang@himti.org', '$2a$10$xb4r2CBzIupxG2nMniiW3eGTxtXC0Y1EWiEmhrSLe5WusSuC2J00K', 'Gilang Gemilang', NOW());

-- Organization Members (using organization_members table)
INSERT INTO organization_members (user_id, organization_id, role, joined_at)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'OWNER', NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ADMIN', NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'MEMBER', NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'OWNER', NOW());

-- Divisions for HIMTI
INSERT INTO divisions (id, organization_id, name, created_at)
VALUES 
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Divisi IPTEK', NOW()),
    ('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Divisi Humas', NOW()),
    ('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Divisi Kewirausahaan', NOW());

-- Divisions for BEM
INSERT INTO divisions (id, organization_id, name, created_at)
VALUES 
    ('d4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Departemen Sosmas', NOW()),
    ('d5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Departemen Akademik', NOW());

-- Division Members
INSERT INTO division_members (division_id, user_id, division_role, joined_at)
VALUES 
    ('d1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'HEAD', NOW()),
    ('d1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'STAFF', NOW()),
    ('d2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HEAD', NOW()),
    ('d4444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HEAD', NOW());

-- Tasks for HIMTI
INSERT INTO tasks (id, organization_id, division_id, assignee_id, title, description, status, due_date, created_at)
VALUES 
    ('t1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Setup proyektor untuk Goes To School', 'Persiapan peralatan presentasi', 'TODO', NOW() + INTERVAL '3 days', NOW()),
    ('t2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Buat materi workshop coding', 'Materi Python untuk pemula', 'IN_PROGRESS', NOW() + INTERVAL '5 days', NOW()),
    ('t3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Koordinasi dengan sponsor', 'Follow up sponsor acara tahunan', 'DONE', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days');

-- Events for HIMTI
INSERT INTO events (id, organization_id, division_id, title, description, start_time, end_time, location, created_at)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Sosialisasi SMK N1 Stabat', 'Pengenalan jurusan IT ke siswa SMK', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'Aula SMK N1 Stabat', NOW()),
    ('e2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Workshop Web Development', 'Pelatihan membuat website dengan HTML/CSS/JS', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Lab Komputer UNPAB', NOW()),
    ('e3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Rapat Koordinasi Bulanan', 'Evaluasi program kerja bulan ini', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '2 hours', 'Ruang Sekretariat HIMTI', NOW());

-- Transactions for HIMTI
INSERT INTO transactions (id, organization_id, division_id, event_id, type, amount, description, status, requested_by, approved_by, created_at)
VALUES 
    ('tr111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'EXPENSE', 500000, 'Pembelian spanduk kegiatan Goes To School', 'APPROVED', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 day'),
    ('tr222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'EXPENSE', 300000, 'Konsumsi peserta workshop', 'APPROVED', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW()),
    ('tr333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', NULL, 'INCOME', 2000000, 'Dana sponsor dari PT. Tech Indonesia', 'APPROVED', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '3 days'),
    ('tr444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', NULL, 'EXPENSE', 150000, 'Pembelian ATK untuk sekretariat', 'APPROVED', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '5 days');

-- Transactions for BEM
INSERT INTO transactions (id, organization_id, division_id, event_id, type, amount, description, status, requested_by, approved_by, created_at)
VALUES 
    ('tr555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', NULL, 'INCOME', 5000000, 'Dana kegiatan dari universitas', 'APPROVED', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '7 days'),
    ('tr666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-4444-444444444444', NULL, 'EXPENSE', 1500000, 'Sewa venue acara mahasiswa', 'APPROVED', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '2 days');

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Demo data seeded successfully!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Demo Accounts:';
    RAISE NOTICE '';
    RAISE NOTICE '1. HIMTI UNPAB (FREE Plan)';
    RAISE NOTICE '   Email: sajudin@himti.org / password123';
    RAISE NOTICE '   Email: zulhamdani@himti.org / password123';
    RAISE NOTICE '   Email: gilang@himti.org / password123';
    RAISE NOTICE '';
    RAISE NOTICE '2. BEM Universitas (LITE Plan)';
    RAISE NOTICE '   Email: admin@bem.org / password123';
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
END $$;

-- Re-enable RLS after seeding
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE division_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

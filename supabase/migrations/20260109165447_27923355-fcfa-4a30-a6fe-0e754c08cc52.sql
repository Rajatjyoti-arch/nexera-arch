
-- =============================================
-- Seed Data (without classes - requires real users)
-- =============================================

-- Seed departments (if not exist)
INSERT INTO public.departments (id, name, code, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Computer Science', 'CS', 'Department of Computer Science and Engineering'),
  ('22222222-2222-2222-2222-222222222222', 'Electronics & Communication', 'ECE', 'Department of Electronics and Communication Engineering'),
  ('33333333-3333-3333-3333-333333333333', 'Mechanical Engineering', 'ME', 'Department of Mechanical Engineering')
ON CONFLICT (id) DO NOTHING;

-- Seed courses
INSERT INTO public.courses (id, department_id, name, code, duration_years)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'B.Tech Computer Science', 'BTCS', 4),
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'B.Tech Electronics', 'BTEC', 4),
  ('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'B.Tech Mechanical', 'BTME', 4)
ON CONFLICT (id) DO NOTHING;

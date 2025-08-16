-- Seed exam templates for Calc and Physics
insert into quiz_templates (name, course, exam, duration_seconds) values
('Calc I - Midterm 1','Calc I','Midterm 1',3600),
('Calc I - Midterm 2','Calc I','Midterm 2',3600),
('Calc I - Final','Calc I','Final',7200),
('Calc II - Midterm 1','Calc II','Midterm 1',3600),
('Calc II - Midterm 2','Calc II','Midterm 2',3600),
('Calc II - Final','Calc II','Final',7200),
('Calc III - Midterm 1','Calc III','Midterm 1',3600),
('Calc III - Midterm 2','Calc III','Midterm 2',3600),
('Calc III - Final','Calc III','Final',7200),
('Physics I - Midterm 1','Physics I','Midterm 1',3600),
('Physics I - Midterm 2','Physics I','Midterm 2',3600),
('Physics I - Final','Physics I','Final',7200),
('Physics II - Midterm 1','Physics II','Midterm 1',3600),
('Physics II - Midterm 2','Physics II','Midterm 2',3600),
('Physics II - Final','Physics II','Final',7200);

-- Example topics
insert into topics (course, name) values
('Calc I','Limits'),
('Calc I','Derivatives'),
('Calc I','Applications of derivatives'),
('Calc I','Integrals'),
('Calc II','Techniques of Integration'),
('Calc II','Series'),
('Calc III','Partial derivatives'),
('Calc III','Multiple integrals'),
('Physics I','Kinematics'),
('Physics I','Newton''s laws'),
('Physics I','Work and energy'),
('Physics II','Electric fields'),
('Physics II','Circuits');

-- Example standards (TEKS-style)
insert into standards (code, description, course) values
('TEKS-C1-LIM1','Limits and continuity','Calc I'),
('TEKS-C1-DER2','Definition of derivative','Calc I'),
('TEKS-P1-KIN1','1D kinematics','Physics I'),
('TEKS-P2-ELE1','Electric force and field','Physics II');

-- Example pool for Calc I derivatives
insert into pools (id,name,course,exam) values (uuid_generate_v4(),'Calc I - Derivatives core','Calc I','Any') returning id;
-- Copy returned id into the client and then link it to a template:
-- insert into template_sources (template_id, pool_id, count)
-- select id, 'REPLACE_POOL_UUID', 8 from quiz_templates where name='Calc I - Midterm 1';

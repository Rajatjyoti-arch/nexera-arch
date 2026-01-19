import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: Record<string, unknown> = {};

    // ========================
    // 1. Create Admin Account
    // ========================
    const adminEmail = 'admin@nexera.edu';
    const adminPassword = 'Admin@123';

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let adminUser = existingUsers?.users?.find(u => u.email === adminEmail);

    if (!adminUser) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'System Admin', role: 'admin' }
      });
      if (authError) throw authError;
      adminUser = authData.user;

      await supabaseAdmin.from('user_roles').insert({ user_id: adminUser.id, role: 'admin' });
      await supabaseAdmin.from('admin_profiles').insert({
        user_id: adminUser.id,
        email: adminEmail,
        name: 'System Admin',
        department: 'Administration'
      });
      results.admin = { created: true, email: adminEmail };
    } else {
      results.admin = { created: false, exists: true, email: adminEmail };
    }

    // ========================
    // 2. Create Faculty Accounts
    // ========================
    const facultyAccounts = [
      { email: 'faculty1@nexera.edu', password: 'Faculty@123', name: 'Dr. Sarah Johnson', department: 'Computer Science', designation: 'Professor' },
      { email: 'faculty2@nexera.edu', password: 'Faculty@123', name: 'Dr. Michael Chen', department: 'Electronics', designation: 'Associate Professor' }
    ];

    const facultyIds: string[] = [];
    for (const faculty of facultyAccounts) {
      let facultyUser = existingUsers?.users?.find(u => u.email === faculty.email);
      
      if (!facultyUser) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: faculty.email,
          password: faculty.password,
          email_confirm: true,
          user_metadata: { name: faculty.name, role: 'faculty' }
        });
        if (authError) throw authError;
        facultyUser = authData.user;

        await supabaseAdmin.from('user_roles').insert({ user_id: facultyUser.id, role: 'faculty' });
        await supabaseAdmin.from('faculty_profiles').insert({
          user_id: facultyUser.id,
          email: faculty.email,
          name: faculty.name,
          department: faculty.department,
          designation: faculty.designation,
          status: 'active'
        });
      }
      facultyIds.push(facultyUser.id);
    }
    results.faculty = { created: facultyAccounts.length, emails: facultyAccounts.map(f => f.email) };

    // ========================
    // 3. Create Student Accounts
    // ========================
    const studentAccounts = [
      { email: 'student1@nexera.edu', password: 'Student@123', name: 'Alice Smith', username: 'alice_smith', course: 'B.Tech CS', year: '2nd Year' },
      { email: 'student2@nexera.edu', password: 'Student@123', name: 'Bob Wilson', username: 'bob_wilson', course: 'B.Tech CS', year: '2nd Year' }
    ];

    const studentIds: string[] = [];
    for (const student of studentAccounts) {
      let studentUser = existingUsers?.users?.find(u => u.email === student.email);
      
      if (!studentUser) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: { name: student.name, role: 'student' }
        });
        if (authError) throw authError;
        studentUser = authData.user;

        await supabaseAdmin.from('user_roles').insert({ user_id: studentUser.id, role: 'student' });
        await supabaseAdmin.from('student_profiles').insert({
          user_id: studentUser.id,
          email: student.email,
          name: student.name,
          username: student.username,
          course: student.course,
          year: student.year,
          status: 'active'
        });
      }
      studentIds.push(studentUser.id);
    }
    results.students = { created: studentAccounts.length, emails: studentAccounts.map(s => s.email) };

    // ========================
    // 4. Create Classes (linked to real faculty)
    // ========================
    const classData = [
      { id: 'cccc1111-1111-1111-1111-111111111111', course_id: 'aaaa1111-1111-1111-1111-111111111111', faculty_id: facultyIds[0], name: 'Data Structures & Algorithms', room: 'Room 101', year: '2024' },
      { id: 'cccc2222-2222-2222-2222-222222222222', course_id: 'aaaa1111-1111-1111-1111-111111111111', faculty_id: facultyIds[0], name: 'Database Management Systems', room: 'Room 102', year: '2024' },
      { id: 'cccc3333-3333-3333-3333-333333333333', course_id: 'aaaa2222-2222-2222-2222-222222222222', faculty_id: facultyIds[1], name: 'Digital Electronics', room: 'Room 201', year: '2024' }
    ];

    for (const cls of classData) {
      await supabaseAdmin.from('classes').upsert(cls, { onConflict: 'id' });
    }
    results.classes = { created: classData.length };

    // ========================
    // 5. Create Class Schedules
    // ========================
    const scheduleData = [
      { class_id: 'cccc1111-1111-1111-1111-111111111111', day_of_week: 'Monday', start_time: '09:00', end_time: '10:30' },
      { class_id: 'cccc1111-1111-1111-1111-111111111111', day_of_week: 'Wednesday', start_time: '09:00', end_time: '10:30' },
      { class_id: 'cccc2222-2222-2222-2222-222222222222', day_of_week: 'Tuesday', start_time: '11:00', end_time: '12:30' },
      { class_id: 'cccc2222-2222-2222-2222-222222222222', day_of_week: 'Thursday', start_time: '11:00', end_time: '12:30' },
      { class_id: 'cccc3333-3333-3333-3333-333333333333', day_of_week: 'Wednesday', start_time: '14:00', end_time: '15:30' },
      { class_id: 'cccc3333-3333-3333-3333-333333333333', day_of_week: 'Friday', start_time: '14:00', end_time: '15:30' }
    ];

    // Delete existing schedules first to avoid duplicates
    await supabaseAdmin.from('class_schedules').delete().in('class_id', classData.map(c => c.id));
    await supabaseAdmin.from('class_schedules').insert(scheduleData);
    results.schedules = { created: scheduleData.length };

    // ========================
    // 6. Create Student Enrollments
    // ========================
    const enrollmentData = [
      { student_id: studentIds[0], class_id: 'cccc1111-1111-1111-1111-111111111111' },
      { student_id: studentIds[0], class_id: 'cccc2222-2222-2222-2222-222222222222' },
      { student_id: studentIds[1], class_id: 'cccc1111-1111-1111-1111-111111111111' },
      { student_id: studentIds[1], class_id: 'cccc3333-3333-3333-3333-333333333333' }
    ];

    for (const enrollment of enrollmentData) {
      await supabaseAdmin.from('student_enrollments').upsert(enrollment, { onConflict: 'student_id,class_id' });
    }
    results.enrollments = { created: enrollmentData.length };

    // ========================
    // 7. Create Faculty-Class mappings
    // ========================
    const facultyClassData = [
      { faculty_id: facultyIds[0], class_id: 'cccc1111-1111-1111-1111-111111111111' },
      { faculty_id: facultyIds[0], class_id: 'cccc2222-2222-2222-2222-222222222222' },
      { faculty_id: facultyIds[1], class_id: 'cccc3333-3333-3333-3333-333333333333' }
    ];

    for (const fc of facultyClassData) {
      await supabaseAdmin.from('faculty_classes').upsert(fc, { onConflict: 'faculty_id,class_id' });
    }
    results.faculty_classes = { created: facultyClassData.length };

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All seed data created successfully',
        results,
        credentials: {
          admin: { email: 'admin@nexera.edu', password: 'Admin@123' },
          faculty: [
            { email: 'faculty1@nexera.edu', password: 'Faculty@123' },
            { email: 'faculty2@nexera.edu', password: 'Faculty@123' }
          ],
          students: [
            { email: 'student1@nexera.edu', password: 'Student@123' },
            { email: 'student2@nexera.edu', password: 'Student@123' }
          ]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

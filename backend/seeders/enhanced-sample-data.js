const bcrypt = require('bcryptjs');
const { User, Role, Student, Scholarship, Application, Payment, Notification, AuditLog } = require('../src/models');

const seedEnhancedData = async () => {
  try {
    console.log('🌱 Starting enhanced database seeding with 20+ records per table...');

    // Clear existing data
    await AuditLog.destroy({ where: {}, force: true });
    await Notification.destroy({ where: {}, force: true });
    await Payment.destroy({ where: {}, force: true });
    await Application.destroy({ where: {}, force: true });
    await Scholarship.destroy({ where: {}, force: true });
    await Student.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Role.destroy({ where: {}, force: true });

    // Create Roles
    const roles = await Role.bulkCreate([
      {
        name: 'student',
        display_name: 'Student',
        description: 'Student role for scholarship applications',
        permissions: ['apply_scholarship', 'view_own_applications'],
        is_active: true
      },
      {
        name: 'coordinator',
        display_name: 'Department Coordinator',
        description: 'Coordinates department scholarships',
        permissions: ['manage_scholarships', 'review_applications', 'send_notifications'],
        is_active: true
      },
      {
        name: 'committee',
        display_name: 'Scholarship Committee',
        description: 'Reviews and evaluates applications',
        permissions: ['review_applications', 'score_applications'],
        is_active: true
      },
      {
        name: 'finance',
        display_name: 'Finance Officer',
        description: 'Manages payments and financial operations',
        permissions: ['process_payments', 'view_financial_reports'],
        is_active: true
      },
      {
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full system administration',
        permissions: ['*'],
        is_active: true
      }
    ]);

    console.log('✅ Roles created');

    // Create Users (30 users: 1 admin, 3 coordinators, 4 committee, 2 finance, 20 students)
    const hashedPassword = await bcrypt.hash('password123', 12);
    const users = await User.bulkCreate([
      // Admin
      {
        email: 'admin@scholarportal.com',
        password: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        phone: '+15550001',
        role_id: roles[4].id,
        is_active: true,
        email_verified: true
      },
      // Coordinators
      {
        email: 'coordinator1@scholarportal.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Coordinator',
        phone: '+15550002',
        role_id: roles[1].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'coordinator2@scholarportal.com',
        password: hashedPassword,
        first_name: 'Emily',
        last_name: 'Stevens',
        phone: '+15550003',
        role_id: roles[1].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'coordinator3@scholarportal.com',
        password: hashedPassword,
        first_name: 'Robert',
        last_name: 'Martinez',
        phone: '+15550004',
        role_id: roles[1].id,
        is_active: true,
        email_verified: true
      },
      // Committee Members
      {
        email: 'committee1@scholarportal.com',
        password: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Committee',
        phone: '+15550005',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'committee2@scholarportal.com',
        password: hashedPassword,
        first_name: 'Michael',
        last_name: 'Reviewer',
        phone: '+15550006',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'committee3@scholarportal.com',
        password: hashedPassword,
        first_name: 'Jennifer',
        last_name: 'Anderson',
        phone: '+15550007',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'committee4@scholarportal.com',
        password: hashedPassword,
        first_name: 'David',
        last_name: 'Thompson',
        phone: '+15550008',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      // Finance Officers
      {
        email: 'finance1@scholarportal.com',
        password: hashedPassword,
        first_name: 'Emma',
        last_name: 'Finance',
        phone: '+15550009',
        role_id: roles[3].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'finance2@scholarportal.com',
        password: hashedPassword,
        first_name: 'James',
        last_name: 'Parker',
        phone: '+15550010',
        role_id: roles[3].id,
        is_active: true,
        email_verified: true
      },
      // Students (20 students)
      ...Array.from({ length: 20 }, (_, i) => ({
        email: `student${i + 1}@student.edu`,
        password: hashedPassword,
        first_name: ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack', 
                     'Kate', 'Leo', 'Maria', 'Nathan', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tina'][i],
        last_name: ['Johnson', 'Smith', 'Davis', 'Wilson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
                    'Harris', 'Martin', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'][i],
        phone: `+1555${1001 + i}`,
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      }))
    ]);

    console.log('✅ Users created:', users.length);

    // Create Students (20 students)
    const departments = ['computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences', 'computer-science', 'engineering'];
    const majors = ['Software Engineering', 'Mechanical Engineering', 'Business Administration', 'Pre-Med', 
                    'Fine Arts', 'Biology', 'Criminal Justice', 'Elementary Education'];
    
    const students = await Student.bulkCreate(
      users.slice(10).map((user, i) => ({
        user_id: user.id,
        student_id: `STU2024${String(i + 1).padStart(3, '0')}`,
        department: departments[i % departments.length],
        major: majors[i % majors.length],
        year_of_study: (i % 4) + 1,
        gpa: 2.8 + Math.random() * 1.1, // 2.8–3.9, above most min_gpa thresholds
        enrollment_date: new Date(2021 + (i % 4), 8, 1),
        address: { 
          street: `${100 + i} Campus Dr`, 
          city: 'University City', 
          state: 'CA', 
          zip: '90210' 
        },
        financial_need_score: 50 + Math.floor(Math.random() * 50),
        emergency_contact: { 
          name: `Parent ${i + 1}`, 
          phone: `+1555${2001 + i}`, 
          relationship: i % 2 === 0 ? 'Mother' : 'Father' 
        }
      }))
    );

    console.log('✅ Students created:', students.length);

    // Create Scholarships (25 scholarships)
    const scholarshipTemplates = [
      { name: 'Merit Excellence Scholarship', type: 'merit', amount: 5000, dept: 'all' },
      { name: 'STEM Innovation Grant', type: 'stem', amount: 7500, dept: 'computer-science' },
      { name: 'Community Service Award', type: 'service', amount: 3000, dept: 'all' },
      { name: 'Engineering Excellence Fund', type: 'merit', amount: 6000, dept: 'engineering' },
      { name: 'Business Leadership Scholarship', type: 'leadership', amount: 4500, dept: 'business' },
      { name: 'Medical Student Support', type: 'need', amount: 8000, dept: 'medicine' },
      { name: 'Arts & Creativity Grant', type: 'talent', amount: 3500, dept: 'arts' },
      { name: 'Science Research Fellowship', type: 'research', amount: 9000, dept: 'sciences' },
      { name: 'First Generation Scholarship', type: 'need', amount: 5500, dept: 'all' },
      { name: 'Women in STEM Award', type: 'diversity', amount: 6500, dept: 'computer-science' },
      { name: 'Athletic Achievement Scholarship', type: 'athletic', amount: 4000, dept: 'all' },
      { name: 'International Student Grant', type: 'diversity', amount: 7000, dept: 'all' },
      { name: 'Graduate School Preparation', type: 'academic', amount: 5000, dept: 'all' },
      { name: 'Entrepreneurship Award', type: 'leadership', amount: 8500, dept: 'business' },
      { name: 'Environmental Studies Grant', type: 'research', amount: 4500, dept: 'sciences' },
      { name: 'Education Future Teachers', type: 'career', amount: 3500, dept: 'all' },
      { name: 'Law School Preparation', type: 'academic', amount: 6000, dept: 'all' },
      { name: 'Technology Innovation Prize', type: 'innovation', amount: 10000, dept: 'computer-science' },
      { name: 'Healthcare Heroes Scholarship', type: 'career', amount: 7500, dept: 'medicine' },
      { name: 'Diversity & Inclusion Award', type: 'diversity', amount: 5000, dept: 'all' },
      { name: 'Academic Excellence Grant', type: 'merit', amount: 4000, dept: 'all' },
      { name: 'Need-Based Support Fund', type: 'need', amount: 6000, dept: 'all' },
      { name: 'Study Abroad Scholarship', type: 'travel', amount: 8000, dept: 'all' },
      { name: 'Research Assistant Grant', type: 'research', amount: 5500, dept: 'sciences' },
      { name: 'Senior Year Excellence', type: 'merit', amount: 4500, dept: 'all' }
    ];

    const scholarships = await Scholarship.bulkCreate(
      scholarshipTemplates.map((template, i) => ({
        name: template.name,
        description: `${template.name} - Supporting students in their academic journey with focus on ${template.type}.`,
        amount: template.amount,
        total_funding: template.amount * (5 + Math.floor(Math.random() * 10)),
        max_recipients: 5 + Math.floor(Math.random() * 10),
        current_recipients: Math.floor(Math.random() * 5),
        application_deadline: new Date(2026, 2 + (i % 6), 15 + (i % 15)), // March-August 2026
        award_date: new Date(2026, 3 + (i % 6), 1), // April-September 2026
        academic_year: '2026-2027',
        department: template.dept,
        min_gpa: 2.0 + (i % 3) * 0.3, // 2.0, 2.3, or 2.6 — most students qualify
        year_of_study: [1, 2, 3, 4],
        requirements: ['Academic transcript', 'Personal statement', 'Letter of recommendation'],
        criteria: { academic_merit: 40, leadership: 30, community_service: 30 },
        status: i < 20 ? 'active' : 'closed',
        is_renewable: i % 3 === 0,
        renewal_criteria: i % 3 === 0 ? { min_gpa: 3.0 } : null,
        created_by: users[1 + (i % 3)].id,
        approval_workflow: ['coordinator', 'committee', 'finance']
      }))
    );

    console.log('✅ Scholarships created:', scholarships.length);

    // Create Applications (40 applications)
    const applicationStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
    const applications = [];
    
    for (let i = 0; i < 40; i++) {
      const student = students[i % students.length];
      const scholarship = scholarships[i % scholarships.length];
      const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
      
      applications.push({
        student_id: student.id,
        scholarship_id: scholarship.id,
        personal_info: {
          birth_date: `200${2 + (i % 3)}-0${1 + (i % 9)}-${10 + (i % 18)}`,
          nationality: 'American',
          languages: ['English']
        },
        academic_info: {
          current_gpa: 2.5 + Math.random() * 1.5,
          major_gpa: 2.7 + Math.random() * 1.3,
          credits_completed: 30 + (i % 4) * 30,
          expected_graduation: `202${5 + (i % 3)}-05-15`
        },
        essays: {
          personal_statement: `I am passionate about my field and committed to excellence...`,
          career_goals: `My goal is to make a positive impact in my chosen field...`
        },
        financial_info: {
          family_income: 30000 + Math.floor(Math.random() * 70000),
          financial_aid_received: 5000 + Math.floor(Math.random() * 15000),
          work_study_hours: Math.floor(Math.random() * 20)
        },
        status: status,
        current_approval_step: status === 'under_review' ? 'committee' : null,
        approval_history: status !== 'draft' ? [
          { step: 'coordinator', action: 'approved', date: '2024-01-15', reviewer: 'John Coordinator' }
        ] : [],
        ranking: status === 'approved' ? i % 10 + 1 : null,
        submitted_at: status !== 'draft' ? new Date(2026, 1, 10 + (i % 20)) : null,
        reviewed_at: ['approved', 'rejected'].includes(status) ? new Date(2026, 1, 20 + (i % 10)) : null,
        decision_date: ['approved', 'rejected'].includes(status) ? new Date(2026, 1, 25 + (i % 5)) : null,
        score: ['approved', 'under_review'].includes(status) ? 70 + Math.random() * 30 : null,
        notes: status === 'approved' ? 'Excellent candidate with strong qualifications.' : null
      });
    }

    const createdApplications = await Application.bulkCreate(applications);
    console.log('✅ Applications created:', createdApplications.length);

    // Create Payments (25 payments)
    const approvedApplications = createdApplications.filter(app => app.status === 'approved');
    const payments = [];
    
    for (let i = 0; i < Math.min(25, approvedApplications.length); i++) {
      const app = approvedApplications[i];
      const scholarship = scholarships.find(s => s.id === app.scholarship_id);
      const isCompleted = i < 15;
      
      payments.push({
        application_id: app.id,
        amount: scholarship.amount,
        status: isCompleted ? 'completed' : 'pending',
        payment_method: i % 2 === 0 ? 'direct_deposit' : 'bank_transfer',
        transaction_id: isCompleted ? `TXN2024${String(i + 1).padStart(4, '0')}` : null,
        reference_number: `REF2024${String(i + 1).padStart(4, '0')}`,
        bank_details: {
          account_number: `****${1000 + i}`,
          routing_number: '123456789',
          bank_name: 'University Credit Union'
        },
        processed_by: isCompleted ? users[8].id : null,
        processed_at: isCompleted ? new Date(2026, 2, 1 + i) : null,
        scheduled_date: new Date(2026, 2, 5 + i),
        completed_at: isCompleted ? new Date(2026, 2, 1 + i) : null,
        notes: isCompleted ? 'Payment processed successfully.' : 'Pending approval.'
      });
    }

    const createdPayments = await Payment.bulkCreate(payments);
    console.log('✅ Payments created:', createdPayments.length);

    // Create Notifications (30 notifications)
    const notificationTypes = [
      'application_submitted', 'application_approved', 'application_rejected',
      'document_required', 'deadline_reminder', 'system_announcement'
    ];
    
    const notifications = [];
    for (let i = 0; i < 30; i++) {
      const student = students[i % students.length];
      const type = notificationTypes[i % notificationTypes.length];
      
      notifications.push({
        user_id: student.user_id,
        type: type,
        title: `Notification ${i + 1}`,
        message: `This is a ${type.replace('_', ' ')} notification.`,
        data: { notification_id: i + 1 },
        is_read: i % 3 === 0,
        read_at: i % 3 === 0 ? new Date() : null,
        priority: ['low', 'medium', 'high'][i % 3],
        action_url: '/applications',
        email_sent: i % 2 === 0
      });
    }

    await Notification.bulkCreate(notifications);
    console.log('✅ Notifications created: 30');

    // Create Audit Logs (30 logs)
    const actions = ['CREATE_USER', 'UPDATE_USER', 'CREATE_SCHOLARSHIP', 'REVIEW_APPLICATION', 'PROCESS_PAYMENT'];
    const auditLogs = [];
    
    for (let i = 0; i < 30; i++) {
      auditLogs.push({
        user_id: users[i % 10].id,
        action: actions[i % actions.length],
        resource_type: ['User', 'Scholarship', 'Application', 'Payment'][i % 4],
        resource_id: users[10 + (i % 20)].id,
        new_values: { action: 'performed' },
        ip_address: `192.168.1.${100 + i}`,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }

    await AuditLog.bulkCreate(auditLogs);
    console.log('✅ Audit logs created: 30');

    console.log('\n🎉 Enhanced database seeding completed successfully!');
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Scholarships: ${scholarships.length}`);
    console.log(`- Applications: ${createdApplications.length}`);
    console.log(`- Payments: ${createdPayments.length}`);
    console.log(`- Notifications: 30`);
    console.log(`- Audit Logs: 30`);
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('Admin: admin@scholarportal.com / password123');
    console.log('Coordinator: coordinator1@scholarportal.com / password123');
    console.log('Committee: committee1@scholarportal.com / password123');
    console.log('Finance: finance1@scholarportal.com / password123');
    console.log('Student: student1@student.edu / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedEnhancedData };

// Run seeding if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../src/models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully.');
      return seedEnhancedData();
    })
    .then(() => {
      console.log('Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

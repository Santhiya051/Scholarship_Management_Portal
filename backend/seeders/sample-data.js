const bcrypt = require('bcryptjs');
const { User, Role, Student, Scholarship, Application, Payment, Notification, AuditLog } = require('../src/models');

const seedSampleData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

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

    // Create Users
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
      // Coordinator
      {
        email: 'coordinator@scholarportal.com',
        password: hashedPassword,
        first_name: 'John',
        last_name: 'Coordinator',
        phone: '+15550002',
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
        phone: '+15550003',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'committee2@scholarportal.com',
        password: hashedPassword,
        first_name: 'Michael',
        last_name: 'Reviewer',
        phone: '+15550004',
        role_id: roles[2].id,
        is_active: true,
        email_verified: true
      },
      // Finance Officer
      {
        email: 'finance@scholarportal.com',
        password: hashedPassword,
        first_name: 'Emma',
        last_name: 'Finance',
        phone: '+15550005',
        role_id: roles[3].id,
        is_active: true,
        email_verified: true
      },
      // Students
      {
        email: 'alice.johnson@student.edu',
        password: hashedPassword,
        first_name: 'Alice',
        last_name: 'Johnson',
        phone: '+15551001',
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'bob.smith@student.edu',
        password: hashedPassword,
        first_name: 'Bob',
        last_name: 'Smith',
        phone: '+15551002',
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'carol.davis@student.edu',
        password: hashedPassword,
        first_name: 'Carol',
        last_name: 'Davis',
        phone: '+15551003',
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'david.wilson@student.edu',
        password: hashedPassword,
        first_name: 'David',
        last_name: 'Wilson',
        phone: '+15551004',
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      },
      {
        email: 'eva.brown@student.edu',
        password: hashedPassword,
        first_name: 'Eva',
        last_name: 'Brown',
        phone: '+15551005',
        role_id: roles[0].id,
        is_active: true,
        email_verified: true
      }
    ]);

    console.log('✅ Users created');

    // Create Students
    const students = await Student.bulkCreate([
      {
        user_id: users[5].id,
        student_id: 'STU2024001',
        department: 'Computer Science',
        major: 'Software Engineering',
        year_of_study: 3,
        gpa: 3.85,
        enrollment_date: new Date('2022-09-01'),
        address: { street: '123 Campus Dr', city: 'University City', state: 'CA', zip: '90210' },
        financial_need_score: 75,
        emergency_contact: { name: 'Jane Johnson', phone: '+15552001', relationship: 'Mother' }
      },
      {
        user_id: users[6].id,
        student_id: 'STU2024002',
        department: 'Engineering',
        major: 'Mechanical Engineering',
        year_of_study: 2,
        gpa: 3.92,
        enrollment_date: new Date('2023-09-01'),
        address: { street: '456 College Ave', city: 'University City', state: 'CA', zip: '90210' },
        financial_need_score: 85,
        emergency_contact: { name: 'Robert Smith', phone: '+15552002', relationship: 'Father' }
      },
      {
        user_id: users[7].id,
        student_id: 'STU2024003',
        department: 'Business',
        major: 'Business Administration',
        year_of_study: 4,
        gpa: 3.78,
        enrollment_date: new Date('2021-09-01'),
        address: { street: '789 University Blvd', city: 'University City', state: 'CA', zip: '90210' },
        financial_need_score: 60,
        emergency_contact: { name: 'Mary Davis', phone: '+15552003', relationship: 'Mother' }
      },
      {
        user_id: users[8].id,
        student_id: 'STU2024004',
        department: 'Medicine',
        major: 'Pre-Med',
        year_of_study: 2,
        gpa: 3.95,
        enrollment_date: new Date('2023-09-01'),
        address: { street: '321 Academic Way', city: 'University City', state: 'CA', zip: '90210' },
        financial_need_score: 90,
        emergency_contact: { name: 'James Wilson', phone: '+15552004', relationship: 'Father' }
      },
      {
        user_id: users[9].id,
        student_id: 'STU2024005',
        department: 'Arts',
        major: 'Fine Arts',
        year_of_study: 1,
        gpa: 3.67,
        enrollment_date: new Date('2024-09-01'),
        address: { street: '654 Creative Lane', city: 'University City', state: 'CA', zip: '90210' },
        financial_need_score: 70,
        emergency_contact: { name: 'Lisa Brown', phone: '+15552005', relationship: 'Mother' }
      }
    ]);

    console.log('✅ Students created');

    // Create Scholarships
    const scholarships = await Scholarship.bulkCreate([
      {
        name: 'Merit Excellence Scholarship',
        description: 'Awarded to students with outstanding academic performance and leadership qualities.',
        amount: 5000.00,
        total_funding: 50000.00,
        max_recipients: 10,
        current_recipients: 3,
        application_deadline: new Date('2024-03-15'),
        award_date: new Date('2024-04-01'),
        academic_year: '2024-2025',
        department: 'all',
        min_gpa: 3.5,
        requirements: ['Minimum 3.5 GPA', 'Leadership experience', 'Community service'],
        is_renewable: true,
        renewal_criteria: { min_gpa: 3.5, community_service_hours: 50 },
        approval_workflow: ['coordinator', 'committee', 'finance'],
        created_by: users[1].id,
        year_of_study: [2, 3, 4],
        criteria: { academic_merit: 40, leadership: 30, community_service: 30 },
        status: 'active'
      },
      {
        name: 'STEM Innovation Grant',
        description: 'Supporting students pursuing innovative research in Science, Technology, Engineering, and Mathematics.',
        amount: 7500.00,
        total_funding: 45000.00,
        max_recipients: 6,
        current_recipients: 2,
        application_deadline: new Date('2024-02-28'),
        award_date: new Date('2024-03-15'),
        academic_year: '2024-2025',
        department: 'Computer Science',
        min_gpa: 3.7,
        requirements: ['STEM major', 'Research proposal', 'Faculty recommendation'],
        is_renewable: false,
        approval_workflow: ['coordinator', 'committee', 'finance'],
        created_by: users[1].id,
        year_of_study: [3, 4],
        criteria: { academic_merit: 50, research_potential: 50 },
        status: 'active'
      },
      {
        name: 'Community Service Award',
        description: 'Recognizing students who have made significant contributions to their community.',
        amount: 3000.00,
        total_funding: 24000.00,
        max_recipients: 8,
        current_recipients: 4,
        application_deadline: new Date('2024-04-01'),
        award_date: new Date('2024-04-15'),
        academic_year: '2024-2025',
        department: 'all',
        min_gpa: 3.0,
        requirements: ['100+ community service hours', 'Service project description', 'Supervisor recommendation'],
        is_renewable: true,
        renewal_criteria: { community_service_hours: 100 },
        approval_workflow: ['coordinator', 'committee'],
        created_by: users[1].id,
        year_of_study: [1, 2, 3, 4],
        criteria: { community_service: 60, leadership: 40 },
        status: 'active'
      },
      {
        name: 'Engineering Excellence Fund',
        description: 'Supporting exceptional engineering students in their academic pursuits.',
        amount: 6000.00,
        total_funding: 36000.00,
        max_recipients: 6,
        current_recipients: 1,
        application_deadline: new Date('2024-03-01'),
        award_date: new Date('2024-03-20'),
        academic_year: '2024-2025',
        department: 'Engineering',
        min_gpa: 3.6,
        requirements: ['Engineering major', 'Technical project portfolio', 'Industry internship'],
        is_renewable: true,
        renewal_criteria: { min_gpa: 3.6, technical_projects: 2 },
        approval_workflow: ['coordinator', 'committee', 'finance'],
        created_by: users[1].id,
        year_of_study: [2, 3, 4],
        criteria: { academic_merit: 45, technical_skills: 35, innovation: 20 },
        status: 'active'
      },
      {
        name: 'Business Leadership Scholarship',
        description: 'For business students demonstrating exceptional leadership and entrepreneurial spirit.',
        amount: 4500.00,
        total_funding: 27000.00,
        max_recipients: 6,
        current_recipients: 2,
        application_deadline: new Date('2024-02-15'),
        award_date: new Date('2024-03-01'),
        academic_year: '2024-2025',
        department: 'Business',
        min_gpa: 3.4,
        requirements: ['Business major', 'Leadership roles', 'Business plan or case study'],
        is_renewable: false,
        approval_workflow: ['coordinator', 'committee', 'finance'],
        created_by: users[1].id,
        year_of_study: [3, 4],
        criteria: { academic_merit: 30, leadership: 40, entrepreneurship: 30 },
        status: 'active'
      }
    ]);

    console.log('✅ Scholarships created');

    // Create Applications
    const applications = await Application.bulkCreate([
      {
        student_id: students[0].id,
        scholarship_id: scholarships[0].id,
        personal_info: {
          birth_date: '2002-05-15',
          nationality: 'American',
          languages: ['English', 'Spanish']
        },
        academic_info: {
          current_gpa: 3.85,
          major_gpa: 3.90,
          credits_completed: 90,
          expected_graduation: '2025-05-15'
        },
        essays: {
          personal_statement: 'I am passionate about technology and its potential to solve real-world problems...',
          career_goals: 'My goal is to become a software engineer specializing in AI and machine learning...'
        },
        financial_info: {
          family_income: 45000,
          financial_aid_received: 8000,
          work_study_hours: 15
        },
        status: 'approved',
        current_approval_step: 'finance',
        approval_history: [
          { step: 'coordinator', action: 'approved', date: '2024-01-15', reviewer: 'John Coordinator' },
          { step: 'committee', action: 'approved', date: '2024-01-20', reviewer: 'Sarah Committee' }
        ],
        ranking: 1,
        submitted_at: new Date('2024-01-10'),
        reviewed_at: new Date('2024-01-20'),
        decision_date: new Date('2024-01-25'),
        score: 92.5,
        notes: 'Excellent academic performance and strong leadership potential.'
      },
      {
        student_id: students[1].id,
        scholarship_id: scholarships[1].id,
        personal_info: {
          birth_date: '2003-08-22',
          nationality: 'American',
          languages: ['English']
        },
        academic_info: {
          current_gpa: 3.92,
          major_gpa: 3.95,
          credits_completed: 60,
          expected_graduation: '2026-05-15'
        },
        essays: {
          personal_statement: 'Engineering has always been my passion, and I believe in using technology for good...',
          research_proposal: 'My research focuses on sustainable energy solutions using advanced materials...'
        },
        financial_info: {
          family_income: 35000,
          financial_aid_received: 12000,
          work_study_hours: 20
        },
        status: 'under_review',
        current_approval_step: 'committee',
        approval_history: [
          { step: 'coordinator', action: 'approved', date: '2024-01-18', reviewer: 'John Coordinator' }
        ],
        ranking: 2,
        submitted_at: new Date('2024-01-15'),
        score: 88.0,
        notes: 'Strong technical background with innovative research ideas.'
      },
      {
        student_id: students[2].id,
        scholarship_id: scholarships[2].id,
        personal_info: {
          birth_date: '2001-12-03',
          nationality: 'American',
          languages: ['English', 'French']
        },
        academic_info: {
          current_gpa: 3.78,
          major_gpa: 3.82,
          credits_completed: 120,
          expected_graduation: '2024-12-15'
        },
        essays: {
          personal_statement: 'Community service has shaped my perspective on business and social responsibility...',
          service_description: 'I have volunteered over 200 hours at local food banks and homeless shelters...'
        },
        financial_info: {
          family_income: 55000,
          financial_aid_received: 5000,
          work_study_hours: 10
        },
        status: 'approved',
        current_approval_step: 'finance',
        approval_history: [
          { step: 'coordinator', action: 'approved', date: '2024-01-12', reviewer: 'John Coordinator' },
          { step: 'committee', action: 'approved', date: '2024-01-18', reviewer: 'Michael Reviewer' }
        ],
        ranking: 1,
        submitted_at: new Date('2024-01-08'),
        reviewed_at: new Date('2024-01-18'),
        decision_date: new Date('2024-01-22'),
        score: 85.5,
        notes: 'Outstanding community service record and leadership in volunteer activities.'
      },
      {
        student_id: students[3].id,
        scholarship_id: scholarships[0].id,
        personal_info: {
          birth_date: '2003-03-10',
          nationality: 'American',
          languages: ['English', 'Mandarin']
        },
        academic_info: {
          current_gpa: 3.95,
          major_gpa: 3.98,
          credits_completed: 60,
          expected_graduation: '2026-05-15'
        },
        essays: {
          personal_statement: 'Medicine is not just a career for me, it is a calling to serve humanity...',
          career_goals: 'I aspire to become a pediatric surgeon and work in underserved communities...'
        },
        financial_info: {
          family_income: 28000,
          financial_aid_received: 15000,
          work_study_hours: 25
        },
        status: 'submitted',
        current_approval_step: 'coordinator',
        approval_history: [],
        submitted_at: new Date('2024-01-25'),
        score: null,
        notes: null
      },
      {
        student_id: students[4].id,
        scholarship_id: scholarships[2].id,
        personal_info: {
          birth_date: '2004-07-18',
          nationality: 'American',
          languages: ['English', 'Italian']
        },
        academic_info: {
          current_gpa: 3.67,
          major_gpa: 3.70,
          credits_completed: 30,
          expected_graduation: '2027-05-15'
        },
        essays: {
          personal_statement: 'Art has the power to transform communities and bring people together...',
          service_description: 'I organize art workshops for underprivileged children in my community...'
        },
        financial_info: {
          family_income: 42000,
          financial_aid_received: 10000,
          work_study_hours: 15
        },
        status: 'under_review',
        current_approval_step: 'committee',
        approval_history: [
          { step: 'coordinator', action: 'approved', date: '2024-01-22', reviewer: 'John Coordinator' }
        ],
        submitted_at: new Date('2024-01-20'),
        score: 78.0,
        notes: 'Creative approach to community service through arts education.'
      }
    ]);

    console.log('✅ Applications created');

    // Create Payments
    const payments = await Payment.bulkCreate([
      {
        application_id: applications[0].id,
        amount: 5000.00,
        status: 'completed',
        payment_method: 'direct_deposit',
        transaction_id: 'TXN2024001',
        reference_number: 'REF2024001',
        bank_details: {
          account_number: '****1234',
          routing_number: '123456789',
          bank_name: 'University Credit Union'
        },
        processed_by: users[4].id,
        processed_at: new Date('2024-01-26'),
        scheduled_date: new Date('2024-01-25'),
        completed_at: new Date('2024-01-26'),
        notes: 'Payment processed successfully via direct deposit.'
      },
      {
        application_id: applications[2].id,
        amount: 3000.00,
        status: 'completed',
        payment_method: 'bank_transfer',
        transaction_id: 'TXN2024002',
        reference_number: 'REF2024002',
        bank_details: {
          account_number: '****5678',
          routing_number: '987654321',
          bank_name: 'First National Bank'
        },
        processed_by: users[4].id,
        processed_at: new Date('2024-01-23'),
        scheduled_date: new Date('2024-01-22'),
        completed_at: new Date('2024-01-23'),
        notes: 'Payment completed via bank transfer.'
      },
      {
        application_id: applications[1].id,
        amount: 7500.00,
        status: 'pending',
        payment_method: 'direct_deposit',
        reference_number: 'REF2024003',
        bank_details: {
          account_number: '****9012',
          routing_number: '456789123',
          bank_name: 'Student Banking Corp'
        },
        scheduled_date: new Date('2024-02-05'),
        notes: 'Pending approval for direct deposit payment.'
      }
    ]);

    console.log('✅ Payments created');

    // Create Notifications
    const notifications = await Notification.bulkCreate([
      {
        user_id: users[5].id,
        type: 'application_approved',
        title: 'Scholarship Application Approved!',
        message: 'Congratulations! Your Merit Excellence Scholarship application has been approved.',
        data: { application_id: applications[0].id, amount: 5000 },
        is_read: false,
        priority: 'high',
        action_url: '/applications'
      },
      {
        user_id: users[7].id,
        type: 'application_approved',
        title: 'Community Service Award Approved',
        message: 'Your Community Service Award application has been approved. Payment will be processed soon.',
        data: { application_id: applications[2].id, amount: 3000 },
        is_read: true,
        read_at: new Date('2024-01-23'),
        priority: 'high',
        action_url: '/applications'
      },
      {
        user_id: users[6].id,
        type: 'application_submitted',
        title: 'Application Under Review',
        message: 'Your STEM Innovation Grant application is currently under committee review.',
        data: { application_id: applications[1].id },
        is_read: false,
        priority: 'medium',
        action_url: '/applications'
      },
      {
        user_id: users[8].id,
        type: 'deadline_reminder',
        title: 'Application Deadline Approaching',
        message: 'Reminder: The Merit Excellence Scholarship deadline is in 7 days.',
        data: { scholarship_id: scholarships[0].id },
        is_read: false,
        priority: 'medium',
        expires_at: new Date('2024-03-15'),
        action_url: '/scholarships'
      },
      {
        user_id: users[1].id,
        type: 'system_announcement',
        title: 'New Applications Received',
        message: 'You have 3 new scholarship applications pending review.',
        data: { pending_count: 3 },
        is_read: false,
        priority: 'low',
        action_url: '/admin/applications'
      }
    ]);

    console.log('✅ Notifications created');

    // Create Audit Logs
    await AuditLog.bulkCreate([
      {
        user_id: users[1].id,
        action: 'CREATE_SCHOLARSHIP',
        resource_type: 'Scholarship',
        resource_id: scholarships[0].id,
        new_values: { name: 'Merit Excellence Scholarship', status: 'active' },
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        user_id: users[2].id,
        action: 'REVIEW_APPLICATION',
        resource_type: 'Application',
        resource_id: applications[0].id,
        old_values: { status: 'submitted' },
        new_values: { status: 'approved', score: 92.5 },
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        user_id: users[4].id,
        action: 'PROCESS_PAYMENT',
        resource_type: 'Payment',
        resource_id: payments[0].id,
        new_values: { status: 'completed', amount: 5000 },
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        user_id: users[0].id,
        action: 'CREATE_USER',
        resource_type: 'User',
        resource_id: users[5].id,
        new_values: { email: 'alice.johnson@student.edu', role: 'student' },
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ]);

    console.log('✅ Audit logs created');
    console.log('🎉 Database seeding completed successfully!');

    // Print summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`- Roles: ${roles.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Students: ${students.length}`);
    console.log(`- Scholarships: ${scholarships.length}`);
    console.log(`- Applications: ${applications.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('Admin: admin@scholarportal.com / password123');
    console.log('Coordinator: coordinator@scholarportal.com / password123');
    console.log('Committee: committee1@scholarportal.com / password123');
    console.log('Finance: finance@scholarportal.com / password123');
    console.log('Student: alice.johnson@student.edu / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedSampleData };

// Run seeding if this file is executed directly
if (require.main === module) {
  const { sequelize } = require('../src/models');
  
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected successfully.');
      return seedSampleData();
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
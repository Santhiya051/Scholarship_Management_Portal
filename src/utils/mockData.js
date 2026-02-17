// Mock data for development and testing
export const mockUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    role: 'student',
    studentId: 'STU001',
    department: 'computer-science',
    gpa: 3.8,
    yearOfStudy: '3'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@university.edu',
    role: 'admin',
    department: 'administration'
  },
  {
    id: 3,
    firstName: 'Dr. Robert',
    lastName: 'Johnson',
    email: 'r.johnson@university.edu',
    role: 'coordinator',
    department: 'engineering'
  }
];

export const mockScholarships = [
  {
    id: 1,
    name: 'Merit Excellence Scholarship',
    description: 'Awarded to students with outstanding academic performance',
    amount: 5000,
    deadline: '2024-03-15',
    eligibility: 'GPA 3.5 or higher',
    requirements: ['Official transcript', 'Letter of recommendation', 'Personal statement'],
    status: 'active',
    totalFunding: 50000,
    maxRecipients: 10,
    department: 'all',
    createdBy: 2,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'STEM Innovation Grant',
    description: 'Supporting students pursuing STEM fields with innovative projects',
    amount: 7500,
    deadline: '2024-04-01',
    eligibility: 'STEM majors with research project',
    requirements: ['Project proposal', 'Faculty endorsement', 'Academic transcript'],
    status: 'active',
    totalFunding: 75000,
    maxRecipients: 10,
    department: 'stem',
    createdBy: 2,
    createdAt: '2024-01-01'
  },
  {
    id: 3,
    name: 'Community Service Award',
    description: 'Recognizing students with exceptional community service',
    amount: 2500,
    deadline: '2024-03-30',
    eligibility: '100+ community service hours',
    requirements: ['Service verification', 'Personal essay', 'Reference letter'],
    status: 'active',
    totalFunding: 25000,
    maxRecipients: 10,
    department: 'all',
    createdBy: 2,
    createdAt: '2024-01-01'
  }
];

export const mockApplications = [
  {
    id: 1,
    studentId: 1,
    scholarshipId: 1,
    status: 'approved',
    submittedAt: '2024-01-15',
    reviewedAt: '2024-01-25',
    reviewedBy: 3,
    amount: 5000,
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      phone: '555-0123',
      studentId: 'STU001',
      gpa: 3.8,
      major: 'computer-science',
      yearOfStudy: '3'
    },
    essays: {
      essay1: 'I deserve this scholarship because...',
      essay2: 'This scholarship will help me achieve...'
    },
    documents: [
      { id: 1, name: 'transcript.pdf', type: 'transcript', uploadedAt: '2024-01-15' },
      { id: 2, name: 'recommendation.pdf', type: 'recommendation', uploadedAt: '2024-01-15' }
    ],
    reviewComments: 'Excellent academic performance and strong essays.'
  },
  {
    id: 2,
    studentId: 1,
    scholarshipId: 2,
    status: 'pending',
    submittedAt: '2024-01-20',
    amount: 7500,
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      phone: '555-0123',
      studentId: 'STU001',
      gpa: 3.8,
      major: 'computer-science',
      yearOfStudy: '3'
    },
    essays: {
      essay1: 'I deserve this scholarship because...',
      essay2: 'This scholarship will help me achieve...'
    },
    documents: [
      { id: 3, name: 'project_proposal.pdf', type: 'project', uploadedAt: '2024-01-20' },
      { id: 4, name: 'faculty_endorsement.pdf', type: 'endorsement', uploadedAt: '2024-01-20' }
    ]
  }
];

export const mockDashboardStats = {
  student: {
    totalApplications: 5,
    pendingApplications: 2,
    approvedApplications: 2,
    rejectedApplications: 1,
    totalAwarded: 15000
  },
  admin: {
    totalUsers: 1250,
    totalScholarships: 45,
    totalApplications: 3420,
    totalAwarded: 2850000,
    pendingApplications: 156,
    approvedApplications: 892,
    rejectedApplications: 234
  }
};

export const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Application Approved',
    message: 'Your Merit Excellence Scholarship application has been approved!',
    date: '2024-01-25',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Document Required',
    message: 'Document verification required for STEM Innovation Grant',
    date: '2024-01-23',
    read: false
  },
  {
    id: 3,
    type: 'info',
    title: 'New Scholarship Available',
    message: 'Research Excellence Grant is now accepting applications',
    date: '2024-01-22',
    read: true
  }
];
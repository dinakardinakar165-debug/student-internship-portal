
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

const internships = [
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps Intern',
    company: 'Skyward Systems',
    category: 'Cloud',
    location: 'Remote',
    duration: '8 weeks',
    stipend: '₹8,000/month',
    description: 'Learn AWS, Docker, Linux and CI/CD pipelines.',
    skills: ['AWS', 'Docker', 'Linux', 'Git']
  },
  {
    id: 'frontend-react',
    title: 'Frontend Developer Intern',
    company: 'PixelForge Studio',
    category: 'Development',
    location: 'Coimbatore / Hybrid',
    duration: '10 weeks',
    stipend: '₹10,000/month',
    description: 'Build responsive interfaces with React.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React']
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics Intern',
    company: 'InsightLoop',
    category: 'Data',
    location: 'Remote',
    duration: '6 weeks',
    stipend: '₹7,000/month',
    description: 'Analyze data and create useful reports.',
    skills: ['SQL', 'Python', 'Excel', 'Charts']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Intern',
    company: 'SecureNest Labs',
    category: 'Security',
    location: 'Chennai / Hybrid',
    duration: '8 weeks',
    stipend: '₹9,000/month',
    description: 'Learn defensive security and monitoring.',
    skills: ['Networking', 'Linux', 'Security']
  },
  {
    id: 'backend-node',
    title: 'Backend Developer Intern',
    company: 'StackTrail',
    category: 'Development',
    location: 'Remote',
    duration: '10 weeks',
    stipend: '₹12,000/month',
    description: 'Develop REST APIs using Node.js and MongoDB.',
    skills: ['Node.js', 'Express', 'MongoDB']
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Design Intern',
    company: 'Northstar Creative',
    category: 'Design',
    location: 'Remote',
    duration: '6 weeks',
    stipend: '₹6,000/month',
    description: 'Design user-friendly digital experiences.',
    skills: ['Figma', 'Wireframes', 'Prototyping']
  }
];

// GET all internships
router.get('/internships', (req, res) => {
  const { search, category } = req.query;
  let result = internships;

  if (category && category !== 'All') {
    result = result.filter(
      item => item.category.toLowerCase() ===
        String(category).toLowerCase()
    );
  }

  if (search) {
    const term = String(search).toLowerCase();
    result = result.filter(item =>
      `${item.title} ${item.company} ${item.category} ${item.location}`
        .toLowerCase().includes(term)
    );
  }

  res.json({
    success: true,
    count: result.length,
    internships: result
  });
});

// GET internship details
router.get('/internships/:id', (req, res) => {
  const internship = internships.find(
    item => item.id === req.params.id
  );

  if (!internship) {
    return res.status(404).json({
      success: false,
      message: 'Internship not found'
    });
  }

  res.json({ success: true, internship });
});

// POST student application
router.post('/applications', async (req, res) => {
  try {
    const { studentName, email, rollNumber, internshipId } =
      req.body || {};

    if (
      ![studentName, email, rollNumber, internshipId]
        .every(value => typeof value === 'string' && value.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (studentName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Enter your full name'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address'
      });
    }

    if (!/^[a-zA-Z0-9/-]{3,20}$/.test(rollNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid roll number'
      });
    }

    const internship = internships.find(
      item => item.id === internshipId.trim()
    );

    if (!internship) {
      return res.status(400).json({
        success: false,
        message: 'Select a valid internship'
      });
    }

    const application = await Application.create({
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      rollNumber: rollNumber.trim().toUpperCase(),
      internshipId: internship.id,
      internshipTitle: internship.title,
      company: internship.company
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application: {
        id: application._id,
        studentName: application.studentName,
        internshipTitle: application.internshipTitle,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    console.error('Application error:', error);

    return res.status(
      error.name === 'ValidationError' ? 400 : 500
    ).json({
      success: false,
      message: error.name === 'ValidationError'
        ? error.message
        : 'Unable to save application. Please try again.'
    });
  }
});

// GET saved applications (assignment demonstration)
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve applications'
    });
  }
});

module.exports = router;


import { useEffect, useRef, useState } from 'react';
import {
  Link,
  Routes,
  Route,
  useParams,
  useNavigate
} from 'react-router-dom';
import {
  fetchInternships,
  fetchInternship,
  createApplication
} from './api.js';

const DEMO_INTERNSHIPS = [
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
  }
];

const APPLICATIONS_STORAGE_KEY = 'studentInternshipApplications';

function isBackendUnavailable(error) {
  return error?.code === 'NETWORK_ERROR'
    || error?.status === 404
    || error?.status >= 500;
}

function saveApplicationLocally(application, internship) {
  try {
    const existing = window.localStorage.getItem(APPLICATIONS_STORAGE_KEY);
    const applications = existing ? JSON.parse(existing) : [];

    if (!Array.isArray(applications)) {
      throw new Error('Saved application data is not in the expected format.');
    }

    applications.push({
      studentName: application.studentName.trim(),
      email: application.email.trim().toLowerCase(),
      rollNumber: application.rollNumber.trim().toUpperCase(),
      internshipId: application.internshipId,
      internshipTitle: internship?.title || '',
      company: internship?.company || '',
      savedAt: new Date().toISOString(),
      storage: 'browser-local'
    });

    window.localStorage.setItem(
      APPLICATIONS_STORAGE_KEY,
      JSON.stringify(applications)
    );
  } catch {
    const error = new Error('Unable to save this application in browser storage.');
    error.code = 'LOCAL_STORAGE_ERROR';
    throw error;
  }
}

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">Launchpad<span>.</span></Link>
      <div>
        <Link to="/">Internships</Link>
        <Link to="/#how-it-works">How it works</Link>
      </div>
      <Link className="nav-button" to="/">Explore roles ↗</Link>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <b>Launchpad<span>.</span></b>
      <p>Student Internship Portal · Learn by doing.</p>
    </footer>
  );
}

function Home() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    fetchInternships()
      .then(data => {
        setInternships(data.internships || []);
        setUsingDemoData(false);
      })
      .catch(() => {
        setInternships(DEMO_INTERNSHIPS);
        setUsingDemoData(true);
      });
  }, []);

  const categories = [
    'All', 'Cloud', 'Development', 'Data', 'Security', 'Design'
  ];

  const filtered = internships.filter(item => {
    const matchesCategory =
      category === 'All' || item.category === category;

    const term = search.toLowerCase();
    const matchesSearch =
      `${item.title} ${item.company} ${item.location}`
        .toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">YOUR CAREER STARTS HERE</span>
          <h1>Find the work that <em>moves you forward.</em></h1>
          <p>
            Discover internships, learn new skills and take
            your first step towards an exciting career.
          </p>
          <a href="#opportunities" className="primary-button">
            Explore opportunities ↓
          </a>
          <p className="hero-note">✦ Made for students. Built for your future.</p>
        </div>

        <div className="hero-art">
          <div className="art-circle">✦</div>
          <div className="art-card">
            <span>YOUR NEXT CHAPTER</span>
            <div className="art-emoji">🚀</div>
            <h2>Starts with you.</h2>
            <p>Explore. Apply. Grow.</p>
          </div>
          <div className="floating-label">✓ One application away</div>
        </div>
      </header>

      <section className="benefits">
        <div><b>✦ Curated roles</b><span>Student-friendly openings</span></div>
        <div><b>◎ Built for students</b><span>Simple application process</span></div>
        <div><b>↗ Career-first</b><span>Learn by doing</span></div>
      </section>

      <main className="section" id="opportunities">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE OPPORTUNITY BOARD</span>
            <h2>Make your next move.</h2>
            <p>Find an opportunity that matches your ambition.</p>
          </div>
          <span className="count">{filtered.length} opportunities</span>
        </div>

        <input
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search roles, companies or locations..."
          aria-label="Search internships"
        />

        <div className="filters">
          {categories.map(item => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? 'chip active' : 'chip'}
            >
              {item}
            </button>
          ))}
        </div>

        {usingDemoData && (
          <p className="demo-notice" role="status">
            Demo listings are shown because the internship service is offline.
            Applications require the live backend.
          </p>
        )}

        <div className="job-grid">
          {filtered.map(item => (
            <article className="job-card" key={item.id}>
              <div className="job-card-top">
                <span className="job-icon">
                  {item.category === 'Cloud' ? '☁️'
                    : item.category === 'Development' ? '💻'
                    : item.category === 'Data' ? '📊'
                    : item.category === 'Security' ? '🛡️' : '✳️'}
                </span>
                <span className="tag">{item.category}</span>
                {usingDemoData && <span className="demo-tag">DEMO</span>}
              </div>

              <small className="company">{item.company}</small>
              <h3>{item.title}</h3>
              <p className="description">{item.description}</p>

              <div className="job-meta">
                <span>⌖ {item.location}</span>
                <span>◷ {item.duration}</span>
              </div>

              <div className="job-bottom">
                <div>
                  <small>Monthly stipend</small>
                  <b>{item.stipend}</b>
                </div>
                <Link
                  className="view-button"
                  to={`/internships/${item.id}`}
                  aria-label={`View ${item.title}`}
                >
                  ↗
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <div className="empty">
            <h3>No internships found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </main>

      <section className="how" id="how-it-works">
        <div>
          <span className="eyebrow">YOUR JOURNEY</span>
          <h2>Your future doesn&apos;t have to wait.</h2>
          <p>Three simple steps to start building experience.</p>
        </div>
        <div className="steps">
          <p><b>01 — Explore</b><span>Discover a role that interests you.</span></p>
          <p><b>02 — Apply</b><span>Share your details through our form.</span></p>
          <p><b>03 — Grow</b><span>Take the first step in your career.</span></p>
        </div>
      </section>
    </>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInternship(id)
      .then(data => {
        setInternship(data.internship);
      })
      .catch(err => {
        const demo = DEMO_INTERNSHIPS.find(item => item.id === id);
        if (demo) {
          setInternship(demo);
        } else {
          setError(err.message);
        }
      });
  }, [id]);

  if (error) {
    return (
      <main className="page-content">
        <h2>Unable to load internship</h2>
        <p>{error}</p>
        <Link to="/">Back to internships</Link>
      </main>
    );
  }

  if (!internship) {
    return <main className="page-content">Loading internship...</main>;
  }

  return (
    <main className="page-content">
      <Link to="/" className="back-link">← All internships</Link>
      <section className="details-card">
        <span className="tag">{internship.category}</span>
        <h1>{internship.title}</h1>
        <p>{internship.company} · {internship.location}</p>
        <p>{internship.description}</p>

        <div className="detail-facts">
          <span>Duration: <b>{internship.duration}</b></span>
          <span>Stipend: <b>{internship.stipend}</b></span>
        </div>

        <h3>Skills you&apos;ll use</h3>
        <div className="skills">
          {internship.skills.map(skill => (
            <span key={skill}>{skill}</span>
          ))}
        </div>

        <Link className="primary-button" to={`/apply/${internship.id}`}>
          Apply for this internship ↗
        </Link>
      </section>
    </main>
  );
}

function Apply() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    email: '',
    rollNumber: '',
    internshipId: id || ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    fetchInternships()
      .then(data => setInternships(data.internships || []))
      .catch(() => {
        setInternships(DEMO_INTERNSHIPS);
        setUsingDemoData(true);
      });
  }, []);

  useEffect(() => {
    if (id) {
      setForm(old => ({ ...old, internshipId: id }));
    }
  }, [id]);

  function handleChange(event) {
    setForm(old => ({
      ...old,
      [event.target.name]: event.target.value
    }));
    setErrors(old => ({
      ...old,
      [event.target.name]: ''
    }));
    setMessage('');
    setSuccess(false);
  }

  function validate() {
    const next = {};

    if (form.studentName.trim().length < 2) {
      next.studentName = 'Enter your full name.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!/^[a-zA-Z0-9/-]{3,20}$/.test(form.rollNumber.trim())) {
      next.rollNumber = 'Enter a valid roll number.';
    }

    if (!form.internshipId) {
      next.internshipId = 'Please select an internship.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    setMessage('');
    setSuccess(false);

    if (!validate()) return;

    submissionInProgress.current = true;
    setLoading(true);
    try {
      let result;
      let saveToBrowser = usingDemoData;

      if (!saveToBrowser) {
        try {
          result = await createApplication(form);
        } catch (error) {
          if (!isBackendUnavailable(error)) throw error;
          saveToBrowser = true;
        }
      }

      if (saveToBrowser) {
        const internship = internships.find(
          item => item.id === form.internshipId
        ) || DEMO_INTERNSHIPS.find(
          item => item.id === form.internshipId
        );
        saveApplicationLocally(form, internship);
        setMessage('Application saved successfully.');
      } else {
        setMessage(result.message || 'Application submitted successfully!');
      }

      setSuccess(true);
      setForm({
        studentName: '',
        email: '',
        rollNumber: '',
        internshipId: ''
      });
    } catch (err) {
      setSuccess(false);
      if (err.code === 'LOCAL_STORAGE_ERROR') {
        setMessage(
          'Could not save the application in this browser. Check local storage and try again.'
        );
      } else {
        setMessage(`Application was not submitted: ${err.message}`);
      }
    } finally {
      submissionInProgress.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="apply-layout">
      <section className="apply-intro">
        <span className="eyebrow">TAKE THE FIRST STEP</span>
        <h1>Good things start with showing up.</h1>
        <p>
          Tell us about yourself and choose the internship
          that will help you grow.
        </p>
        <Link to="/" className="back-link">← Browse internships</Link>
      </section>

      <form className="application-form" onSubmit={handleSubmit} noValidate>
        <h2>Student application</h2>
        <p>All fields are required.</p>

        {message && (
          <div className={success ? 'success-message' : 'error-message'} role="status">
            {message}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="studentName">Full name *</label>
          <input
            id="studentName"
            name="studentName"
            value={form.studentName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.studentName && <small>{errors.studentName}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email address *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && <small>{errors.email}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="rollNumber">College roll number *</label>
          <input
            id="rollNumber"
            name="rollNumber"
            value={form.rollNumber}
            onChange={handleChange}
            placeholder="e.g. 24BCS405"
          />
          {errors.rollNumber && <small>{errors.rollNumber}</small>}
        </div>

        <div className="form-field">
          <label htmlFor="internshipId">Selected internship *</label>
          <select
            id="internshipId"
            name="internshipId"
            value={form.internshipId}
            onChange={handleChange}
          >
            <option value="">Choose an internship</option>
            {internships.map(item => (
              <option key={item.id} value={item.id}>
                {item.title} — {item.company}
              </option>
            ))}
          </select>
          {errors.internshipId && <small>{errors.internshipId}</small>}
        </div>

        <button className="primary-button submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit application →'}
        </button>

        {success && (
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/')}
          >
            Browse more internships
          </button>
        )}
      </form>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page-content">
      <h1>Page not found</h1>
      <Link to="/">Return to internships</Link>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/internships/:id" element={<InternshipDetails />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/apply/:id" element={<Apply />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

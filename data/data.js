// In-memory data store (replace with database in production)
let projects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Full-stack shopping experience with secure payments',
    tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    link: '#',
    image: null,
    featured: true
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'Collaborative project management tool',
    tech: ['React', 'Express', 'PostgreSQL', 'WebSocket'],
    link: '#',
    image: null,
    featured: true
  },
  {
    id: 3,
    title: 'Social Media Dashboard',
    description: 'Analytics and insights platform',
    tech: ['React', 'D3.js', 'Firebase', 'Cloud Functions'],
    link: '#',
    image: null,
    featured: true
  },
  {
    id: 4,
    title: 'Real-Time Chat App',
    description: 'WebSocket-based messaging system',
    tech: ['React', 'Socket.io', 'Redis', 'JWT'],
    link: '#',
    image: null,
    featured: false
  },
  {
    id: 5,
    title: 'Weather Forecast App',
    description: 'Beautiful weather visualization',
    tech: ['React', 'REST API', 'Charts', 'Geolocation'],
    link: '#',
    image: null,
    featured: false
  },
  {
    id: 6,
    title: 'Portfolio CMS',
    description: 'Content management system for portfolios',
    tech: ['React', 'Node.js', 'MySQL', 'AWS S3'],
    link: '#',
    image: null,
    featured: false
  }
];

let skills = [
  { id: 1, name: 'React.js', category: 'frontend' },
  { id: 2, name: 'Node.js', category: 'backend' },
  { id: 3, name: 'TypeScript', category: 'frontend' },
  { id: 4, name: 'MongoDB', category: 'backend' },
  { id: 5, name: 'Express.js', category: 'backend' },
  { id: 6, name: 'Tailwind CSS', category: 'frontend' },
  { id: 7, name: 'PostgreSQL', category: 'backend' },
  { id: 8, name: 'Git & GitHub', category: 'tools' },
  { id: 9, name: 'Docker', category: 'tools' },
  { id: 10, name: 'AWS', category: 'cloud' }
];

let contacts = [];

module.exports = {
  projects,
  skills,
  contacts
};

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

let employerToken;
let studentToken;
let testJobId;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/frshure_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Job CRUD Operations', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/employer/login')
      .send({
        email: 'test.employer@frshure.com',
        password: 'TestPass123',
      });

    employerToken = loginRes.body.data.accessToken;

    const studentLoginRes = await request(app)
      .post('/api/v1/student/login')
      .send({
        email: 'test.student@frshure.com',
        password: 'TestPass123',
      });

    studentToken = studentLoginRes.body.data.accessToken;
  });

  it('should create a job', async () => {
    const jobData = {
      title: 'Software Developer Intern',
      description: 'Looking for a passionate intern to join our team. Work on cutting-edge technology and learn from industry experts.',
      'location.city': 'Mumbai',
      'location.state': 'Maharashtra',
      jobType: 'INTERNSHIP',
      slots: 3,
      experienceLevel: 'ENTRY',
      skills: ['JavaScript', 'Node.js', 'MongoDB'],
    };

    const res = await request(app)
      .post('/api/v1/jobs/create')
      .set('Authorization', `Bearer ${employerToken}`)
      .send(jobData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job.title).toBe(jobData.title);
    testJobId = res.body.data.job._id;
  });

  it('should get all jobs', async () => {
    const res = await request(app).get('/api/v1/jobs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
  });

  it('should get job by ID', async () => {
    const res = await request(app).get(`/api/v1/jobs/${testJobId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Software Developer Intern');
  });

  it('should search jobs', async () => {
    const res = await request(app)
      .get('/api/v1/jobs/search')
      .query({ q: 'intern', city: 'Mumbai' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update a job', async () => {
    const res = await request(app)
      .put(`/api/v1/jobs/update/${testJobId}`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ title: 'Senior Software Developer Intern' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Senior Software Developer Intern');
  });

  it('should not allow non-employer to create jobs', async () => {
    const res = await request(app)
      .post('/api/v1/jobs/create')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Job',
        description: 'test',
        'location.city': 'Delhi',
        jobType: 'FULL_TIME',
        slots: 1,
      });

    expect(res.status).toBe(403);
  });
});

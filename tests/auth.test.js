const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const { Student, Employer } = require('../src/models');

let studentToken;
let employerToken;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/frshure_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await Student.deleteMany({ email: /test/ });
  await Employer.deleteMany({ email: /test/ });
  await mongoose.connection.close();
});

describe('Student Authentication', () => {
  const testStudent = {
    firstName: 'Test',
    lastName: 'Student',
    email: 'test.student@frshure.com',
    password: 'TestPass123',
  };

  it('should register a new student', async () => {
    const res = await request(app)
      .post('/api/v1/student/signup')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testStudent.email);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/student/signup')
      .send(testStudent);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login a student', async () => {
    const res = await request(app)
      .post('/api/v1/student/login')
      .send({
        email: testStudent.email,
        password: testStudent.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    studentToken = res.body.data.accessToken;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/student/login')
      .send({
        email: testStudent.email,
        password: 'WrongPass123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should require all fields for signup', async () => {
    const res = await request(app)
      .post('/api/v1/student/signup')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});

describe('Employer Authentication', () => {
  const testEmployer = {
    firstName: 'Test',
    lastName: 'Employer',
    email: 'test.employer@frshure.com',
    password: 'TestPass123',
    phone: '9876543210',
    companyName: 'Test Company',
  };

  it('should register a new employer', async () => {
    const res = await request(app)
      .post('/api/v1/employer/signup')
      .send(testEmployer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmployer.email);
    expect(res.body.data.user.isApproved).toBe(false);
  });

  it('should login employer after approval', async () => {
    const employer = await Employer.findOne({ email: testEmployer.email });
    employer.isApproved = true;
    await employer.save();

    const res = await request(app)
      .post('/api/v1/employer/login')
      .send({
        email: testEmployer.email,
        password: testEmployer.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    employerToken = res.body.data.accessToken;
  });
});

describe('Token Management', () => {
  it('should refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/v1/student/login')
      .send({
        email: 'test.student@frshure.com',
        password: 'TestPass123',
      });

    const res = await request(app)
      .post('/api/v1/refresh-token')
      .send({ refreshToken: loginRes.body.data.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/refresh-token')
      .send({ refreshToken: 'invalid_token' });

    expect(res.status).toBe(401);
  });
});

describe('Protected Routes', () => {
  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/v1/student/profile');
    expect(res.status).toBe(401);
  });

  it('should reject requests with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/student/profile')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.status).toBe(401);
  });

  it('should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/student/profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
  });
});

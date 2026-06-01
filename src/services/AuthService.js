const { StudentRepository, EmployerRepository } = require('../repositories');
const { generateTokenPair, verifyRefreshToken } = require('../utils/token');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class AuthService {
  async studentSignup(data) {
    const existingStudent = await StudentRepository.findByEmail(data.email);
    if (existingStudent) {
      throw new AppError('Email already registered', 409);
    }

    const student = await StudentRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone || null,
    });

    const tokenPayload = { id: student._id, role: 'STUDENT' };
    const tokens = generateTokenPair(tokenPayload);

    await StudentRepository.updateRefreshToken(student._id, tokens.refreshToken);

    logger.info(`Student registered: ${student.email}`);

    return {
      user: student.toPublicJSON(),
      ...tokens,
    };
  }

  async studentLogin(email, password) {
    const student = await StudentRepository.findByEmailWithPassword(email);
    if (!student) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!student.isActive) {
      throw new AppError('Account deactivated. Contact support.', 403);
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = { id: student._id, role: 'STUDENT' };
    const tokens = generateTokenPair(tokenPayload);

    await StudentRepository.updateRefreshToken(student._id, tokens.refreshToken);
    await StudentRepository.updateLastLogin(student._id);

    logger.info(`Student logged in: ${student.email}`);

    return {
      user: student.toPublicJSON(),
      ...tokens,
    };
  }

  async employerSignup(data) {
    const existingEmployer = await EmployerRepository.findByEmail(data.email);
    if (existingEmployer) {
      throw new AppError('Email already registered', 409);
    }

    const employer = await EmployerRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      companyName: data.companyName,
    });

    const tokenPayload = { id: employer._id, role: 'EMPLOYER' };
    const tokens = generateTokenPair(tokenPayload);

    await EmployerRepository.updateRefreshToken(employer._id, tokens.refreshToken);

    logger.info(`Employer registered: ${employer.email}`);

    return {
      user: employer.toPublicJSON(),
      ...tokens,
    };
  }

  async employerLogin(email, password) {
    const employer = await EmployerRepository.findByEmailWithPassword(email);
    if (!employer) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!employer.isActive) {
      throw new AppError('Account deactivated. Contact support.', 403);
    }

    if (!employer.isApproved) {
      throw new AppError('Account pending approval. Please wait for admin verification.', 403);
    }

    const isMatch = await employer.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload = { id: employer._id, role: 'EMPLOYER' };
    const tokens = generateTokenPair(tokenPayload);

    await EmployerRepository.updateRefreshToken(employer._id, tokens.refreshToken);
    await EmployerRepository.updateLastLogin(employer._id);

    logger.info(`Employer logged in: ${employer.email}`);

    return {
      user: employer.toPublicJSON(),
      ...tokens,
    };
  }

  async logout(userId, role) {
    if (role === 'STUDENT') {
      await StudentRepository.updateRefreshToken(userId, null);
    } else if (role === 'EMPLOYER') {
      await EmployerRepository.updateRefreshToken(userId, null);
    }
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const { id, role } = decoded;

    let user = null;
    let storedToken = null;

    if (role === 'STUDENT') {
      user = await StudentRepository.findByIdWithPassword(id);
      if (user) storedToken = user.refreshToken;
    } else if (role === 'EMPLOYER') {
      user = await EmployerRepository.findByIdWithPassword(id);
      if (user) storedToken = user.refreshToken;
    } else {
      throw new AppError('Invalid role in token', 401);
    }

    if (!user || !storedToken || storedToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const tokenPayload = { id: user._id, role };
    const tokens = generateTokenPair(tokenPayload);

    if (role === 'STUDENT') {
      await StudentRepository.updateRefreshToken(user._id, tokens.refreshToken);
    } else if (role === 'EMPLOYER') {
      await EmployerRepository.updateRefreshToken(user._id, tokens.refreshToken);
    }

    return tokens;
  }

  async changePassword(userId, role, currentPassword, newPassword) {
    let user = null;

    if (role === 'STUDENT') {
      user = await StudentRepository.findByIdWithPassword(userId);
    } else if (role === 'EMPLOYER') {
      user = await EmployerRepository.findByIdWithPassword(userId);
    } else {
      throw new AppError('Invalid user role', 400);
    }

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return { message: 'Password changed successfully' };
  }

  async findUserByIdAndRole(id, role) {
    let user = null;

    if (role === 'STUDENT') {
      user = await StudentRepository.findById(id);
    } else if (role === 'EMPLOYER') {
      user = await EmployerRepository.findById(id);
    }

    return user;
  }
}

module.exports = new AuthService();

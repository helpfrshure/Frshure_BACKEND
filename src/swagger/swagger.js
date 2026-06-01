const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FRSHURE API Documentation',
      version: '1.0.0',
      description: 'Backend API for FRSHURE - Student Jobs Marketplace Platform',
      contact: {
        name: 'FRSHURE Support',
        email: 'helpfrshure@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.frshure.in/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
      },
    },
    paths: {
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: {
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Token refreshed successfully' },
            '401': { description: 'Invalid refresh token' },
          },
        },
      },
      '/auth/change-password': {
        put: {
          tags: ['Authentication'],
          summary: 'Change password',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['currentPassword', 'newPassword'],
                  properties: {
                    currentPassword: { type: 'string' },
                    newPassword: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password changed successfully' },
            '401': { description: 'Current password is incorrect' },
          },
        },
      },
      '/student/signup': {
        post: {
          tags: ['Student Auth'],
          summary: 'Register a new student',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password'],
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    phone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Student registered successfully' },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/student/login': {
        post: {
          tags: ['Student Auth'],
          summary: 'Login as student',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/student/logout': {
        post: {
          tags: ['Student Auth'],
          summary: 'Logout student',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Logout successful' },
          },
        },
      },
      '/student/profile': {
        get: {
          tags: ['Student'],
          summary: 'Get student profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Profile retrieved' },
            '401': { description: 'Unauthorized' },
          },
        },
        put: {
          tags: ['Student'],
          summary: 'Update student profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                    profilePhoto: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Profile updated' },
          },
        },
      },
      '/student/applications': {
        get: {
          tags: ['Student'],
          summary: 'Get student applications',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Applications retrieved' },
          },
        },
      },
      '/student/saved-jobs': {
        get: {
          tags: ['Student'],
          summary: 'Get saved jobs',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Saved jobs retrieved' },
          },
        },
      },
      '/student/save-job/{jobId}': {
        post: {
          tags: ['Student'],
          summary: 'Save a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '201': { description: 'Job saved' },
            '409': { description: 'Job already saved' },
          },
        },
      },
      '/student/unsave-job/{jobId}': {
        delete: {
          tags: ['Student'],
          summary: 'Unsave a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Job unsaved' },
            '404': { description: 'Job not saved' },
          },
        },
      },
      '/employer/signup': {
        post: {
          tags: ['Employer Auth'],
          summary: 'Register a new employer',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'password', 'companyName', 'phone'],
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    companyName: { type: 'string' },
                    phone: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Employer registered' },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/employer/login': {
        post: {
          tags: ['Employer Auth'],
          summary: 'Login as employer',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login successful' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/employer/profile': {
        get: {
          tags: ['Employer'],
          summary: 'Get employer profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Profile retrieved' },
          },
        },
        put: {
          tags: ['Employer'],
          summary: 'Update employer profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    companyName: { type: 'string' },
                    companyLogo: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Profile updated' },
          },
        },
      },
      '/employer/dashboard': {
        get: {
          tags: ['Employer'],
          summary: 'Get employer dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Dashboard retrieved' },
          },
        },
      },
      '/employer/analytics': {
        get: {
          tags: ['Employer'],
          summary: 'Get employer analytics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Analytics retrieved' },
          },
        },
      },
      '/jobs/create': {
        post: {
          tags: ['Jobs'],
          summary: 'Create a job posting',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'location', 'jobType', 'slots'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    location: {
                      type: 'object',
                      properties: {
                        city: { type: 'string' },
                        state: { type: 'string' },
                        isRemote: { type: 'boolean' },
                      },
                    },
                    jobType: { type: 'string', enum: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'] },
                    slots: { type: 'integer' },
                    salary: {
                      type: 'object',
                      properties: {
                        min: { type: 'number' },
                        max: { type: 'number' },
                        isNegotiable: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Job created' },
          },
        },
      },
      '/jobs': {
        get: {
          tags: ['Jobs'],
          summary: 'Get all active jobs',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Jobs retrieved' },
          },
        },
      },
      '/jobs/search': {
        get: {
          tags: ['Jobs'],
          summary: 'Search jobs',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'jobType', in: 'query', schema: { type: 'string' } },
            { name: 'experienceLevel', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Search results' },
          },
        },
      },
      '/jobs/filter': {
        get: {
          tags: ['Jobs'],
          summary: 'Filter jobs',
          parameters: [
            { name: 'jobType', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'experienceLevel', in: 'query', schema: { type: 'string' } },
            { name: 'isRemote', in: 'query', schema: { type: 'string' } },
            { name: 'salaryMin', in: 'query', schema: { type: 'number' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Filtered jobs' },
          },
        },
      },
      '/jobs/{jobId}': {
        get: {
          tags: ['Jobs'],
          summary: 'Get job by ID',
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Job retrieved' },
            '404': { description: 'Job not found' },
          },
        },
      },
      '/jobs/update/{jobId}': {
        put: {
          tags: ['Jobs'],
          summary: 'Update a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Job updated' },
          },
        },
      },
      '/jobs/delete/{jobId}': {
        delete: {
          tags: ['Jobs'],
          summary: 'Delete a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Job deleted' },
          },
        },
      },
      '/jobs/apply/{jobId}': {
        post: {
          tags: ['Jobs'],
          summary: 'Apply for a job',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    coverLetter: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Application submitted' },
          },
        },
      },
      '/jobs/applicants/{jobId}': {
        get: {
          tags: ['Jobs'],
          summary: 'Get job applicants',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'jobId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Applicants retrieved' },
          },
        },
      },
      '/application/accept/{applicationId}': {
        put: {
          tags: ['Applications'],
          summary: 'Accept application',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Application accepted' },
          },
        },
      },
      '/application/reject/{applicationId}': {
        put: {
          tags: ['Applications'],
          summary: 'Reject application',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'applicationId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rejectionReason: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Application rejected' },
          },
        },
      },
      '/application/{id}': {
        get: {
          tags: ['Applications'],
          summary: 'Get application by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Application retrieved' },
          },
        },
      },
      '/chat/list': {
        get: {
          tags: ['Chat'],
          summary: 'Get chat list',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Chat list retrieved' },
          },
        },
      },
      '/chat/messages/{chatId}': {
        get: {
          tags: ['Chat'],
          summary: 'Get chat messages',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'chatId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Messages retrieved' },
          },
        },
      },
      '/chat/send': {
        post: {
          tags: ['Chat'],
          summary: 'Send a message',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['receiverId', 'receiverModel', 'message'],
                  properties: {
                    receiverId: { type: 'string' },
                    receiverModel: { type: 'string', enum: ['Student', 'Employer'] },
                    message: { type: 'string' },
                    messageType: { type: 'string', enum: ['text', 'image', 'file'] },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Message sent' },
          },
        },
      },
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notifications',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'unreadOnly', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Notifications retrieved' },
          },
        },
      },
      '/notifications/read/{id}': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark notification as read',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Marked as read' },
          },
        },
      },
      '/notifications/delete/{id}': {
        delete: {
          tags: ['Notifications'],
          summary: 'Delete notification',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Notification deleted' },
          },
        },
      },
      '/payment/create-order': {
        post: {
          tags: ['Payments'],
          summary: 'Create payment order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jobId'],
                  properties: {
                    jobId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Order created' },
          },
        },
      },
      '/payment/verify': {
        post: {
          tags: ['Payments'],
          summary: 'Verify payment',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'orderId'],
                  properties: {
                    razorpay_order_id: { type: 'string' },
                    razorpay_payment_id: { type: 'string' },
                    razorpay_signature: { type: 'string' },
                    orderId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Payment verified' },
          },
        },
      },
      '/payment/webhook': {
        post: {
          tags: ['Payments'],
          summary: 'Razorpay webhook',
          responses: {
            '200': { description: 'Webhook processed' },
          },
        },
      },
      '/admin/dashboard': {
        get: {
          tags: ['Admin'],
          summary: 'Get admin dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Dashboard retrieved' },
          },
        },
      },
      '/admin/employers': {
        get: {
          tags: ['Admin'],
          summary: 'Get all employers',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Employers retrieved' },
          },
        },
      },
      '/admin/approve/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Approve employer',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Employer approved' },
          },
        },
      },
      '/admin/reject/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Reject employer',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Employer rejected' },
          },
        },
      },
      '/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get all users',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': { description: 'Users retrieved' },
          },
        },
      },
      '/admin/user/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Delete user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'role', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'User deleted' },
          },
        },
      },
      '/admin/analytics': {
        get: {
          tags: ['Admin'],
          summary: 'Get analytics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Analytics retrieved' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

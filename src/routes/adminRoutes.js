const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');

router.get(
  '/dashboard',
  authenticate([ROLES.ADMIN]),
  AdminController.getDashboard,
);

router.get(
  '/employers',
  authenticate([ROLES.ADMIN]),
  AdminController.getEmployers,
);

router.put(
  '/approve/:id',
  authenticate([ROLES.ADMIN]),
  AdminController.approveEmployer,
);

router.put(
  '/reject/:id',
  authenticate([ROLES.ADMIN]),
  AdminController.rejectEmployer,
);

router.get(
  '/users',
  authenticate([ROLES.ADMIN]),
  AdminController.getUsers,
);

router.delete(
  '/user/:id',
  authenticate([ROLES.ADMIN]),
  AdminController.deleteUser,
);

router.get(
  '/analytics',
  authenticate([ROLES.ADMIN]),
  AdminController.getAnalytics,
);

module.exports = router;

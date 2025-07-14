const express = require('express');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// List all employees (all roles) with search, filter, and pagination
router.get('/', auth, async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) {
    query.status = status;
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Employee.countDocuments(query);
  const employees = await Employee.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  res.json({
    employees,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  });
});

// Get employee by ID (all roles)
router.get('/:id', auth, async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).json({ msg: 'Employee not found' });
  res.json(employee);
});

// Create employee (admin/manager)
router.post(
  '/',
  auth,
  role(['admin', 'manager']),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('position').notEmpty(),
    body('department').notEmpty(),
    body('status').optional().isIn(['active', 'inactive'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, position, department, status } = req.body;
    let employee = await Employee.findOne({ email });
    if (employee) return res.status(400).json({ msg: 'Employee already exists' });
    // Find the highest current employeeId and increment
    const lastEmployee = await Employee.findOne({}, {}, { sort: { employeeId: -1 } });
    let nextId = 1;
    if (lastEmployee && lastEmployee.employeeId) {
      nextId = parseInt(lastEmployee.employeeId, 10) + 1;
    }
    const employeeId = nextId.toString().padStart(3, '0');
    employee = new Employee({ employeeId, name, email, position, department, status });
    await employee.save();
    req.app.get('io').emit('employeeCreated', employee);
    res.status(201).json(employee);
  }
);

// Update employee (admin/manager)
router.put(
  '/:id',
  auth,
  role(['admin', 'manager']),
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('position').optional().notEmpty(),
    body('department').optional().notEmpty(),
    body('status').optional().isIn(['active', 'inactive'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, position, department, status } = req.body;
    let employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ msg: 'Employee not found' });
    if (name) employee.name = name;
    if (email) employee.email = email;
    if (position) employee.position = position;
    if (department) employee.department = department;
    if (status) employee.status = status;
    await employee.save();
    req.app.get('io').emit('employeeUpdated', employee);
    res.json(employee);
  }
);

// Delete employee (admin/manager)
router.delete('/:id', auth, role(['admin', 'manager']), async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) return res.status(404).json({ msg: 'Employee not found' });
  req.app.get('io').emit('employeeDeleted', { id: req.params.id });
  res.json({ msg: 'Employee deleted' });
});

module.exports = router; 
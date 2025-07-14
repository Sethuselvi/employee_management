// assignEmployeeIds.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';

const employeeSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  email: String,
  position: String,
  department: String,
  status: String,
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema, 'employees');

async function assignEmployeeIds() {
  await mongoose.connect(MONGODB_URI);
  const employees = await Employee.find().sort({ createdAt: 1 });
  for (let i = 0; i < employees.length; i++) {
    const employeeId = (i + 1).toString().padStart(3, '0');
    employees[i].employeeId = employeeId;
    await employees[i].save();
    console.log(`Assigned employeeId ${employeeId} to ${employees[i].name}`);
  }
  await mongoose.disconnect();
  console.log('Done assigning employee IDs.');
}

assignEmployeeIds().catch(err => {
  console.error(err);
  process.exit(1);
}); 
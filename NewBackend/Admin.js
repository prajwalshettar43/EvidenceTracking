const mongoose = require('mongoose');
const {User} = require("./models");// Make sure to adjust the path if needed

const createAdmin = async () => {
  try {
    // Check if the admin already exists
    const adminExists = await User.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('Admin already exists');
      return;
    }

    // Create the admin data
    const adminData = {
      username: 'admin',
      password: 'admin123', // Ideally, hash the password before saving it
      email: 'admin@example.com',
      fullName: 'Admin User',
      batchId: 'admin123',
      department: 'Admin',
      role: 'admin', // Role set to admin
    };

    // Create a new admin user
    const newAdmin = new User(adminData);

    // Save the admin user to the database
    await newAdmin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

// Call the function to create the admin
createAdmin();

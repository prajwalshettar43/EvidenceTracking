const mongoose = require('mongoose');

if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://localhost:27017/myNewDatabase')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
} else {
  console.log('MongoDB already connected');
}

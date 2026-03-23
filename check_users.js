const mongoose = require('mongoose');
const User = require('./server/models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/order_insight_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log('Users found:', users.map(u => ({ email: u.email, username: u.username })));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkUsers();

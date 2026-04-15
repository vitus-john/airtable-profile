const mongoose = require("mongoose");

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
 serverSelectionTimeoutMS: 50000 // Increase timeout
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));
module.exports = mongoose;
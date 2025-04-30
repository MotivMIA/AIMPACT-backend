import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import connectDB from "./db";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Listening at http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
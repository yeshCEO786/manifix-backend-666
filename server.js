// server.js
import 'dotenv/config';           // Load .env locally
import app from './src/app.js';   // Your Express app
import './jobs/expirePremium.js'; // Start scheduled jobs

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

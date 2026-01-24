require('dotenv').config();
const app = require('./src/app');
const config = require('./src/config/config');

const PORT = config.port || 3004;

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});

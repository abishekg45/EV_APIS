const express = require('express');
const bodyParser = require('body-parser');
const carRoutes = require('./routes/cars');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Routes
app.use('/api/vehicles', carRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

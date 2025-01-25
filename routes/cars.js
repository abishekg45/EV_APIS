const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const carsFilePath = path.join(__dirname, '../data/cars.json');

// Utility Functions
function readCars() {
  const data = fs.readFileSync(carsFilePath, 'utf8');
  return JSON.parse(data);
}

function writeCars(data) {
  fs.writeFileSync(carsFilePath, JSON.stringify(data, null, 2));
}

// **GET /api/vehicles**
// Retrieve all EVs with optional sorting and filtering
router.get('/', (req, res) => {
  try {
    let cars = readCars();
    const { sortBy, filterBy, filterValue } = req.query;

    // Filtering
    if (filterBy && filterValue) {
      cars = cars.filter(car =>
        car[filterBy] && String(car[filterBy]).toLowerCase() === String(filterValue).toLowerCase()
      );
    }

    // Sorting
    if (sortBy) {
      cars.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }

    res.status(200).json({ status: 'success', msg: 'Retrieved vehicles', data: cars });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: 'Failed to retrieve vehicles', error: error.message });
  }
});

// **GET /api/vehicles/:id**
// Retrieve details of a single EV by ID
router.get('/:id', (req, res) => {
  try {
    const cars = readCars();
    const car = cars.find(c => c.id === parseInt(req.params.id));

    if (!car) {
      return res.status(200).json({ status: 'failed', msg: 'Vehicle not found' });
    }

    res.status(200).json({ status: 'success', msg: 'Retrieved vehicle', data: car });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: 'Failed to retrieve vehicle', error: error.message });
  }
});

// **POST /api/vehicles**
// Add a new EV with validation
router.post('/', (req, res) => {
  try {
    const { make, model, battery_capacity, charge_level } = req.body;

    // Validation
    if (!make || !model || !battery_capacity || !charge_level) {
      return res.status(400).json({ status: 'failed', msg: 'Invalid input data' });
    }

    if (typeof make !== 'string' || typeof model !== 'string' || make.trim() === '' || model.trim() === '') {
      return res.status(400).json({ status: 'failed', msg: 'Make and model must be non-empty strings' });
    }

    if (typeof battery_capacity !== 'number' || typeof charge_level !== 'number' || battery_capacity <= 0 || charge_level <= 0) {
      return res.status(400).json({ status: 'failed', msg: 'Battery capacity and charge level must be positive numbers' });
    }

    const cars = readCars();

    // Generate the next numeric ID
    const newId = cars.length === 0 ? 1 : Math.max(...cars.map(car => car.id)) + 1;

    const newCar = { id: newId, make, model, battery_capacity, charge_level };
    cars.push(newCar);
    writeCars(cars);

    res.status(201).json({ status: 'success', msg: 'Vehicle added successfully', data: newCar });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: 'Failed to add vehicle', error: error.message });
  }
});

// **PUT /api/vehicles/:id**
// Update an EV's data with validation
router.put('/:id', (req, res) => {
  try {
    const cars = readCars();
    const index = cars.findIndex(c => c.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ status: 'failed', msg: 'Vehicle not found' });
    }

    const { make, model, battery_capacity, charge_level } = req.body;

    // Validation
    if (
      (make && (typeof make !== 'string' || make.trim() === '')) ||
      (model && (typeof model !== 'string' || model.trim() === '')) ||
      (battery_capacity && (typeof battery_capacity !== 'number' || battery_capacity <= 0)) ||
      (charge_level && (typeof charge_level !== 'number' || charge_level <= 0))
    ) {
      return res.status(400).json({ status: 'failed', msg: 'Invalid input data' });
    }

    cars[index] = { ...cars[index], ...req.body };
    writeCars(cars);

    res.status(200).json({ status: 'success', msg: 'Vehicle updated successfully', data: cars[index] });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: 'Failed to update vehicle', error: error.message });
  }
});

// **DELETE /api/vehicles/:id**
// Remove an EV by ID
router.delete('/:id', (req, res) => {
  try {
    const cars = readCars();
    const filteredCars = cars.filter(c => c.id !== parseInt(req.params.id));

    if (cars.length === filteredCars.length) {
      return res.status(404).json({ status: 'failed', msg: 'Vehicle not found' });
    }

    writeCars(filteredCars);
    res.status(200).json({ status: 'success', msg: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'failed', msg: 'Failed to delete vehicle', error: error.message });
  }
});

module.exports = router;

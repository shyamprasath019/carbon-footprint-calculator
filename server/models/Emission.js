// File: src/models/Emission.js
const mongoose = require('mongoose');

const EmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  inputs: {
    travel_km: { type: Number, default: 0 },
    electricity_kwh: { type: Number, default: 0 },
    diet: { type: String, default: 'mixed' },
    flights_shortHaul: { type: Number, default: 0 },
    flights_longHaul: { type: Number, default: 0 },
    naturalGas_kwh: { type: Number, default: 0 },
    carType: { type: String, default: 'petrol' }
  },
  results: {
    total_emission_kg: { type: Number, required: true },
    breakdown: {
      travel: { type: Number, default: 0 },
      electricity: { type: Number, default: 0 },
      diet: { type: Number, default: 0 },
      flights: { type: Number, default: 0 },
      heating: { type: Number, default: 0 }
    }
  },
  recommendations: [{
    title: String,
    description: String,
    potentialSavings_kg: Number,
    category: String
  }]
});

module.exports = mongoose.model('Emission', EmissionSchema);
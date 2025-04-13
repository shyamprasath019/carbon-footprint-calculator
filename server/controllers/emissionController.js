// File: src/controllers/emissionsController.js
const Emission = require('../models/Emission');

// Carbon emission factors (simplified for MVP)
const EMISSION_FACTORS = {
  car: {
    petrol: 0.192, // kg CO2e per km
    diesel: 0.171, // kg CO2e per km
    hybrid: 0.106, // kg CO2e per km
    electric: 0.053 // kg CO2e per km (depends on electricity source)
  },
  flights: {
    shortHaul: 150, // kg CO2e per flight
    longHaul: 1800 // kg CO2e per flight
  },
  electricity: 0.233, // kg CO2e per kWh (varies by country)
  naturalGas: 0.184, // kg CO2e per kWh
  diet: {
    vegan: 1.5, // kg CO2e per day
    vegetarian: 2.5, // kg CO2e per day
    mixed: 4.5, // kg CO2e per day
    'high-meat': 7.3 // kg CO2e per day
  }
};

// Basic recommendation templates
const getRecommendations = (inputs, results) => {
  const recommendations = [];
  
  // Car recommendations
  if (inputs.travel_km > 50) {
    if (inputs.carType === 'petrol' || inputs.carType === 'diesel') {
      recommendations.push({
        title: 'Consider using public transportation',
        description: 'Using public transport for your regular commute could significantly reduce your carbon footprint.',
        potentialSavings_kg: Math.round(inputs.travel_km * 0.1 * 52), // Simplified calculation
        category: 'travel'
      });
      
      recommendations.push({
        title: 'Switch to a hybrid or electric vehicle',
        description: 'Electric vehicles produce significantly lower emissions, especially if charged with renewable energy.',
        potentialSavings_kg: Math.round(inputs.travel_km * (EMISSION_FACTORS.car[inputs.carType] - EMISSION_FACTORS.car.electric) * 52),
        category: 'travel'
      });
    }
  }
  
  // Electricity recommendations
  if (inputs.electricity_kwh > 250) {
    recommendations.push({
      title: 'Switch to energy-efficient appliances',
      description: 'Upgrading to energy-efficient appliances can reduce your electricity consumption by 20-30%.',
      potentialSavings_kg: Math.round(inputs.electricity_kwh * 0.25 * EMISSION_FACTORS.electricity * 12),
      category: 'electricity'
    });
    
    recommendations.push({
      title: 'Consider installing solar panels',
      description: 'Solar panels can offset a significant portion of your electricity-related carbon emissions.',
      potentialSavings_kg: Math.round(inputs.electricity_kwh * 0.7 * EMISSION_FACTORS.electricity * 12),
      category: 'electricity'
    });
  }
  
  // Diet recommendations
  if (inputs.diet === 'high-meat' || inputs.diet === 'mixed') {
    recommendations.push({
      title: inputs.diet === 'high-meat' ? 'Reduce meat consumption' : 'Try plant-based alternatives',
      description: 'Reducing meat consumption, especially beef, can significantly lower your carbon footprint.',
      potentialSavings_kg: Math.round((EMISSION_FACTORS.diet[inputs.diet] - EMISSION_FACTORS.diet.vegetarian) * 365),
      category: 'diet'
    });
  }
  
  return recommendations.slice(0, 3); // Return top 3 recommendations
};

exports.calculateEmissions = async (req, res) => {
  try {
    const { 
      travel_km, 
      electricity_kwh, 
      diet,
      flights_shortHaul,
      flights_longHaul,
      naturalGas_kwh,
      carType = 'petrol'
    } = req.body;
    
    // Calculate emissions for each category
    const travelEmission = travel_km * (EMISSION_FACTORS.car[carType] || EMISSION_FACTORS.car.petrol);
    const electricityEmission = electricity_kwh * EMISSION_FACTORS.electricity;
    const heatingEmission = naturalGas_kwh * EMISSION_FACTORS.naturalGas;
    const dietEmission = (EMISSION_FACTORS.diet[diet] || EMISSION_FACTORS.diet.mixed) * 30; // Monthly
    const flightsEmission = 
      (flights_shortHaul * EMISSION_FACTORS.flights.shortHaul / 12) + 
      (flights_longHaul * EMISSION_FACTORS.flights.longHaul / 12); // Monthly average
    
    // Calculate total emissions
    const totalEmission = travelEmission + electricityEmission + dietEmission + flightsEmission + heatingEmission;
    
    // Create breakdown object
    const breakdown = {
      travel: Math.round(travelEmission * 10) / 10,
      electricity: Math.round(electricityEmission * 10) / 10,
      diet: Math.round(dietEmission * 10) / 10,
      flights: Math.round(flightsEmission * 10) / 10,
      heating: Math.round(heatingEmission * 10) / 10
    };
    
    // Generate recommendations
    const recommendations = getRecommendations(req.body, breakdown);
    
    // Save to database
    const newEmission = new Emission({
      user: req.user.id, // Assuming req.user is set by auth middleware
      inputs: {
        travel_km,
        electricity_kwh,
        diet,
        flights_shortHaul,
        flights_longHaul,
        naturalGas_kwh,
        carType
      },
      results: {
        total_emission_kg: Math.round(totalEmission * 10) / 10,
        breakdown
      },
      recommendations
    });
    
    await newEmission.save();
    
    // Send response
    res.status(201).json({
      message: 'Emission calculation saved successfully',
      emission: {
        total_emission_kg: Math.round(totalEmission * 10) / 10,
        breakdown,
        recommendations
      }
    });
    
  } catch (error) {
    console.error('Emission calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate emissions' });
  }
};

exports.getUserEmissions = async (req, res) => {
  try {
    const emissions = await Emission.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(10);
      
    res.status(200).json(emissions);
  } catch (error) {
    console.error('Get user emissions error:', error);
    res.status(500).json({ message: 'Failed to fetch emissions data' });
  }
};
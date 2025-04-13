// File: src/pages/Calculator.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Calculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    travel_km: 0,
    electricity_kwh: 0,
    diet: 'mixed',
    flights_shortHaul: 0,
    flights_longHaul: 0,
    naturalGas_kwh: 0,
    carType: 'petrol',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'diet' || name === 'carType' ? value : Number(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/emissions/calculate', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.error('Error calculating emissions:', error);
      alert('Failed to calculate emissions. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Carbon Footprint Calculator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Transportation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Car Type</label>
              <select
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="petrol">Petrol/Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Car Travel (km/week)</label>
              <input
                type="number"
                name="travel_km"
                value={formData.travel_km}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Short-haul Flights (per year)</label>
              <input
                type="number"
                name="flights_shortHaul"
                value={formData.flights_shortHaul}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Long-haul Flights (per year)</label>
              <input
                type="number"
                name="flights_longHaul"
                value={formData.flights_longHaul}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Home Energy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Electricity (kWh/month)</label>
              <input
                type="number"
                name="electricity_kwh"
                value={formData.electricity_kwh}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Natural Gas (kWh/month)</label>
              <input
                type="number"
                name="naturalGas_kwh"
                value={formData.naturalGas_kwh}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Diet & Lifestyle</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Diet Type</label>
            <select
              name="diet"
              value={formData.diet}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="mixed">Mixed (Some meat)</option>
              <option value="high-meat">High meat consumption</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            {loading ? 'Calculating...' : 'Calculate My Carbon Footprint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Calculator;
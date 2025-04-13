// File: src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const [emissions, setEmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestEmission, setLatestEmission] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await axios.get('http://localhost:5000/api/emissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEmissions(response.data);
        
        if (response.data.length > 0) {
          setLatestEmission(response.data[0]); // Most recent emission
          
          // Create historical data for chart
          const historical = response.data
            .slice(0, 6)
            .reverse()
            .map(emission => ({
              date: new Date(emission.date).toLocaleDateString(),
              emissions: emission.results.total_emission_kg
            }));
            
          setHistoricalData(historical);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching emissions:', error);
        setError('Failed to load your carbon footprint data');
        setLoading(false);
      }
    };
    
    fetchEmissions();
  }, []);
  
  // Prepare data for pie chart
  const getPieData = () => {
    if (!latestEmission) return [];
    
    const { breakdown } = latestEmission.results;
    return Object.entries(breakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value
    }));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (emissions.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">No Data Yet</h2>
        <p className="mb-6">You haven't calculated your carbon footprint yet.</p>
        <a 
          href="/calculator"
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
        >
          Calculate Now
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Your Carbon Footprint Dashboard</h1>
        
        {latestEmission && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Latest Calculation</h2>
              <p className="text-sm text-gray-600">
                {new Date(latestEmission.date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-lg">
                Your estimated carbon footprint: 
                <span className="font-bold text-2xl ml-2">
                  {latestEmission.results.total_emission_kg} kg CO₂e
                </span>
                <span className="text-sm text-gray-600 ml-2">per month</span>
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emissions by Category */}
          <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Emissions by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPieData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Historical Trend */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Historical Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                  <Bar dataKey="emissions" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      {latestEmission && latestEmission.recommendations && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations to Reduce Your Footprint</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestEmission.recommendations.map((recommendation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{recommendation.title}</h3>
                <p className="text-gray-600 mb-3">{recommendation.description}</p>
                <div className="bg-green-100 rounded px-3 py-1 inline-block">
                  <span className="text-green-800 font-medium">
                    Save up to {recommendation.potentialSavings_kg} kg CO₂e/year
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
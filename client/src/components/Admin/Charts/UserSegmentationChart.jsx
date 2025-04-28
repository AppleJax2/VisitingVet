import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Bootstrap components
import { LoadingSpinner } from '../../Shared/LoadingSpinner';
import { ErrorMessage } from '../../Shared/ErrorMessage';

// Placeholder colors - can be expanded or made dynamic
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const UserSegmentationChart = ({ data: apiData, loading, error, title = "User Segmentation" }) => {

    // TODO: Adapt based on actual API response structure for segments
    // Assuming apiData might look like: 
    // { results: [ { segment: 'Vet', count: 150 }, { segment: 'Owner', count: 850 } ], criteria: 'role' }
    // Or: { results: [ { segment: 'High Activity', count: 200 }, { segment: 'Medium', count: 500 }, ... ], criteria: 'activity' }
    
    const chartData = apiData?.results || []; // Expecting an array like [{ name: 'SegmentA', value: 100 }, ...]
    const criteria = apiData?.criteria || 'Unknown Criteria'; // Get criteria from data if available

    return (
        <div className="card h-100">
            <div className="card-header">
                <h5 className="card-title mb-0">{title} ({criteria})</h5>
            </div>
            <div className="card-body d-flex flex-column">
                {loading && <div className="d-flex justify-content-center align-items-center flex-grow-1"><LoadingSpinner /></div>}
                {error && <div className="d-flex justify-content-center align-items-center flex-grow-1"><ErrorMessage message={error.message || 'Error loading chart data.'} /></div>}
                {!loading && !error && apiData && (
                    <div className="flex-grow-1" style={{ minHeight: '250px', position: 'relative' }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    {/* Adjust nameKey and dataKey if API response structure is different */}
                                    <Pie
                                        data={chartData} 
                                        cx="50%" 
                                        cy="50%" 
                                        labelLine={false}
                                        // label={renderCustomizedLabel} // Optional: Custom labels
                                        outerRadius={80} 
                                        fill="#8884d8"
                                        dataKey="count" // Key holding the value/count
                                        nameKey="segment" // Key holding the segment name/label
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted mt-3">No segmentation data available.</p>
                        )}
                    </div>
                )}
                 {!loading && !error && !apiData && (
                     <p className="text-center text-muted mt-3">No data available.</p>
                 )}
            </div>
        </div>
    );
};

export default UserSegmentationChart; 
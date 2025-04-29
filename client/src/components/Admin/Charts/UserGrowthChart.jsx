import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale, // Keep TimeScale
    Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Keep date adapter

// Bootstrap components (assuming they exist)
import LoadingSpinner from '../../Shared/LoadingSpinner';
import ErrorMessage from '../../Shared/ErrorMessage';

// Register necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const UserGrowthChart = ({ data: apiData, loading, error }) => {

    // Determine if we have comparison data or total data
    const isComparisonView = apiData && apiData.comparisonPeriod && apiData.comparisonPeriod !== 'total';
    const results = isComparisonView ? apiData.results : null;
    const totals = (!isComparisonView && apiData) ? apiData : null;

    // Prepare chart data for comparison view
    const lineChartData = {
        labels: isComparisonView ? results.map(point => new Date(point.period)) : [],
        datasets: isComparisonView ? [
            {
                label: 'New Users',
                data: results.map(point => point.newUsers),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true,
                yAxisID: 'y', // Assign to the primary Y-axis
            }
        ] : [],
    };

    // Chart options (slightly adjusted for comparison view)
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: `User Growth Trend (${apiData?.comparisonPeriod})` },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    // Adjust unit based on comparison period if possible, default to day
                    unit: apiData?.comparisonPeriod || 'day', 
                    tooltipFormat: 'PP'
                },
                title: { display: true, text: 'Period' },
            },
            y: { // Primary Y-axis for New Users
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'New Users' },
                beginAtZero: true
            }
            // Removed secondary y-axis (y1) for total users in comparison view
        },
         interaction: { mode: 'nearest', axis: 'x', intersect: false }
    };

    return (
        <div className="card h-100">
            <div className="card-header">
                <h5 className="card-title mb-0">User Growth</h5>
            </div>
            <div className="card-body d-flex flex-column">
                {loading && <div className="d-flex justify-content-center align-items-center flex-grow-1"><LoadingSpinner /></div>}
                {error && <div className="d-flex justify-content-center align-items-center flex-grow-1"><ErrorMessage message={error.message || 'Error loading chart data.'} /></div>}
                {!loading && !error && apiData && (
                    <div className="flex-grow-1" style={{ minHeight: '250px', position: 'relative' }}>
                        {isComparisonView ? (
                            results && results.length > 0 ? (
                                <Line options={lineChartOptions} data={lineChartData} />
                            ) : (
                                <p className="text-center text-muted mt-3">No user growth data available for this period.</p>
                            )
                        ) : (
                            // Display totals if not in comparison view
                             <div className="text-center mt-3">
                                 <p><strong>New Users:</strong> {totals?.newUsers ?? 'N/A'}</p>
                                 <p><strong>Total Users:</strong> {totals?.totalUsers ?? 'N/A'}</p>
                                 <p><strong>Growth Rate:</strong> {totals?.growthRate !== undefined ? `${(totals.growthRate * 100).toFixed(2)}%` : 'N/A'}</p>
                                 <small className="text-muted">Period: {new Date(totals?.period?.start).toLocaleDateString()} - {new Date(totals?.period?.end).toLocaleDateString()}</small>
                             </div>
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

export default UserGrowthChart; 
import React from 'react';

const ComparisonSelector = ({ currentPeriod, onPeriodChange }) => {
    const periods = [
        { key: 'day', label: 'Daily' },
        { key: 'week', label: 'Weekly' },
        { key: 'month', label: 'Monthly' },
        { key: 'year', label: 'Yearly' },
    ];

    // Using Button Group for selection
    return (
        <div className="mb-3">
            <label className="form-label me-2">Group Data By:</label>
            <div className="btn-group" role="group" aria-label="Comparison Period Selection">
                {periods.map(period => (
                    <button
                        key={period.key}
                        type="button"
                        className={`btn ${currentPeriod === period.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onPeriodChange(period.key)}
                    >
                        {period.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ComparisonSelector; 
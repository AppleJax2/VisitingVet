import React, { useState, useEffect } from 'react';

// Helper to format date as YYYY-MM-DD for input type="date"
const formatDateForInput = (date) => {
    if (!date) return '';
    // Ensure date is a Date object
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return ''; // Handle invalid date
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DateRangeSelector = ({ initialStartDate, initialEndDate, onDatesChange }) => {
    // Initialize state with formatted initial dates or defaults
    const [startDate, setStartDate] = useState(formatDateForInput(initialStartDate));
    const [endDate, setEndDate] = useState(formatDateForInput(initialEndDate));
    const [error, setError] = useState('');

    // Update local state if initial props change
    useEffect(() => {
        setStartDate(formatDateForInput(initialStartDate));
    }, [initialStartDate]);

    useEffect(() => {
        setEndDate(formatDateForInput(initialEndDate));
    }, [initialEndDate]);

    const handleApply = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Basic validation
        if (!startDate || !endDate) {
             setError('Please select both start and end dates.');
             return;
        }
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError('Invalid date format selected.');
            return;
        }
        if (start > end) {
            setError('Start date cannot be after end date.');
            return;
        }
        
        setError(''); // Clear previous errors
        onDatesChange(start, end); // Pass Date objects back
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="row g-3 align-items-center">
                    <div className="col-md-4">
                        <label htmlFor="startDate" className="form-label">Start Date</label>
                        <input 
                            type="date" 
                            className={`form-control ${error && (!startDate || new Date(startDate) > new Date(endDate)) ? 'is-invalid' : ''}`}
                            id="startDate" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="endDate" className="form-label">End Date</label>
                        <input 
                            type="date" 
                            className={`form-control ${error && (!endDate || new Date(startDate) > new Date(endDate)) ? 'is-invalid' : ''}`}
                            id="endDate" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="col-md-auto align-self-end">
                        <button 
                            type="button" 
                            className="btn btn-primary w-100"
                            onClick={handleApply}
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
                 {error && (
                    <div className="row mt-2">
                        <div className="col">
                            <div className="alert alert-danger py-2 mb-0" role="alert">
                                {error}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangeSelector; 
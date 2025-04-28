/**
 * Utilities for CSV generation.
 */

/**
 * Escapes a cell value for CSV format.
 * Handles null/undefined, commas, double quotes, and newlines.
 * @param {*} cell - The value to escape.
 * @returns {string} The escaped cell value.
 */
const escapeCsvCell = (cell) => {
    if (cell === null || cell === undefined) {
        return '';
    }
    const cellStr = String(cell);
    // If the cell contains a comma, double quote, or newline, enclose in double quotes
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        // Escape existing double quotes by doubling them
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
};

/**
 * Converts an array of objects to a CSV formatted string.
 * @param {Array<object>} dataArray - The array of data objects.
 * @param {Array<string>} headers - An array of header strings (keys in the objects).
 * @returns {string} The CSV formatted string.
 */
const convertToCsv = (dataArray, headers) => {
    if (!Array.isArray(dataArray)) {
        return ''; // Return empty string if data is not an array
    }
    if (dataArray.length === 0) {
        // Return only header if data array is empty
        return headers.map(escapeCsvCell).join(',') + '\n';
    }
    const headerRow = headers.map(escapeCsvCell).join(',');
    const dataRows = dataArray.map(row => 
        headers.map(header => escapeCsvCell(row[header])).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
};

module.exports = {
    escapeCsvCell,
    convertToCsv,
}; 
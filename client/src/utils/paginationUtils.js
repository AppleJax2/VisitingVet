/**
 * Utility function to safely render pagination components
 * Handles undefined Pagination component or properties
 * 
 * @param {Object} Pagination - React Bootstrap Pagination component
 * @param {Object} pagination - Pagination data from API response
 * @param {number} currentPage - Current active page number
 * @param {Function} handlePageChange - Function to call when page is changed
 * @returns {Array|null} Array of pagination items or null if pagination not needed
 */
export const renderPaginationItems = (Pagination, pagination, currentPage, handlePageChange) => {
  // Early return if no pagination needed
  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1 || !Pagination) {
    return null;
  }

  let items = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  // First and Previous buttons
  if (Pagination.First) {
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1} 
      />
    );
  }
  
  if (Pagination.Prev) {
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
      />
    );
  }

  // Starting ellipsis if needed
  if (startPage > 1 && Pagination.Ellipsis) {
    items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
  }

  // Page numbers
  for (let number = startPage; number <= endPage; number++) {
    if (Pagination.Item) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage} 
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
  }

  // Ending ellipsis if needed
  if (endPage < pagination.totalPages && Pagination.Ellipsis) {
    items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
  }

  // Next and Last buttons
  if (Pagination.Next) {
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === pagination.totalPages} 
      />
    );
  }
  
  if (Pagination.Last) {
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(pagination.totalPages)} 
        disabled={currentPage === pagination.totalPages} 
      />
    );
  }

  return items;
};

/**
 * Check if pagination component should be rendered
 * 
 * @param {Object} pagination - Pagination data from API response
 * @returns {boolean} True if pagination should be rendered
 */
export const shouldRenderPagination = (pagination) => {
  return pagination && pagination.totalPages && pagination.totalPages > 1;
};

export default {
  renderPaginationItems,
  shouldRenderPagination
}; 
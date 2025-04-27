import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Pagination, FloatingLabel } from 'react-bootstrap';
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import { searchProviders } from '../services/api';
import { Search, GeoAltFill, TagFill, HeartPulseFill } from 'react-bootstrap-icons';
import debounce from 'lodash.debounce';

// Assume these are the possible values from the backend model
const ANIMAL_TYPES = ['Small Animal', 'Large Animal', 'Exotic', 'Avian', 'Equine', 'Farm Animal', 'Other'];
// Add known specialties if applicable, or fetch them from backend later
const SPECIALTY_SERVICES = ['General Practice', 'Surgery', 'Dentistry', 'Emergency', 'Ferrier', 'Diagnostics'];

function ProviderSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});

  // Search and filter state - initialize from URL query params
  const queryParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [searchLocation, setSearchLocation] = useState(queryParams.get('location') || '');
  const [selectedAnimalTypes, setSelectedAnimalTypes] = useState(queryParams.getAll('animalTypes') || []);
  const [selectedSpecialties, setSelectedSpecialties] = useState(queryParams.getAll('specialtyServices') || []);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);

  // Function to fetch providers based on current state
  const fetchProviders = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    const params = {
      page,
      limit: 9, // Show 9 results per page (fits 3x3 grid)
      search: searchTerm.trim(),
      location: searchLocation.trim(),
      animalTypes: selectedAnimalTypes.join(','),
      specialtyServices: selectedSpecialties.join(','),
    };

    // Remove empty params
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key];
      }
    });

    try {
      const data = await searchProviders(params);
      
      if (data && data.success) {
        // Check if data is in data.data (search endpoint) or data.profiles (list endpoint)
        const providerResults = data.data || data.profiles || [];
        setResults(providerResults);
        
        // Handle pagination data which might be directly in data or in data.pagination
        if (data.pagination) {
          setPagination(data.pagination);
          setCurrentPage(data.pagination.page || 1);
        } else {
          // Simple pagination if the backend doesn't provide it
          setPagination({
            page: page,
            limit: params.limit || 9,
            total: providerResults.length,
            pages: 1, // Just one page if we don't know the total
          });
        }
        
        // Update URL query params without full page reload
        navigate({ search: `?${createSearchParams(params)}` }, { replace: true });
      } else {
        setError(data.message || 'Failed to fetch providers.');
        setResults([]);
        setPagination({});
      }
    } catch (err) {
      setError(err.message || 'An error occurred while searching.');
      setResults([]);
      setPagination({});
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, searchLocation, selectedAnimalTypes, selectedSpecialties, navigate]);

  // Debounced search trigger
  const debouncedFetch = useCallback(debounce(() => fetchProviders(1), 500), [fetchProviders]);

  // Effect to fetch on initial load and when filters/search terms change (debounced)
  useEffect(() => {
    // Fetch immediately if page changes, otherwise debounce for text inputs
    if (currentPage !== pagination?.page) {
       fetchProviders(currentPage);
    } else {
       // Fetch initial data based on URL params on first load
       if (!location.search && !isLoading && results.length === 0) {
         fetchProviders(1);
       } else {
         // Debounce subsequent fetches triggered by input changes
         debouncedFetch();
       }
    }
    // Cleanup debounce timer on unmount
    return () => debouncedFetch.cancel();
  }, [searchTerm, searchLocation, selectedAnimalTypes, selectedSpecialties, currentPage, fetchProviders, debouncedFetch, location.search]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleAnimalTypeChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAnimalTypes(prev =>
      checked ? [...prev, value] : prev.filter(type => type !== value)
    );
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleSpecialtyChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSpecialties(prev =>
      checked ? [...prev, value] : prev.filter(spec => spec !== value)
    );
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Function to render pagination
  const renderPaginationItems = () => {
    if (!pagination.pages || pagination.pages <= 1) return null;

    let items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    items.push(
      <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
    );
    items.push(
      <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
    );

    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < pagination.pages) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    items.push(
      <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.pages} />
    );
    items.push(
      <Pagination.Last key="last" onClick={() => handlePageChange(pagination.pages)} disabled={currentPage === pagination.pages} />
    );

    return items;
  };

  // View a provider's profile
  const viewProviderProfile = (userId) => {
    navigate(`/providers/${userId}`);
  };

  return (
    <Container fluid className="my-4">
      <Row>
        {/* Filters Sidebar */}
        <Col md={3} className="mb-4">
          <Card>
            <Card.Header as="h5">Refine Search</Card.Header>
            <Card.Body>
              <Form>
                <FloatingLabel controlId="searchTerm" label="Search Name/Bio..." className="mb-3">
                  <Form.Control
                    type="search"
                    placeholder="Search Name/Bio..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset page on new search
                    }}
                  />
                </FloatingLabel>

                <FloatingLabel controlId="searchLocation" label="ZIP Code / Area" className="mb-3">
                  <Form.Control
                    type="search"
                    placeholder="ZIP Code / Area"
                    value={searchLocation}
                    onChange={(e) => {
                      setSearchLocation(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </FloatingLabel>

                <h6 className="mt-4"><HeartPulseFill className="me-2"/>Animal Types</h6>
                <div className="mb-3 filter-checkbox-group">
                  {ANIMAL_TYPES.map(type => (
                    <Form.Check
                      key={type}
                      type="checkbox"
                      id={`animal-${type}`}
                      label={type}
                      value={type}
                      checked={selectedAnimalTypes.includes(type)}
                      onChange={handleAnimalTypeChange}
                    />
                  ))}
                </div>

                <h6 className="mt-4"><TagFill className="me-2"/>Specialties</h6>
                <div className="filter-checkbox-group">
                  {SPECIALTY_SERVICES.map(spec => (
                    <Form.Check
                      key={spec}
                      type="checkbox"
                      id={`specialty-${spec}`}
                      label={spec}
                      value={spec}
                      checked={selectedSpecialties.includes(spec)}
                      onChange={handleSpecialtyChange}
                    />
                  ))}
                </div>

              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Search Results */}
        <Col md={9}>
          <h1 className="mb-4">Find a Visiting Veterinarian</h1>
          {error && <Alert variant="danger">{error}</Alert>}

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : results.length === 0 ? (
            <Alert variant="info" className="text-center">
              No visiting veterinarians found matching your criteria. Try adjusting your search filters.
            </Alert>
          ) : (
            <>
              <Row xs={1} md={2} lg={3} className="g-4">
                {results.map(profile => (
                  <Col key={profile._id}>
                    <Card className="h-100 shadow-sm provider-card">
                       <Card.Img 
                         variant="top" 
                         src={profile.user?.profileImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                         alt={`${profile.user?.name || 'Provider'}'s image`} 
                         style={{ height: '200px', objectFit: 'cover' }}
                       />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="text-primary mb-2">{profile.businessName || profile.user?.name || 'Unnamed Provider'}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{profile.user?.email}</Card.Subtitle>
                        <Card.Text className="text-muted flex-grow-1">
                          {profile.bio && profile.bio.length > 100
                            ? `${profile.bio.substring(0, 100)}...`
                            : profile.bio || 'No bio available.'}
                        </Card.Text>
                        <div>
                          {profile.animalTypes && profile.animalTypes.length > 0 && (
                            <div className="mb-1">
                              <HeartPulseFill size={14} className="me-1 text-secondary"/> 
                              <small className="text-muted">{profile.animalTypes.join(', ')}</small>
                            </div>
                          )}
                          {profile.serviceAreaDescription && (
                            <div className="mb-2">
                              <GeoAltFill size={14} className="me-1 text-secondary"/>
                              <small className="text-muted">{profile.serviceAreaDescription}</small>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline-primary" size="sm"
                          className="mt-auto align-self-start"
                          onClick={() => viewProviderProfile(profile.user._id)}
                        >
                          View Profile
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {pagination.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>{renderPaginationItems()}</Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ProviderSearchPage;

// Add some basic CSS for better presentation (consider moving to App.css or a dedicated CSS file)
const style = document.createElement('style');
style.textContent = `
  .filter-checkbox-group {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    padding: 10px;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }
  .provider-card {
    transition: transform .2s ease-in-out, box-shadow .2s ease-in-out;
  }
  .provider-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0,0,0,.1);
  }
`;
document.head.appendChild(style); 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert, Pagination, FloatingLabel, Collapse } from 'react-bootstrap';
import { useNavigate, useLocation, createSearchParams } from 'react-router-dom';
import { searchProviders } from '../services/api';
import { Search, GeoAltFill, TagFill, HeartPulseFill, InfoCircle, StarFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import debounce from 'lodash.debounce';

// Assume these are the possible values from the backend model
const ANIMAL_TYPES = ['Small Animal', 'Large Animal', 'Exotic', 'Avian', 'Equine', 'Farm Animal', 'Other'];
// Add known specialties if applicable, or fetch them from backend later
const SPECIALTY_SERVICES = ['General Practice', 'Surgery', 'Dentistry', 'Emergency', 'Ferrier', 'Diagnostics'];

// Helper function to render rating stars
const renderStars = (rating) => {
  const totalStars = 5;
  const filledStars = Math.round(rating || 0); // Round rating to nearest whole number
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <StarFill 
        key={i} 
        size={16} 
        className={i <= filledStars ? 'text-warning me-1' : 'text-muted me-1'} 
      />
    );
  }
  return <div className="mb-2">{stars} <small className="text-muted">({(rating || 0).toFixed(1)})</small></div>; // Show rating value
};

function ProviderSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resultsContainerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [liveRegionText, setLiveRegionText] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const [searchTerm, setSearchTerm] = useState(queryParams.get('q') || '');
  const [searchLocation, setSearchLocation] = useState(queryParams.get('loc') || '');
  const [selectedAnimalTypes, setSelectedAnimalTypes] = useState(queryParams.getAll('animalTypes') || []);
  const [selectedSpecialties, setSelectedSpecialties] = useState(queryParams.getAll('specialtyServices') || []);
  const [currentPage, setCurrentPage] = useState(parseInt(queryParams.get('page')) || 1);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const fetchProviders = useCallback(async (pageToFetch = 1) => {
    setIsLoading(true);
    setError('');
    const currentPageForAPI = pageToFetch;
    const limit = 12;

    const params = {
      page: currentPageForAPI,
      limit: limit,
      q: searchTerm.trim(),
      loc: searchLocation.trim(),
      animalTypes: selectedAnimalTypes,
      specialtyServices: selectedSpecialties,
    };

    Object.keys(params).forEach(key => {
      if (key !== 'page' && key !== 'limit' && !params[key]) {
        delete params[key];
      }
      if ((key === 'animalTypes' || key === 'specialtyServices') && params[key]?.length === 0) {
         delete params[key];
      }
    });

    try {
      const response = await searchProviders(params);
      const providerResults = response.data.providers || [];
      const paginationData = response.data.pagination || {};

      setResults(providerResults);
      setPagination(paginationData);
      setCurrentPage(paginationData.currentPage || pageToFetch);

      const { currentPage: pgCurrent, totalPages: pgTotalPages, totalProviders: pgTotal } = paginationData;
      const count = providerResults.length;
      const start = count > 0 ? (pgCurrent - 1) * limit + 1 : 0;
      const end = start + count - 1;
      const liveText = count > 0
        ? `Showing ${start}-${end} of ${pgTotal} providers. Page ${pgCurrent} of ${pgTotalPages}.`
        : `No providers found matching your criteria.`;
      setLiveRegionText(liveText);

      setTimeout(() => {
        if (resultsContainerRef.current) {
          resultsContainerRef.current.focus();
        }
      }, 100);

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch providers. Please try again later.';
      setError(errorMsg);
      setResults([]);
      setPagination({});
      setLiveRegionText('Error fetching providers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, searchLocation, selectedAnimalTypes, selectedSpecialties, navigate]);

  useEffect(() => {
    const paramsFromUrl = new URLSearchParams(location.search);
    setSearchTerm(paramsFromUrl.get('q') || '');
    setSearchLocation(paramsFromUrl.get('loc') || '');
    setSelectedAnimalTypes(paramsFromUrl.getAll('animalTypes') || []);
    setSelectedSpecialties(paramsFromUrl.getAll('specialtyServices') || []);
    const pageFromUrl = parseInt(paramsFromUrl.get('page')) || 1;
    setCurrentPage(pageFromUrl);

    fetchProviders(pageFromUrl);

  }, [location.search]);

  const debouncedUpdateUrl = useCallback(debounce(() => {
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (searchLocation) params.loc = searchLocation;
      if (selectedAnimalTypes.length > 0) params.animalTypes = selectedAnimalTypes;
      if (selectedSpecialties.length > 0) params.specialtyServices = selectedSpecialties;
      if (currentPage > 1) params.page = currentPage;

      const searchString = createSearchParams(params).toString();
      navigate(`${location.pathname}?${searchString}`, { replace: true });
  }, 500), [searchTerm, searchLocation, selectedAnimalTypes, selectedSpecialties, currentPage, navigate, location.pathname]);

  useEffect(() => {
      debouncedUpdateUrl();
      return () => debouncedUpdateUrl.cancel();
  }, [searchTerm, searchLocation, selectedAnimalTypes, selectedSpecialties, currentPage, debouncedUpdateUrl]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleCheckboxChange = (setter, currentValues) => (e) => {
    const { value, checked } = e.target;
    setter(prev =>
      checked ? [...prev, value] : prev.filter(item => item !== value)
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchLocation('');
    setSelectedAnimalTypes([]);
    setSelectedSpecialties([]);
    setCurrentPage(1);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Lat:', position.coords.latitude, 'Lon:', position.coords.longitude);
        setGeoError('Geolocation successful, but reverse geocoding needed to fill input.');
        setIsGeolocating(false);
      },
      (error) => {
        setGeoError(`Geolocation error: ${error.message}`);
        setIsGeolocating(false);
      }
    );
  };

  const renderPaginationItems = () => {
    if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
      return null;
    }

    let items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Only add pagination elements if Pagination is defined
    if (Pagination) {
      if (Pagination.First) {
        items.push(
          <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        );
      }
      
      if (Pagination.Prev) {
        items.push(
          <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        );
      }

      if (startPage > 1 && Pagination.Ellipsis) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }

      for (let number = startPage; number <= endPage; number++) {
        if (Pagination.Item) {
          items.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
              {number}
            </Pagination.Item>
          );
        }
      }

      if (endPage < pagination.totalPages && Pagination.Ellipsis) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }

      if (Pagination.Next) {
        items.push(
          <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} />
        );
      }
      
      if (Pagination.Last) {
        items.push(
          <Pagination.Last key="last" onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages} />
        );
      }
    }

    return items;
  };

  const viewProviderProfile = (userId) => {
    navigate(`/provider/${userId}`);
  };

  return (
    <Container fluid className="my-4">
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {liveRegionText}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="d-flex align-items-center">
          <ExclamationTriangleFill className="me-2" size={20}/>
          <div>{error}</div>
        </Alert>
      )}
      <Row>
        <Col md={3} xs={12} className="mb-4 mb-md-0 sticky-sidebar">
          <Card>
            <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
              Refine Search
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="d-md-none"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-controls="filter-collapse-area"
                aria-expanded={isFilterOpen}
              >
                {isFilterOpen ? 'Hide' : 'Show'} Filters
              </Button>
            </Card.Header>
            <Collapse in={isFilterOpen} className="d-md-block"> 
              <div id="filter-collapse-area">
                <Card.Body>
                  <Form>
                    <FloatingLabel controlId="searchTermInput" label="Search Name/Bio..." className="mb-3">
                      <Form.Control
                        type="search"
                        placeholder="Search Name/Bio..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </FloatingLabel>

                    <InputGroup className="mb-3">
                      <FloatingLabel controlId="searchLocationInput" label="ZIP Code / Area" className="flex-grow-1">
                        <Form.Control
                          type="search"
                          placeholder="ZIP Code / Area"
                          value={searchLocation}
                          onChange={(e) => {
                            setSearchLocation(e.target.value);
                            setCurrentPage(1);
                          }}
                          disabled={isGeolocating}
                        />
                      </FloatingLabel>
                      <Button variant="outline-secondary" onClick={handleGeolocate} disabled={isGeolocating} title="Use Current Location" aria-label="Use current location">
                        {isGeolocating ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <GeoAltFill />}
                      </Button>
                    </InputGroup>
                    {geoError && <Alert variant="warning" size="sm" className="mt-2">{geoError}</Alert>}

                    <h6 className="mt-4"><HeartPulseFill className="me-2"/>Animal Types</h6>
                    <div className="mb-3">
                      {ANIMAL_TYPES.map(type => (
                        <Form.Check
                          key={`animal-${type}`}
                          type="checkbox"
                          id={`animal-${type.replace(/\s+/g, '-')}`}
                          label={type}
                          value={type}
                          checked={selectedAnimalTypes.includes(type)}
                          onChange={handleCheckboxChange(setSelectedAnimalTypes, selectedAnimalTypes)}
                        />
                      ))}
                    </div>

                    <h6><TagFill className="me-2"/>Specialties</h6>
                    <div className="mb-3">
                      {SPECIALTY_SERVICES.map(spec => (
                        <Form.Check
                          key={`spec-${spec}`}
                          type="checkbox"
                          id={`spec-${spec.replace(/\s+/g, '-')}`}
                          label={spec}
                          value={spec}
                          checked={selectedSpecialties.includes(spec)}
                          onChange={handleCheckboxChange(setSelectedSpecialties, selectedSpecialties)}
                        />
                      ))}
                    </div>

                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="mt-3 w-100" 
                      onClick={handleClearFilters}
                      disabled={!searchTerm && !searchLocation && selectedAnimalTypes.length === 0 && selectedSpecialties.length === 0}
                     >
                       Clear All Filters
                     </Button>

                  </Form>
                </Card.Body>
              </div>
            </Collapse>
          </Card>
        </Col>

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
            <Alert variant="light" className="text-center p-4 border rounded d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
              <InfoCircle size={50} className="mb-3 text-secondary" />
              <h5 className="mb-3">No Veterinarians Found</h5>
              <p className="mb-0 text-muted">No visiting veterinarians found matching your criteria. Try adjusting your search filters.</p>
            </Alert>
          ) : (
            <>
              <Row 
                ref={resultsContainerRef} 
                tabIndex={-1} 
                aria-label={liveRegionText}
                xs={1} md={2} lg={3} className="g-4"
              >
                {results.map(profile => (
                  <Col key={profile._id}>
                    <Card className="h-100 shadow-sm provider-card">
                       <Card.Img 
                         variant="top" 
                         src={profile.user?.profileImage || 'https://via.placeholder.com/300x200?text=No+Image'} 
                         alt={`${profile.user?.name || 'Provider'}'s image`} 
                         style={{ height: '200px', objectFit: 'cover' }}
                         onError={(e) => { 
                           if (e.target.src !== 'https://via.placeholder.com/300x200?text=No+Image') {
                             e.target.onerror = null;
                             e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                           }
                         }} 
                       />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="text-primary mb-2">{profile.businessName || profile.user?.name || 'Unnamed Provider'}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{profile.user?.email}</Card.Subtitle>
                        
                        {renderStars(profile.averageRating)} 

                        <Card.Text 
                          className="text-muted flex-grow-1 mb-3"
                          style={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 3, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                           }}
                          title={profile.bio || 'No bio available.'}
                        >
                          {profile.bio || 'No bio available.'}
                        </Card.Text>
                        <div className="mb-3">
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

              {pagination.totalPages > 1 && (
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

const stickyStyle = document.createElement('style');
stickyStyle.textContent = `
  @media (min-width: 768px) {
    .sticky-sidebar {
      position: sticky;
      top: 20px;
      height: calc(100vh - 40px);
      overflow-y: auto;
    }
    .sticky-sidebar > .card {
       height: 100%; 
    }
  }
`;
document.head.appendChild(stickyStyle); 
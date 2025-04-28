import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Document, Page, pdfjs } from 'react-pdf';
import { Spinner, Alert, Button, ButtonGroup, Row, Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Pencil, Highlighter, StickyFill, X, Save } from 'react-bootstrap-icons';
import logger from '../../utils/logger';

// Configure PDF.js worker
// Try to load from CDN, fallback to local node_modules (adjust path if needed)
try {
    // Attempt to set worker source from CDN first for broader compatibility
    // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    // Updated approach for react-pdf v7+ using direct import path:
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
    ).toString();
} catch (e) {
    logger.error("Failed to set PDF.js worker source:", e);
    // Fallback or further error handling might be needed
}

const styles = {
    viewerContainer: {
        maxWidth: '100%',
        maxHeight: '75vh', // Limit height
        overflow: 'auto',
        border: '1px solid #ccc',
        backgroundColor: '#eee',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Align pages to top
        position: 'relative',
    },
    pdfPage: {
        marginBottom: '10px',
        boxShadow: '0 0 8px rgba(0,0,0,0.3)',
        position: 'relative',
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'block',
        margin: 'auto',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f8f9fa',
    },
    pageControls: {
        display: 'flex',
        alignItems: 'center',
    },
    annotationContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
    },
    annotation: {
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'pointer',
    },
    note: {
        position: 'absolute',
        backgroundColor: '#FFFF88',
        padding: '8px',
        border: '1px solid #E6E600',
        borderRadius: '4px',
        maxWidth: '200px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        zIndex: 20,
        cursor: 'move',
    },
    highlight: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        border: '1px solid rgba(255, 255, 0, 0.5)',
        pointerEvents: 'auto',
        cursor: 'pointer',
    },
    drawing: {
        position: 'absolute',
        top: 0, 
        left: 0,
        pointerEvents: 'none',
        zIndex: 5,
    },
    saveButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
    },
    annotationPanel: {
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '10px',
    }
};

// Annotation type constants
const ANNOTATION_TYPES = {
    HIGHLIGHT: 'highlight',
    NOTE: 'note',
    DRAWING: 'drawing',
};

function DocumentViewer({ documentUrl, contentType, onSaveAnnotations, initialAnnotations = [] }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Annotation states
    const [annotations, setAnnotations] = useState(initialAnnotations);
    const [activeAnnotationTool, setActiveAnnotationTool] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentDrawingPath, setCurrentDrawingPath] = useState([]);
    const [isDraggingNote, setIsDraggingNote] = useState(false);
    const [currentDraggedNote, setCurrentDraggedNote] = useState(null);
    const [showAnnotationList, setShowAnnotationList] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    
    const canvasRef = useRef(null);
    const viewerContainerRef = useRef(null);
    const pageRef = useRef(null);

    // Handle initial annotations
    useEffect(() => {
        if (initialAnnotations.length > 0) {
            setAnnotations(initialAnnotations);
        }
    }, [initialAnnotations]);

    function onDocumentLoadSuccess({ numPages: nextNumPages }) {
        setNumPages(nextNumPages);
        setPageNumber(1); // Reset to first page on new doc load
        setIsLoading(false);
        setError('');
        logger.info(`Document loaded successfully: ${documentUrl}, Pages: ${nextNumPages}`);
    }

    function onDocumentLoadError(loadError) {
        logger.error(`Failed to load document: ${documentUrl}`, loadError);
        setError(`Failed to load document: ${loadError.message || 'Unknown error'}`);
        setIsLoading(false);
        setNumPages(null);
    }

    const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
    const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
    const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3.0)); // Max zoom 3x
    const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.5)); // Min zoom 0.5x

    const toggleAnnotationTool = (tool) => {
        if (activeAnnotationTool === tool) {
            setActiveAnnotationTool(null);
        } else {
            setActiveAnnotationTool(tool);
        }
    };

    // Get mouse position relative to the PDF page
    const getMousePosition = (e) => {
        if (!pageRef.current) return { x: 0, y: 0 };
        
        const rect = pageRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        };
    };

    // Handle mouse down event for annotations
    const handleMouseDown = (e) => {
        if (!activeAnnotationTool) return;
        
        const pos = getMousePosition(e);
        
        if (activeAnnotationTool === ANNOTATION_TYPES.HIGHLIGHT) {
            // Start creating a highlight
            const newAnnotation = {
                id: Date.now().toString(),
                type: ANNOTATION_TYPES.HIGHLIGHT,
                page: pageNumber,
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                createdAt: new Date().toISOString(),
            };
            setAnnotations([...annotations, newAnnotation]);
            setIsDrawing(true);
        } else if (activeAnnotationTool === ANNOTATION_TYPES.NOTE) {
            // Create a new note
            const newAnnotation = {
                id: Date.now().toString(),
                type: ANNOTATION_TYPES.NOTE,
                page: pageNumber,
                x: pos.x,
                y: pos.y,
                text: '',
                createdAt: new Date().toISOString(),
                editing: true,
            };
            setAnnotations([...annotations, newAnnotation]);
            setUnsavedChanges(true);
        } else if (activeAnnotationTool === ANNOTATION_TYPES.DRAWING) {
            // Start drawing
            setIsDrawing(true);
            setCurrentDrawingPath([{ x: pos.x, y: pos.y }]);
        }
    };

    // Handle mouse move event for annotations
    const handleMouseMove = (e) => {
        if (!isDrawing || !activeAnnotationTool) return;
        
        const pos = getMousePosition(e);
        
        if (activeAnnotationTool === ANNOTATION_TYPES.HIGHLIGHT) {
            // Update highlight dimensions
            setAnnotations(annotations.map(anno => {
                if (anno.id === annotations[annotations.length - 1].id) {
                    const startX = anno.x;
                    const startY = anno.y;
                    return {
                        ...anno,
                        width: pos.x - startX,
                        height: pos.y - startY
                    };
                }
                return anno;
            }));
        } else if (activeAnnotationTool === ANNOTATION_TYPES.DRAWING) {
            // Continue drawing
            setCurrentDrawingPath([...currentDrawingPath, { x: pos.x, y: pos.y }]);
        }
    };

    // Handle mouse up event for annotations
    const handleMouseUp = () => {
        if (!isDrawing || !activeAnnotationTool) return;
        
        if (activeAnnotationTool === ANNOTATION_TYPES.DRAWING && currentDrawingPath.length > 1) {
            // Save the drawing
            const newAnnotation = {
                id: Date.now().toString(),
                type: ANNOTATION_TYPES.DRAWING,
                page: pageNumber,
                path: currentDrawingPath,
                color: '#FF0000', // Default red color
                width: 2, // Default line width
                createdAt: new Date().toISOString(),
            };
            setAnnotations([...annotations, newAnnotation]);
            setCurrentDrawingPath([]);
            setUnsavedChanges(true);
        }
        
        setIsDrawing(false);
    };

    // Handle note drag start
    const handleNoteDragStart = (e, id) => {
        e.stopPropagation();
        setIsDraggingNote(true);
        setCurrentDraggedNote(id);
    };

    // Handle note dragging
    const handleNoteDrag = (e, id) => {
        if (!isDraggingNote || currentDraggedNote !== id) return;
        
        const pos = getMousePosition(e);
        
        // Update note position
        setAnnotations(annotations.map(anno => {
            if (anno.id === id) {
                return {
                    ...anno,
                    x: pos.x,
                    y: pos.y
                };
            }
            return anno;
        }));
    };

    // Handle note drag end
    const handleNoteDragEnd = () => {
        setIsDraggingNote(false);
        setCurrentDraggedNote(null);
        setUnsavedChanges(true);
    };

    // Handle note text edit
    const handleNoteTextChange = (id, text) => {
        setAnnotations(annotations.map(anno => {
            if (anno.id === id) {
                return {
                    ...anno,
                    text
                };
            }
            return anno;
        }));
        setUnsavedChanges(true);
    };

    // Handle note edit complete
    const handleNoteEditComplete = (id) => {
        setAnnotations(annotations.map(anno => {
            if (anno.id === id) {
                return {
                    ...anno,
                    editing: false
                };
            }
            return anno;
        }));
    };

    // Handle note edit start
    const handleNoteEdit = (e, id) => {
        e.stopPropagation();
        setAnnotations(annotations.map(anno => {
            if (anno.id === id) {
                return {
                    ...anno,
                    editing: true
                };
            }
            return anno;
        }));
    };

    // Delete annotation
    const deleteAnnotation = (id) => {
        setAnnotations(annotations.filter(anno => anno.id !== id));
        setUnsavedChanges(true);
    };

    // Save annotations
    const saveAnnotations = () => {
        if (onSaveAnnotations) {
            onSaveAnnotations(annotations);
            setUnsavedChanges(false);
            logger.info('Annotations saved successfully');
        }
    };

    // Render highlight annotations
    const renderHighlights = () => {
        return annotations
            .filter(anno => anno.type === ANNOTATION_TYPES.HIGHLIGHT && anno.page === pageNumber)
            .map(highlight => (
                <div
                    key={highlight.id}
                    style={{
                        ...styles.highlight,
                        left: `${highlight.x * scale}px`,
                        top: `${highlight.y * scale}px`,
                        width: `${highlight.width * scale}px`,
                        height: `${highlight.height * scale}px`,
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this highlight?')) {
                            deleteAnnotation(highlight.id);
                        }
                    }}
                />
            ));
    };

    // Render note annotations
    const renderNotes = () => {
        return annotations
            .filter(anno => anno.type === ANNOTATION_TYPES.NOTE && anno.page === pageNumber)
            .map(note => (
                <div
                    key={note.id}
                    style={{
                        ...styles.note,
                        left: `${note.x * scale}px`,
                        top: `${note.y * scale}px`,
                    }}
                    onMouseDown={(e) => handleNoteDragStart(e, note.id)}
                    onMouseMove={(e) => handleNoteDrag(e, note.id)}
                    onMouseUp={handleNoteDragEnd}
                    onMouseLeave={handleNoteDragEnd}
                >
                    {note.editing ? (
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={note.text || ''}
                            onChange={(e) => handleNoteTextChange(note.id, e.target.value)}
                            onBlur={() => handleNoteEditComplete(note.id)}
                            autoFocus
                            placeholder="Add note..."
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <>
                            <div onClick={(e) => handleNoteEdit(e, note.id)}>
                                {note.text || 'Click to edit'}
                            </div>
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="position-absolute top-0 end-0 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAnnotation(note.id);
                                }}
                            >
                                <X size={12} />
                            </Button>
                        </>
                    )}
                </div>
            ));
    };

    // Render drawing annotations
    const renderDrawings = () => {
        // Helper to convert path to SVG path string
        const pathToSvgString = (path) => {
            if (!path || path.length < 2) return '';
            
            const start = path[0];
            let svgPath = `M ${start.x} ${start.y}`;
            
            for (let i = 1; i < path.length; i++) {
                svgPath += ` L ${path[i].x} ${path[i].y}`;
            }
            
            return svgPath;
        };
        
        // Get all drawings for current page
        const pageDrawings = annotations.filter(
            anno => anno.type === ANNOTATION_TYPES.DRAWING && anno.page === pageNumber
        );
        
        // Current drawing path if any
        const currentPath = isDrawing && activeAnnotationTool === ANNOTATION_TYPES.DRAWING
            ? pathToSvgString(currentDrawingPath)
            : null;
        
        // Calculate required SVG dimensions based on page size
        const svgWidth = pageRef.current?.clientWidth || 800;
        const svgHeight = pageRef.current?.clientHeight || 1000;
        
        return (
            <svg 
                width={svgWidth} 
                height={svgHeight}
                style={styles.drawing}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Existing drawings */}
                {pageDrawings.map(drawing => (
                    <g key={drawing.id}>
                        <path
                            d={pathToSvgString(drawing.path)}
                            stroke={drawing.color}
                            strokeWidth={drawing.width}
                            fill="none"
                            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                        />
                        <path
                            d={pathToSvgString(drawing.path)}
                            stroke="transparent"
                            strokeWidth={10} // Wider stroke for easier click detection
                            fill="none"
                            style={{ cursor: 'pointer', transform: `scale(${scale})`, transformOrigin: 'top left' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Delete this drawing?')) {
                                    deleteAnnotation(drawing.id);
                                }
                            }}
                        />
                    </g>
                ))}
                
                {/* Current drawing in progress */}
                {currentPath && (
                    <path
                        d={currentPath}
                        stroke="#FF0000"
                        strokeWidth={2}
                        fill="none"
                        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                    />
                )}
            </svg>
        );
    };

    // Render annotations list
    const renderAnnotationsList = () => {
        if (!showAnnotationList) return null;
        
        return (
            <div style={styles.annotationPanel}>
                <h6>Annotations ({annotations.length})</h6>
                {annotations.length === 0 ? (
                    <p className="text-muted">No annotations yet</p>
                ) : (
                    <ul className="list-group">
                        {annotations.map(anno => (
                            <li key={anno.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="badge bg-secondary me-2">Page {anno.page}</span>
                                    <span>
                                        {anno.type === ANNOTATION_TYPES.NOTE ? 
                                            (anno.text || 'Empty note') : 
                                            `${anno.type.charAt(0).toUpperCase() + anno.type.slice(1)}`
                                        }
                                    </span>
                                </div>
                                <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => deleteAnnotation(anno.id)}
                                >
                                    <X size={12} />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const isPdf = contentType?.toLowerCase() === 'application/pdf';
    const isImage = contentType?.toLowerCase().startsWith('image/');

    return (
        <div>
            {/* Toolbar */}
            <div style={styles.toolbar}>
                <div style={styles.pageControls}>
                    {isPdf && numPages ? (
                        <>
                            <ButtonGroup size="sm">
                                <Button variant="outline-secondary" onClick={goToPrevPage} disabled={pageNumber <= 1}><ChevronLeft /></Button>
                                <Button variant="outline-secondary" onClick={goToNextPage} disabled={pageNumber >= numPages}><ChevronRight /></Button>
                            </ButtonGroup>
                            <span className="mx-2">Page {pageNumber} of {numPages}</span>
                        </>
                    ) : (
                        <div /> // Ensures alignment when no page controls are shown
                    )}
                </div>
                
                <div>
                    <ButtonGroup size="sm" className="me-2">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Highlight tool</Tooltip>}>
                            <Button 
                                variant={activeAnnotationTool === ANNOTATION_TYPES.HIGHLIGHT ? "primary" : "outline-secondary"} 
                                onClick={() => toggleAnnotationTool(ANNOTATION_TYPES.HIGHLIGHT)}
                            >
                                <Highlighter />
                            </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="top" overlay={<Tooltip>Sticky note</Tooltip>}>
                            <Button 
                                variant={activeAnnotationTool === ANNOTATION_TYPES.NOTE ? "primary" : "outline-secondary"}
                                onClick={() => toggleAnnotationTool(ANNOTATION_TYPES.NOTE)}
                            >
                                <StickyFill />
                            </Button>
                        </OverlayTrigger>
                        
                        <OverlayTrigger placement="top" overlay={<Tooltip>Draw</Tooltip>}>
                            <Button 
                                variant={activeAnnotationTool === ANNOTATION_TYPES.DRAWING ? "primary" : "outline-secondary"}
                                onClick={() => toggleAnnotationTool(ANNOTATION_TYPES.DRAWING)}
                            >
                                <Pencil />
                            </Button>
                        </OverlayTrigger>
                    </ButtonGroup>
                    
                    <Button 
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShowAnnotationList(!showAnnotationList)}
                    >
                        {showAnnotationList ? "Hide Annotations" : "Show Annotations"}
                    </Button>
                </div>

                {(isPdf || isImage) &&
                    <ButtonGroup size="sm">
                        <Button variant="outline-secondary" onClick={zoomOut} disabled={scale <= 0.5}><ZoomOut /></Button>
                        <Button variant="outline-secondary" onClick={zoomIn} disabled={scale >= 3.0}><ZoomIn /></Button>
                        <span className="align-self-center ms-2">{(scale * 100).toFixed(0)}%</span>
                    </ButtonGroup>
                }
            </div>

            {/* Annotations List */}
            {renderAnnotationsList()}

            {/* Viewer Area */}
            <div 
                style={styles.viewerContainer} 
                ref={viewerContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {isLoading && <div className="p-5"><Spinner animation="border" /> Loading Document...</div>}
                {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                
                {!isLoading && !error && (
                    <> 
                        {isPdf && (
                            <div ref={pageRef}>
                                <Document
                                    file={documentUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    onLoadError={onDocumentLoadError}
                                    options={{
                                        // cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                                        // cMapPacked: true,
                                    }}
                                    loading={<Spinner animation="border" size="sm" />}
                                    error={<Alert variant="warning">Failed to load PDF page.</Alert>}
                                    // renderMode="canvas" // or svg/canvas
                                >
                                    <Page 
                                        pageNumber={pageNumber} 
                                        scale={scale}
                                        renderTextLayer={false} // Disable text layer for performance if not needed
                                        renderAnnotationLayer={false} // Disable annotation layer from PDF itself
                                        customTextRenderer={false} // Disable custom text rendering
                                        loading="" // Prevent default loading indicator within Page
                                        error={<Alert variant="warning">Failed to render page.</Alert>}
                                        style={styles.pdfPage}
                                    />
                                </Document>
                                
                                {/* Annotations layer */}
                                <div style={styles.annotationContainer}>
                                    {renderHighlights()}
                                    {renderNotes()}
                                    {renderDrawings()}
                                </div>
                            </div>
                        )}

                        {isImage && (
                            <div ref={pageRef} style={{ position: 'relative' }}>
                                <img 
                                    src={documentUrl} 
                                    alt="Document" 
                                    style={{...styles.image, transform: `scale(${scale})`, transformOrigin: 'top center'}} 
                                />
                                
                                {/* Annotations layer */}
                                <div style={styles.annotationContainer}>
                                    {renderHighlights()}
                                    {renderNotes()}
                                    {renderDrawings()}
                                </div>
                            </div>
                        )}

                        {!isPdf && !isImage && (
                            <Alert variant="warning" className="m-3">
                                Unsupported document type: {contentType || 'Unknown'}. Cannot display preview.
                                <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="ms-2">Download</a>
                            </Alert>
                        )}
                    </>
                )}
            </div>
            
            {/* Save button (visible when there are unsaved changes) */}
            {unsavedChanges && onSaveAnnotations && (
                <Button
                    variant="primary"
                    style={styles.saveButton}
                    onClick={saveAnnotations}
                >
                    <Save className="me-1" /> Save Annotations
                </Button>
            )}
        </div>
    );
}

DocumentViewer.propTypes = {
    documentUrl: PropTypes.string.isRequired,
    contentType: PropTypes.string, // Optional, but helpful for determining viewer type
    onSaveAnnotations: PropTypes.func, // Callback function to save annotations
    initialAnnotations: PropTypes.array, // Initial annotations to load
};

export default DocumentViewer; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEdit, 
    faTrash, 
    faSave, 
    faTimes,
    faPlus,
    faCircle,
    faDotCircle,
    faChevronRight,
    faChevronDown,
    faLayerGroup,
    faUsers,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';
import './HierarchyManagement.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const HierarchyManagement = () => {
    const navigate = useNavigate();
    const [showCreationForm, setShowCreationForm] = useState(false);
    const [hierarchyLevels, setHierarchyLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [hierarchyValues, setHierarchyValues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [expandedLevels, setExpandedLevels] = useState(new Set());
    const [addingValueToLevel, setAddingValueToLevel] = useState(null);
    const [showEditLevelModal, setShowEditLevelModal] = useState(false);
    const [showEditValueModal, setShowEditValueModal] = useState(false);

    // Form states
    const [newLevel, setNewLevel] = useState({ name: '', description: '', order: '' });
    const [newValue, setNewValue] = useState({ value: '', description: '' });
    
    // Edit states
    const [editingLevel, setEditingLevel] = useState(null);
    const [editingValue, setEditingValue] = useState(null);
    const [editLevelData, setEditLevelData] = useState({ name: '', description: '', order: '' });
    const [editValueData, setEditValueData] = useState({ value: '', description: '' });

    // Get auth header
    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        fetchHierarchyLevels();
    }, []);

    // Fetch values for all levels when levels change
    useEffect(() => {
        if (hierarchyLevels.length > 0) {
            const fetchAllValues = async () => {
                const allValues = [];
                for (const level of hierarchyLevels) {
                    try {
                        const response = await axios.get(
                            `/api/organization/hierarchy-levels/${level.id}/values/`,
                            getAuthHeader()
                        );
                        if (response.data && response.data.status === 'success' && response.data.data) {
                            allValues.push(...response.data.data);
                        }
                    } catch (err) {
                        console.error(`Error fetching values for level ${level.id}:`, err);
                    }
                }
                setHierarchyValues(allValues);
            };
            fetchAllValues();
        }
    }, [hierarchyLevels]);

    const fetchHierarchyLevels = async () => {
        try {
            const response = await axios.get('/api/organization/hierarchy-levels/', getAuthHeader());
            
            if (response.status === 200) {
                setHierarchyLevels(response.data);
                setLoading(false);
            } else {
                toast.error('Failed to fetch hierarchy levels');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching hierarchy levels:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch hierarchy levels');
            setLoading(false);
        }
    };

    const fetchHierarchyValues = async (levelId) => {
        try {
            const response = await axios.get(
                `/api/organization/hierarchy-levels/${levelId}/values/`,
                getAuthHeader()
            );
            if (response.data && response.data.status === 'success' && response.data.data) {
                // Update only the values for this level
                setHierarchyValues(prevValues => {
                    const otherLevelValues = prevValues.filter(v => v.hierarchy_level !== levelId);
                    return [...otherLevelValues, ...response.data.data];
                });
            } else {
                toast.error(response.data?.message || 'Failed to fetch hierarchy values');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch hierarchy values');
        }
    };

    const handleLevelSelect = async (level) => {
        setSelectedLevel(level);
        await fetchHierarchyValues(level.id);
    };

    const handleCreateLevel = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(
                '/api/organization/hierarchy-levels/',
                {
                    name: newLevel.name,
                    description: newLevel.description,
                    is_active: true,
                    order: newLevel.order ? parseInt(newLevel.order) : hierarchyLevels.length + 1
                },
                getAuthHeader()
            );
            
            if (response.status === 201 || response.status === 200) {
                setHierarchyLevels(prevLevels => [...prevLevels, response.data]);
                setNewLevel({ name: '', description: '', order: '' });
                setShowCreationForm(false);
                toast.success('Hierarchy level created successfully');
            } else {
                toast.error('Failed to create hierarchy level');
            }
        } catch (err) {
            console.error('Error creating hierarchy level:', err);
            if (err.response?.data?.detail) {
                const errors = err.response.data.detail;
                if (typeof errors === 'object') {
                    const errorMessages = Object.values(errors).flat();
                    toast.error(errorMessages.join(', '));
                } else {
                    toast.error(errors);
                }
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to create hierarchy level. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddValueClick = (level) => {
        setAddingValueToLevel(level.id);
        setSelectedLevel(level);
        setNewValue({ value: '', description: '' });
    };

    const handleAddValueInline = async (e) => {
        e.preventDefault();
        if (!selectedLevel) {
            toast.error('Please select a hierarchy level first');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.post(
                `/api/organization/hierarchy-levels/${selectedLevel.id}/add_value/`,
                {
                    value: newValue.value,
                    description: newValue.description,
                    is_active: true
                },
                getAuthHeader()
            );
            
            if (response.data && response.data.status === 'success') {
                setHierarchyValues(prevValues => [...prevValues, response.data.data]);
                setNewValue({ value: '', description: '' });
                setAddingValueToLevel(null);
                toast.success(response.data.message);
            } else {
                toast.error(response.data?.message || 'Failed to add hierarchy value');
            }
        } catch (err) {
            console.error('Error adding hierarchy value:', err);
            if (err.response?.data?.data) {
                const errors = err.response.data.data;
                const errorMessages = Object.values(errors).flat();
                toast.error(errorMessages.join(', '));
            } else if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to add hierarchy value');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditLevel = (level) => {
        setEditingLevel(level);
        setEditLevelData({ name: level.name, description: level.description || '', order: level.order });
        setShowEditLevelModal(true);
    };

    const handleSaveLevel = async () => {
        try {
            setLoading(true);
            const updateData = {
                name: editLevelData.name,
                description: editLevelData.description,
                order: editLevelData.order,
                is_active: editingLevel.is_active
            };
            
            console.log('Sending update data:', updateData);
            console.log('Editing level:', editingLevel);
            
            const response = await axios.put(
                `/api/organization/hierarchy-levels/${editingLevel.id}/`,
                updateData,
                getAuthHeader()
            );
            
            console.log('Update response:', response);
            
            if (response.status === 200) {
                setHierarchyLevels(prevLevels => 
                    prevLevels.map(level => 
                        level.id === editingLevel.id 
                            ? { ...level, ...editLevelData }
                            : level
                    )
                );
                setEditingLevel(null);
                setEditLevelData({ name: '', description: '', order: '' });
                setShowEditLevelModal(false);
                toast.success('Hierarchy level updated successfully');
            } else {
                toast.error('Failed to update hierarchy level');
            }
        } catch (err) {
            console.error('Error updating hierarchy level:', err);
            console.error('Error response:', err.response);
            toast.error(err.response?.data?.message || 'Failed to update hierarchy level');
        } finally {
            setLoading(false);
        }
    };

    const handleEditValue = (value) => {
        setEditingValue(value);
        setEditValueData({ value: value.value, description: value.description || '' });
        setShowEditValueModal(true);
    };

    const handleSaveValue = async () => {
        try {
            setLoading(true);
            const updateData = {
                value: editValueData.value,
                description: editValueData.description,
                hierarchy_level: editingValue.hierarchy_level,
                is_active: editingValue.is_active
            };
            
            console.log('Sending value update data:', updateData);
            console.log('Editing value:', editingValue);
            
            const response = await axios.put(
                `/api/organization/hierarchy-values/${editingValue.id}/`,
                updateData,
                getAuthHeader()
            );
            
            console.log('Value update response:', response);
            
            if (response.status === 200) {
                setHierarchyValues(prevValues => 
                    prevValues.map(value => 
                        value.id === editingValue.id 
                            ? { ...value, ...editValueData }
                            : value
                    )
                );
                setEditingValue(null);
                setEditValueData({ value: '', description: '' });
                setShowEditValueModal(false);
                toast.success('Hierarchy value updated successfully');
            } else {
                toast.error('Failed to update hierarchy value');
            }
        } catch (err) {
            console.error('Error updating hierarchy value:', err);
            console.error('Error response:', err.response);
            toast.error(err.response?.data?.message || 'Failed to update hierarchy value');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLevel = async (levelId) => {
        if (!window.confirm('Are you sure you want to delete this hierarchy level? This will also delete all associated values.')) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.delete(
                `/api/organization/hierarchy-levels/${levelId}/`,
                getAuthHeader()
            );
            
            if (response.status === 204) {
                setHierarchyLevels(prevLevels => prevLevels.filter(level => level.id !== levelId));
                setHierarchyValues(prevValues => prevValues.filter(value => value.hierarchy_level !== levelId));
                toast.success('Hierarchy level deleted successfully');
            } else {
                toast.error('Failed to delete hierarchy level');
            }
        } catch (err) {
            console.error('Error deleting hierarchy level:', err);
            toast.error(err.response?.data?.message || 'Failed to delete hierarchy level');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteValue = async (valueId) => {
        if (!window.confirm('Are you sure you want to delete this hierarchy value?')) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.delete(
                `/api/organization/hierarchy-values/${valueId}/`,
                getAuthHeader()
            );
            
            if (response.status === 204) {
                setHierarchyValues(prevValues => prevValues.filter(value => value.id !== valueId));
                toast.success('Hierarchy value deleted successfully');
            } else {
                toast.error('Failed to delete hierarchy value');
            }
        } catch (err) {
            console.error('Error deleting hierarchy value:', err);
            toast.error(err.response?.data?.message || 'Failed to delete hierarchy value');
        } finally {
            setLoading(false);
        }
    };

    // Toggle expanded state for a level
    const toggleLevelExpanded = (levelId) => {
        setExpandedLevels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(levelId)) {
                newSet.delete(levelId);
            } else {
                newSet.add(levelId);
            }
            return newSet;
        });
    };

    // Check if a level is expanded
    const isLevelExpanded = (levelId) => expandedLevels.has(levelId);

    const renderHierarchyLevels = () => {
        if (!hierarchyLevels.length) {
            return (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FontAwesomeIcon icon={faLayerGroup} size="3x" />
                    </div>
                    <h3>No Hierarchy Levels Found</h3>
                    <p>Create your first hierarchy level to organize your structure.</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            const defaultOrder = hierarchyLevels.length > 0 ? Math.max(...hierarchyLevels.map(l => l.order)) + 1 : 1;
                            setNewLevel({ name: '', description: '', order: defaultOrder.toString() });
                            setShowCreationForm(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Create First Level
                    </button>
                </div>
            );
        }

        // Sort levels by order
        const sortedLevels = [...hierarchyLevels].sort((a, b) => a.order - b.order);

        // Group levels by order number
        const groupedLevels = sortedLevels.reduce((groups, level) => {
            const order = level.order;
            if (!groups[order]) {
                groups[order] = [];
            }
            groups[order].push(level);
            return groups;
        }, {});

        // Convert to array and sort by order
        const levelGroups = Object.entries(groupedLevels)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([order, levels]) => ({ order: parseInt(order), levels }));

        return (
            <div className="hierarchy-tree-container">
                <div className="tree-header">
                    <div className="header-content">
                        <div className="header-title">
                            <FontAwesomeIcon icon={faBuilding} className="header-icon" />
                            <h3>Organizational Hierarchy</h3>
                            <span className="level-count">{hierarchyLevels.length} levels</span>
                        </div>
                        <div className="header-actions">
                            <button
                                className={`btn ${isEditMode ? 'btn-warning' : 'btn-outline-primary'}`}
                                onClick={() => setIsEditMode(!isEditMode)}
                            >
                                <FontAwesomeIcon icon={isEditMode ? faTimes : faEdit} className="me-2" />
                                {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="hierarchy-tree">
                    {levelGroups.map((group) => (
                        <div key={group.order} className="level-group">
                            {group.levels.map((level) => {
                                const levelValues = hierarchyValues.filter(v => v.hierarchy_level === level.id);
                                const isExpanded = isLevelExpanded(level.id);
                                const isAddingValue = addingValueToLevel === level.id;
                                return (
                                    <div key={level.id} className="level-item" style={{ marginLeft: `${40 * (level.order - 1)}px`, position: 'relative' }}>
                                        {level.order > 1 && (
                                            <div className="vertical-line" />
                                        )}
                                        <div className="level-row">
                                            <div className="level-content" onClick={() => toggleLevelExpanded(level.id)}>
                                                <div className="level-toggle">
                                                    <FontAwesomeIcon
                                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                                        className="toggle-icon"
                                                    />
                                                </div>
                                                <div className="level-info">
                                                    <div className="level-name">
                                                        <FontAwesomeIcon icon={faLayerGroup} className="level-icon" />
                                                        <span className="name-text">{level.name}</span>
                                                        <span className="order-badge">Level {level.order}</span>
                                                    </div>
                                                    {level.description && (
                                                        <div className="level-description">{level.description}</div>
                                                    )}
                                                    <div className="level-stats">
                                                        <span className="value-count">
                                                            <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                                                            {levelValues.length} values
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isEditMode && (
                                                <div className="level-actions">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary action-btn"
                                                        onClick={() => handleEditLevel(level)}
                                                        title="Edit Level"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success action-btn"
                                                        onClick={() => handleAddValueClick(level)}
                                                        title="Add Value"
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-info action-btn"
                                                        onClick={() => {
                                                            const defaultOrder = level.order + 1;
                                                            setNewLevel({ name: '', description: '', order: defaultOrder.toString() });
                                                            setShowCreationForm(true);
                                                        }}
                                                        title="Add New Level"
                                                    >
                                                        <FontAwesomeIcon icon={faLayerGroup} />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger action-btn"
                                                        onClick={() => handleDeleteLevel(level.id)}
                                                        title="Delete Level"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Inline Add Value Form */}
                                        {isAddingValue && (
                                            <div className="inline-add-value-form">
                                                <div className="form-card">
                                                    <div className="form-header">
                                                        <h5>Add Value to {level.name}</h5>
                                                        <button 
                                                            className="hm-modal-close-btn"
                                                            onClick={() => setAddingValueToLevel(null)}
                                                        >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </button>
                                                    </div>
                                                    <form onSubmit={handleAddValueInline} className="add-value-form">
                                                        <div className="form-group">
                                                            <label>Value Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder={`Enter ${level.name.toLowerCase()} name`}
                                                                value={newValue.value}
                                                                onChange={(e) => setNewValue({ ...newValue, value: e.target.value })}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Description</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter description (optional)"
                                                                value={newValue.description}
                                                                onChange={(e) => setNewValue({ ...newValue, description: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="form-actions">
                                                            <button 
                                                                type="submit" 
                                                                className="btn btn-primary"
                                                                disabled={loading}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} className="me-2" />
                                                                Add Value
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-secondary"
                                                                onClick={() => setAddingValueToLevel(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Tree Children - Values */}
                                        {isExpanded && (
                                            <div className="values-container">
                                                {levelValues.length > 0 ? (
                                                    levelValues.map((value) => (
                                                        <div key={value.id} className="value-item">
                                                            <div className="value-content">
                                                                <FontAwesomeIcon icon={faDotCircle} className="value-icon" />
                                                                <div className="value-info">
                                                                    <span className="value-name">{value.value}</span>
                                                                    {value.description && (
                                                                        <span className="value-description">{value.description}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {isEditMode && (
                                                                <div className="value-actions">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary action-btn"
                                                                        onClick={() => handleEditValue(value)}
                                                                        title="Edit Value"
                                                                    >
                                                                        <FontAwesomeIcon icon={faEdit} />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger action-btn"
                                                                        onClick={() => handleDeleteValue(value.id)}
                                                                        title="Delete Value"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-values">
                                                        <FontAwesomeIcon icon={faDotCircle} className="empty-icon" />
                                                        <span>No values added yet</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="hierarchy-management">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading hierarchy structure...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="hierarchy-management">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Error Loading Hierarchy</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchHierarchyLevels}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="hierarchy-management">
            {renderHierarchyLevels()}

            {/* Create Level Modal */}
            {showCreationForm && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Add New Hierarchy Level</h3>
                            <button 
                                className="hm-modal-close-btn"
                                onClick={() => setShowCreationForm(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateLevel} className="create-level-form">
                            <div className="form-group">
                                <label>Level Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter level name (e.g., Department, Class, Year)"
                                    value={newLevel.name}
                                    onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    placeholder="Enter description (optional)"
                                    value={newLevel.description}
                                    onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Level Order</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder={`Enter order (default: ${hierarchyLevels.length > 0 ? Math.max(...hierarchyLevels.map(l => l.order)) + 1 : 1})`}
                                    value={newLevel.order}
                                    onChange={(e) => setNewLevel({ ...newLevel, order: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                                    Create Level
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreationForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Level Modal */}
            {showEditLevelModal && editingLevel && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Hierarchy Level</h3>
                            <button 
                                className="hm-modal-close-btn"
                                onClick={() => setShowEditLevelModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveLevel(); }} className="create-level-form">
                            <div className="form-group">
                                <label>Level Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter level name"
                                    value={editLevelData.name}
                                    onChange={(e) => setEditLevelData({ ...editLevelData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    placeholder="Enter description (optional)"
                                    value={editLevelData.description}
                                    onChange={(e) => setEditLevelData({ ...editLevelData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Level Order</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Enter order"
                                    value={editLevelData.order}
                                    onChange={(e) => setEditLevelData({ ...editLevelData, order: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditLevelModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Value Modal */}
            {showEditValueModal && editingValue && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>Edit Hierarchy Value</h3>
                            <button 
                                className="hm-modal-close-btn"
                                onClick={() => setShowEditValueModal(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveValue(); }} className="add-value-form">
                            <div className="form-group">
                                <label>Value Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter value name"
                                    value={editValueData.value}
                                    onChange={(e) => setEditValueData({ ...editValueData, value: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    placeholder="Enter description (optional)"
                                    value={editValueData.description}
                                    onChange={(e) => setEditValueData({ ...editValueData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    <FontAwesomeIcon icon={faSave} className="me-2" />
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditValueModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HierarchyManagement; 
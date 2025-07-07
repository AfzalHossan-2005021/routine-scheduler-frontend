import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { getAllConfigurations, setConfiguration, initializeConfigurations } from '../api/config';
import { toast } from 'react-hot-toast';
import { mdiCalendarCheck, mdiClockOutline, mdiCalendarWeek, mdiSchool, mdiRefresh, mdiContentSave } from '@mdi/js';
import Icon from '@mdi/react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const ConfigManagement = () => {
  // Define state for the specific config values we're interested in
  const [currentSession, setCurrentSession] = useState('');
  const [times, setTimes] = useState([8, 9, 10, 11, 12, 1, 2, 3, 4]);
  const [days, setDays] = useState(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"]);
  const [possibleLabTimes, setPossibleLabTimes] = useState([8, 11, 2]);
  const [loading, setLoading] = useState(true);

  // Options for selects
  const [sessionOptions, setSessionOptions] = useState([]);
  const timeOptions = Array.from({ length: 12 }, (_, i) => ({ 
    value: i + 1, 
    label: `${i + 1}:00` 
  }));
  
  const dayOptions = [
    { value: 'Saturday', label: 'Saturday' },
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' }
  ];
  
  // Load focused configurations
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const data = await getAllConfigurations();
      
      // Create a config object from the array of key-value pairs
      const configMap = {};
      data.forEach(item => {
        configMap[item.key] = item.value;
      });

      // Update state with the values we're interested in
      if (configMap.CURRENT_SESSION) {
        setCurrentSession(configMap.CURRENT_SESSION);
        // Add current session to options if not already present
        setSessionOptions(prev => {
          const option = { value: configMap.CURRENT_SESSION, label: configMap.CURRENT_SESSION };
          return prev.some(opt => opt.value === option.value) ? prev : [...prev, option];
        });
      }
      
      if (configMap.times) setTimes(configMap.times);
      if (configMap.days) setDays(configMap.days);
      if (configMap.possibleLabTimes) setPossibleLabTimes(configMap.possibleLabTimes);
      
    } catch (err) {
      console.error('Error loading configurations:', err);
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  // Initialize default configurations
  const handleInitializeConfigs = async () => {
    try {
      setLoading(true);
      await initializeConfigurations();
      toast.success('Configurations initialized successfully');
      await loadConfigurations(); // Reload configs after initialization
    } catch (err) {
      console.error('Error initializing configurations:', err);
      toast.error('Failed to initialize configurations');
    } finally {
      setLoading(false);
    }
  };

  // Save configurations
  const handleSaveConfigs = async () => {
    try {
      setLoading(true);
      
      // Save each configuration
      await setConfiguration('CURRENT_SESSION', currentSession);
      await setConfiguration('times', times);
      await setConfiguration('days', days);
      await setConfiguration('possibleLabTimes', possibleLabTimes);
      
      toast.success('Configurations saved successfully');
    } catch (err) {
      console.error('Error saving configurations:', err);
      toast.error('Failed to save configurations');
    } finally {
      setLoading(false);
    }
  };

  // Generate session options for the last 5 years and next 5 years
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const sessionOpts = [];
    
    // Generate January and July sessions for past 5 and future 5 years
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      sessionOpts.push({ value: `January ${year}`, label: `January ${year}` });
      sessionOpts.push({ value: `July ${year}`, label: `July ${year}` });
    }
    
    setSessionOptions(sessionOpts);
  }, []);

  // Load configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      padding: '0.2rem 0.5rem',
      borderColor: '#E2E8F0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#CBD5E1'
      }
    }),
    multiValue: (provided, state) => ({
      ...provided,
      backgroundColor: state.data.isTime ? '#3B82F6' : 
                      state.data.isDay ? '#10B981' : 
                      state.data.isLabTime ? '#F59E0B' : '#E2E8F0',
      color: state.data.isTime || state.data.isDay ? 'white' : 'black',
      borderRadius: '0.4rem',
      padding: '0.1rem 0.2rem',
    }),
    multiValueLabel: (provided, state) => ({
      ...provided,
      color: state.data.isTime || state.data.isDay ? 'white' : 
            state.data.isLabTime ? 'black' : 'black',
      fontSize: '0.95rem',
      fontWeight: '500',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      backgroundColor: '#DC2626',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      margin: '-8px -8px -8px 5px',
      '&:hover': {
        backgroundColor: '#B91C1C',
      }
    })
  };

  // Handle select changes
  const handleSessionChange = (selectedOption) => {
    if (selectedOption) {
      setCurrentSession(selectedOption.value);
      // Add to options if custom
      setSessionOptions(prev => {
        return prev.some(opt => opt.value === selectedOption.value) ? 
          prev : [...prev, selectedOption];
      });
    } else {
      setCurrentSession('');
    }
  };

  const handleTimesChange = (selectedOptions) => {
    setTimes(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleDaysChange = (selectedOptions) => {
    setDays(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleLabTimesChange = (selectedOptions) => {
    setPossibleLabTimes(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  // Format the selected values for the multi-selects
  const getSelectedTimeOptions = () => 
    times.map(time => ({ value: time, label: `${time}:00`, isTime: true }));

  const getSelectedDayOptions = () => 
    days.map(day => ({ value: day, label: day, isDay: true }));

  const getSelectedLabTimeOptions = () => 
    possibleLabTimes.map(time => ({ value: time, label: `${time}:00`, isLabTime: true }));

  return (
    <Card style={{ 
      borderRadius: "1rem", 
      boxShadow: "0 0.5rem 1.5rem rgba(0,0,0,0.08)",
      border: "none"
    }}>
      <Card.Header className="d-flex justify-content-between align-items-center" style={{ 
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        borderTopLeftRadius: "1rem",
        borderTopRightRadius: "1rem",
        color: "white",
        padding: "1rem 1.5rem"
      }}>
        <h4 className="mb-0">Schedule Configuration</h4>
        <Button 
          variant="light" 
          onClick={handleInitializeConfigs}
          disabled={loading}
          size="sm"
          style={{ 
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Icon path={mdiRefresh} size={0.8} /> Reset to Defaults
        </Button>
      </Card.Header>
      <Card.Body style={{ padding: "1.5rem" }}>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading configurations...</p>
          </div>
        ) : (
          <Form>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                      <Icon path={mdiCalendarCheck} size={1} color="#6366F1" /> 
                      Current Session
                    </div>
                  </Form.Label>
                  <CreatableSelect
                    value={currentSession ? { value: currentSession, label: currentSession } : null}
                    onChange={handleSessionChange}
                    options={sessionOptions}
                    placeholder="Select or create a session (e.g., January 2025)"
                    isClearable
                    styles={customStyles}
                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  />
                  <Form.Text className="text-muted mt-2">
                    Select or type to create a new academic session
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                      <Icon path={mdiClockOutline} size={1} color="#3B82F6" /> 
                      Class Times
                    </div>
                  </Form.Label>
                  <Select
                    isMulti
                    value={getSelectedTimeOptions()}
                    onChange={handleTimesChange}
                    options={timeOptions}
                    placeholder="Select class times"
                    styles={customStyles}
                    closeMenuOnSelect={false}
                  />
                  <Form.Text className="text-muted mt-2">
                    Select one or more class times (hours)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                      <Icon path={mdiCalendarWeek} size={1} color="#10B981" /> 
                      Working Days
                    </div>
                  </Form.Label>
                  <CreatableSelect
                    isMulti
                    value={getSelectedDayOptions()}
                    onChange={handleDaysChange}
                    options={dayOptions}
                    placeholder="Select working days"
                    styles={customStyles}
                    closeMenuOnSelect={false}
                    formatCreateLabel={(inputValue) => `Add "${inputValue}" as a day`}
                  />
                  <Form.Text className="text-muted mt-2">
                    Select days or type to add custom days
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">
                    <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                      <Icon path={mdiSchool} size={1} color="#F59E0B" /> 
                      Lab Times
                    </div>
                  </Form.Label>
                  <Select
                    isMulti
                    value={getSelectedLabTimeOptions()}
                    onChange={handleLabTimesChange}
                    options={timeOptions}
                    placeholder="Select lab times"
                    styles={customStyles}
                    closeMenuOnSelect={false}
                  />
                  <Form.Text className="text-muted mt-2">
                    Select one or more lab starting times
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Button 
                  onClick={handleSaveConfigs}
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    width: "100%",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  <Icon path={mdiContentSave} size={1} /> 
                  Save Configuration
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default ConfigManagement;

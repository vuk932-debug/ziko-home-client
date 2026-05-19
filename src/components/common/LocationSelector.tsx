import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import SearchableDropdown from './SearchableDropdown';

interface LocationSelectorProps {
  values: {
    country: string;
    state: string;
    city: string;
  };
  onChange: (field: string, value: string) => void;
  onBulkChange?: (updates: Record<string, string>) => void;
  className?: string;
  showLabels?: boolean;
  inputClassName?: string;
  optionsClassName?: string;
  placeholders?: {
    country?: string;
    state?: string;
    city?: string;
  };
  labels?: {
    country?: React.ReactNode;
    state?: React.ReactNode;
    city?: React.ReactNode;
  };
}

interface LocationOption {
  id: string;
  name: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  values, 
  onChange,
  onBulkChange,
  className = "grid grid-cols-1 md:grid-cols-3 gap-4",
  showLabels = true,
  inputClassName,
  optionsClassName,
  placeholders = {
    country: "Select Country",
    state: "Select State",
    city: "Select City"
  },
  labels
}) => {
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);

  const [countryId, setCountryId] = useState<string>('');
  const [stateId, setStateId] = useState<string>('');

  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
  });

  // 1. Fetch Countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading((prev) => ({ ...prev, countries: true }));
      try {
        const { data } = await apiClient.get('/locations/countries');
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading((prev) => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // 2. Sync Country ID when values.country changes (reactive to URL/External changes)
  useEffect(() => {
    if (countries.length > 0 && values.country) {
      const matched = countries.find(c => c.name === values.country);
      if (matched) setCountryId(matched.id);
      else setCountryId('');
    } else if (!values.country) {
      setCountryId('');
    }
  }, [values.country, countries]);

  // 3. Fetch States when countryId changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!countryId) {
        setStates([]);
        return;
      }
      setLoading((prev) => ({ ...prev, states: true }));
      try {
        const { data } = await apiClient.get(`/locations/states?countryId=${countryId}`);
        setStates(data);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };
    fetchStates();
  }, [countryId]);

  // 4. Sync State ID when values.state changes
  useEffect(() => {
    if (states.length > 0 && values.state) {
      const matched = states.find(s => s.name === values.state);
      if (matched) setStateId(matched.id);
      else setStateId('');
    } else if (!values.state) {
      setStateId('');
    }
  }, [values.state, states]);

  // 5. Fetch Cities when stateId changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!stateId) {
        setCities([]);
        return;
      }
      setLoading((prev) => ({ ...prev, cities: true }));
      try {
        const { data } = await apiClient.get(`/locations/cities?stateId=${stateId}`);
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading((prev) => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [stateId]);

  const handleCountryChange = (name: string, id: string) => {
    setCountryId(id);
    setStateId(''); 
    setCities([]); 
    
    if (onBulkChange) {
      onBulkChange({
        country: name,
        state: '',
        city: ''
      });
    } else {
      onChange('country', name);
      onChange('state', ''); 
      onChange('city', '');
    }
  };

  const handleStateChange = (name: string, id: string) => {
    setStateId(id);
    setCities([]); 
    
    if (onBulkChange) {
      onBulkChange({
        state: name,
        city: ''
      });
    } else {
      onChange('state', name);
      onChange('city', ''); 
    }
  };

  const handleCityChange = (name: string) => {
    onChange('city', name);
  };

  return (
    <div className={className}>
      <SearchableDropdown
        key={`country-${countries.length}`}
        label={showLabels ? (labels?.country || "Country") : undefined}
        placeholder={placeholders.country}
        options={countries}
        selected={values.country}
        onChange={handleCountryChange}
        loading={loading.countries}
        inputClassName={inputClassName}
        optionsClassName={optionsClassName}
      />
      <SearchableDropdown
        key={`state-${countryId}-${states.length}`}
        label={showLabels ? (labels?.state || "State") : undefined}
        placeholder={placeholders.state}
        options={states}
        selected={values.state}
        onChange={handleStateChange}
        disabled={!countryId}
        loading={loading.states}
        inputClassName={inputClassName}
        optionsClassName={optionsClassName}
      />
      <SearchableDropdown
        key={`city-${stateId}-${cities.length}`}
        label={showLabels ? (labels?.city || "City") : undefined}
        placeholder={placeholders.city}
        options={cities}
        selected={values.city}
        onChange={handleCityChange}
        disabled={!stateId}
        loading={loading.cities}
        inputClassName={inputClassName}
        optionsClassName={optionsClassName}
      />
    </div>
  );
};

export default LocationSelector;

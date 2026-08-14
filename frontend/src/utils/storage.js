import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Passwords - Change USER_PASSWORD here to set a custom user password
export const USER_PASSWORD = '1234';
export const BABA_PASSWORD = 'baba1234';
export const EDITOR_PASSWORD = 'Hxdi.132';

// ============ REASONS API ============

export const getReasons = async () => {
  try {
    const response = await axios.get(`${API_URL}/reasons`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reasons:', error);
    return [];
  }
};

export const addReason = async (text) => {
  try {
    const response = await axios.post(`${API_URL}/reasons`, { text });
    return response.data;
  } catch (error) {
    console.error('Error adding reason:', error);
    throw error;
  }
};

export const updateReason = async (id, text) => {
  try {
    const response = await axios.put(`${API_URL}/reasons/${id}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error updating reason:', error);
    throw error;
  }
};

export const deleteReason = async (id) => {
  try {
    await axios.delete(`${API_URL}/reasons/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting reason:', error);
    throw error;
  }
};

// ============ TIMELINE API ============

export const getTimeline = async () => {
  try {
    const response = await axios.get(`${API_URL}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return [];
  }
};

export const addTimelineItem = async (caption, image = null) => {
  try {
    const response = await axios.post(`${API_URL}/timeline`, { caption, image });
    return response.data;
  } catch (error) {
    console.error('Error adding timeline item:', error);
    throw error;
  }
};

export const updateTimelineItem = async (id, updates) => {
  try {
    const response = await axios.put(`${API_URL}/timeline/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating timeline item:', error);
    throw error;
  }
};

export const deleteTimelineItem = async (id) => {
  try {
    await axios.delete(`${API_URL}/timeline/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    throw error;
  }
};

// ============ INITIALIZATION ============

export const initializeStorage = () => {
  console.log('Cloud sync enabled - data syncs across all devices');
};

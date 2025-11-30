import { Room, AutocompleteRequest, AutocompleteResponse } from '../types';

// Get API base URL from environment or use relative path for same-origin requests
const getApiBase = (): string => {
  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  return '';
};

const API_BASE = getApiBase();

export const createRoom = async (
  language: string = 'python'
): Promise<Room> => {
  console.log('Making API request to create room:', { language });
  const url = `${API_BASE}/api/rooms`;
  console.log('Request URL:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language }),
  });

  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to create room: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log('API Response:', result);
  return result;
};

export const getAutocomplete = async (
  request: AutocompleteRequest
): Promise<AutocompleteResponse> => {
  const url = `${API_BASE}/api/autocomplete`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to get autocomplete');
  return response.json();
};

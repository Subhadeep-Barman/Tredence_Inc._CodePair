import { Room, AutocompleteRequest, AutocompleteResponse } from '../types';

const API_BASE = '/api';

export const createRoom = async (
  language: string = 'python'
): Promise<Room> => {
  console.log('Making API request to create room:', { language });
  const url = `${API_BASE}/rooms`;
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
  const response = await fetch(`${API_BASE}/autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to get autocomplete');
  return response.json();
};

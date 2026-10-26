import { apiGet, apiPost, apiPatch } from './client';

export const getAssignments = () => apiGet('/assignments');
export const createAssignment = data => apiPost('/assignments', data);
export const updateAssignment = (id, data) =>
  apiPatch(`/assignments/${id}`, data);
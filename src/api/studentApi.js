import { apiGet, apiPatch } from './client';

export const getStudents = () => apiGet('/students');
export const updateStudent = (id, data) =>
  apiPatch(`/students/${id}`, data);
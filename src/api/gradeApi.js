
import { apiGet, apiPatch } from './client';

export const getGrades = () => apiGet('/grades');

export const updateGrade = (id, data) =>
  apiPatch(`/grades/${id}`, data);

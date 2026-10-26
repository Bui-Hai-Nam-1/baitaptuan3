
import { apiGet, apiPost, apiPatch } from './client';

export const getCourses = () => apiGet('/courses');

export const getCourseById = id => apiGet(`/courses/${id}`);

export const createCourse = data => apiPost('/courses', data);

export const updateCourse = (id, data) =>
  apiPatch(`/courses/${id}`, data);

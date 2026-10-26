import { apiGet } from './client';

export const getSessions = () => apiGet('/sessions');

import { Platform } from 'react-native';

export const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const API_TIMEOUT = 10000;
export const CACHE_TTL = 5 * 60 * 1000;

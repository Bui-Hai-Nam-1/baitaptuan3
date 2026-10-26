
import { useCallback, useEffect, useState } from 'react';
import { getDataWithCache } from '../storage/cacheService';

export default function useCachedApi(cacheKey, fetchData) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDataWithCache(cacheKey, fetchData);
      setData(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, source, refresh: loadData };
}

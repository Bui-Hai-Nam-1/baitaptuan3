
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export async function saveCache(key, data) {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export async function readCache(key) {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export async function getDataWithCache(key, fetchData) {
  const network = await NetInfo.fetch();

  // Nếu mất mạng, ưu tiên dữ liệu đã lưu.
  if (network.isConnected === false) {
    const cachedData = await readCache(key);

    if (cachedData !== null) {
      return { data: cachedData, source: 'cache' };
    }

    throw new Error('Không có mạng và chưa có dữ liệu lưu offline.');
  }

  try {
    // Có mạng: lấy dữ liệu mới từ API.
    const freshData = await fetchData();
    await saveCache(key, freshData);

    return { data: freshData, source: 'api' };
  } catch (error) {
    // API lỗi: dùng cache nếu có.
    const cachedData = await readCache(key);

    if (cachedData !== null) {
      return { data: cachedData, source: 'cache' };
    }

    throw error;
  }
}

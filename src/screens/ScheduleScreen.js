
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getCourses } from '../api/courseApi';
import { getSessions } from '../api/sessionApi';
import useCachedApi from '../hooks/useCachedApi';

const WEEK_TABS = [
  'Tất cả',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
];

const DAY_NAMES = {
  Monday: 'Thứ Hai',
  Tuesday: 'Thứ Ba',
  Wednesday: 'Thứ Tư',
  Thursday: 'Thứ Năm',
  Friday: 'Thứ Sáu',
  Saturday: 'Thứ Bảy',
  Sunday: 'Chủ Nhật',
};

const getVietnameseDay = day => DAY_NAMES[day] || day;

const fetchSchedule = async () => {
  const [sessions, courses] = await Promise.all([
    getSessions(),
    getCourses(),
  ]);

  return sessions.map(session => {
    const course = courses.find(
      item => String(item.id) === String(session.courseId),
    );

    return {
      ...session,
      tenMH: course?.name || 'Chưa có tên môn học',
      thu: getVietnameseDay(session.day),
      thoiGian: `${session.startTime} - ${session.endTime}`,
      phongHoc: session.room || 'Chưa có phòng',
      giangVien: course?.teacher || 'Chưa có thông tin',
    };
  });
};

const ScheduleScreen = ({ navigation }) => {
  const getInitialDay = () => {
    const todayIndex = new Date().getDay();

    const dayDictionary = {
      1: 'Thứ Hai',
      2: 'Thứ Ba',
      3: 'Thứ Tư',
      4: 'Thứ Năm',
      5: 'Thứ Sáu',
    };

    return dayDictionary[todayIndex] || 'Tất cả';
  };

  const [activeTab, setActiveTab] = useState(getInitialDay);

  const {
    data: schedule,
    loading,
    error,
    source,
    refresh,
  } = useCachedApi('schedule_combined', fetchSchedule);

  const displayedSchedules = useMemo(() => {
    if (activeTab === 'Tất cả') {
      return schedule;
    }

    return schedule.filter(record => record.thu === activeTab);
  }, [activeTab, schedule]);

  const renderSingleCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cardItemBox}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ScheduleDetail', {
          scheduleItem: item,
        })
      }
    >
      <View style={styles.cardTopBar}>
        <View style={styles.miniBadge}>
          <Text style={styles.miniBadgeText}>{item.thu}</Text>
        </View>

        <View style={styles.timeInfoBox}>
          <Ionicons name="time" size={14} color="#10B981" />
          <Text style={styles.timeInfoText}>{item.thoiGian}</Text>
        </View>
      </View>

      <Text style={styles.courseHeaderTitle}>{item.tenMH}</Text>

      <View style={styles.subDetailContainer}>
        <View style={styles.subRow}>
          <View style={styles.iconDot}>
            <Ionicons name="location" size={13} color="#10B981" />
          </View>
          <Text style={styles.subTextLabel}>
            Phòng:{' '}
            <Text style={styles.subTextBold}>{item.phongHoc}</Text>
          </Text>
        </View>

        <View style={styles.subRow}>
          <View style={styles.iconDot}>
            <Ionicons name="person" size={13} color="#10B981" />
          </View>
          <Text style={styles.subTextLabel}>
            GV:{' '}
            <Text style={styles.subTextBold}>{item.giangVien}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <Text style={styles.gotoDetailText}>Xem chi tiết</Text>
        <Ionicons name="arrow-forward" size={14} color="#10B981" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeAreaStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      <View style={styles.mainWrapper}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerMainTitle}>
            Lịch Trình Học Tập
          </Text>
          <Text style={styles.headerSubTitle}>
            Quản lý thời khóa biểu
          </Text>
        </View>

        <View style={styles.filterBarContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={WEEK_TABS}
            keyExtractor={item => item}
            contentContainerStyle={styles.tabScrollContent}
            renderItem={({ item }) => {
              const isChosen = activeTab === item;

              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    isChosen && styles.filterChipSelected,
                  ]}
                  onPress={() => setActiveTab(item)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isChosen && styles.filterChipTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.statusText}>Đang tải lịch học...</Text>
          </View>
        ) : error && schedule.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color="#94A3B8"
            />
            <Text style={styles.emptyDataTitle}>
              Không tải được lịch học
            </Text>
            <Text style={styles.emptyDataSub}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refresh}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {source === 'cache' && (
              <View style={styles.cacheNotice}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={15}
                  color="#92400E"
                />
                <Text style={styles.cacheNoticeText}>
                  Đang hiển thị lịch đã lưu offline
                </Text>
              </View>
            )}

            {error && schedule.length > 0 && (
              <View style={styles.cacheNotice}>
                <Text style={styles.cacheNoticeText}>
                  Không thể làm mới dữ liệu. Đang giữ lịch hiện có.
                </Text>
              </View>
            )}

            <FlatList
              data={displayedSchedules}
              keyExtractor={item => String(item.id)}
              renderItem={renderSingleCard}
              contentContainerStyle={styles.listContentPad}
              showsVerticalScrollIndicator={false}
              onRefresh={refresh}
              refreshing={loading}
              ListEmptyComponent={
                <View style={styles.emptyDataBox}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={54}
                    color="#CBD5E1"
                  />
                  <Text style={styles.emptyDataTitle}>
                    Không có lịch học
                  </Text>
                  <Text style={styles.emptyDataSub}>
                    {activeTab === 'Tất cả'
                      ? 'Hiện chưa có mục lịch học nào được ghi nhận.'
                      : `Không tìm thấy tiết học vào ${activeTab}.`}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaStyle: { flex: 1, backgroundColor: '#10B981' },
  mainWrapper: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBlock: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerMainTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubTitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  filterChipSelected: { backgroundColor: '#10B981' },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextSelected: { color: '#FFFFFF' },
  listContentPad: { padding: 16, paddingBottom: 24 },
  cardItemBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  timeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeInfoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  courseHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  subDetailContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  iconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  subTextLabel: { fontSize: 12, color: '#64748B' },
  subTextBold: { fontWeight: '600', color: '#1E293B' },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  gotoDetailText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  emptyDataBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyDataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyDataSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
  cacheNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
  },
  cacheNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ScheduleScreen;

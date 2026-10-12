import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { studentInfo, subjects, schedule, assignments, grades } from '../data/mockData';

const WEEK_TABS = ['Tất cả', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu'];

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

  const displayedSchedules = useMemo(() => {
    if (activeTab === 'Tất cả') {
      return schedule;
    }
    return schedule.filter((record) => record.thu === activeTab);
  }, [activeTab]);

  const renderSingleCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cardItemBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ScheduleDetail', { scheduleItem: item })}
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
            <Text style={styles.subTextLabel}>Phòng: <Text style={styles.subTextBold}>{item.phongHoc}</Text></Text>
          </View>

          <View style={styles.subRow}>
            <View style={styles.iconDot}>
              <Ionicons name="person" size={13} color="#10B981" />
            </View>
            <Text style={styles.subTextLabel}>GV: <Text style={styles.subTextBold}>{item.giangVien}</Text></Text>
          </View>
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.gotoDetailText}>Xem chi tiết</Text>
          <Ionicons name="arrow-forward" size={14} color="#10B981" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <View style={styles.mainWrapper}>
        {/* Header Section */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerMainTitle}>Lịch Trình Học Tập</Text>
          <Text style={styles.headerSubTitle}>Quản lý thời gian biểu các học phần</Text>
        </View>

        {/* Tab Buttons */}
        <View style={styles.filterBarContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={WEEK_TABS}
            keyExtractor={(tabName) => tabName}
            contentContainerStyle={styles.tabScrollContent}
            renderItem={({ item }) => {
              const isChosen = activeTab === item;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, isChosen && styles.filterChipSelected]}
                  onPress={() => setActiveTab(item)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.filterChipText, isChosen && styles.filterChipTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Main List */}
        <FlatList
          data={displayedSchedules}
          keyExtractor={(item) => item.id}
          renderItem={renderSingleCard}
          contentContainerStyle={styles.listContentPad}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyDataBox}>
              <Ionicons name="calendar-clear-outline" size={54} color="#CBD5E1" />
              <Text style={styles.emptyDataTitle}>Không có lịch học</Text>
              <Text style={styles.emptyDataSub}>
                {activeTab === 'Tất cả'
                  ? 'Hiện không có mục lịch học nào được ghi nhận.'
                  : `Không tìm thấy tiết học nào vào ${activeTab}.`}
              </Text>
            </View>
          }
        />
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
  headerMainTitle: { fontSize: 21, fontWeight: '800', color: '#FFFFFF' },
  headerSubTitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2, fontWeight: '500' },
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabScrollContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  filterChipSelected: { backgroundColor: '#10B981' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
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
  cardTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  miniBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  miniBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  timeInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeInfoText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  courseHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 10 },
  subDetailContainer: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, gap: 6 },
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
  gotoDetailText: { fontSize: 12, color: '#10B981', fontWeight: '700' },
  emptyDataBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyDataTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginTop: 12 },
  emptyDataSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 },
});

export default ScheduleScreen;
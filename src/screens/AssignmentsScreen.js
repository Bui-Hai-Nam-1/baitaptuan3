import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { studentInfo, subjects, schedule, assignments, grades } from '../data/mockData';

const STORAGE_KEY = 'assignments_status';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const segs = dateStr.split('-');
  if (segs.length === 3) {
    return `${segs[2]}/${segs[1]}/${segs[0]}`;
  }
  return dateStr;
};

const getDaysLeftInfo = (deadlineStr) => {
  if (!deadlineStr) return { text: '', isOverdue: false };
  const segs = deadlineStr.split('-').map(Number);
  if (segs.length !== 3) return { text: '', isOverdue: false };

  const targetDate = new Date(segs[0], segs[1] - 1, segs[2]);
  const currDate = new Date();
  currDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const timeDiff = targetDate.getTime() - currDate.getTime();
  const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

  if (dayDiff < 0) {
    return { text: `Quá hạn ${Math.abs(dayDiff)} ngày`, isOverdue: true };
  } else if (dayDiff === 0) {
    return { text: 'Hết hạn hôm nay', isOverdue: false };
  } else {
    return { text: `Còn ${dayDiff} ngày`, isOverdue: false };
  }
};

const TAB_ALL = 'Tất cả';
const TAB_PENDING = 'Chưa nộp';
const TAB_COMPLETED = 'Đã nộp';

const AssignmentsScreen = ({ navigation }) => {
  const [taskList, setTaskList] = useState(assignments);
  const [activeTab, setActiveTab] = useState(TAB_ALL);

  const fetchTasksFromStorage = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setTaskList(JSON.parse(savedData));
      } else {
        setTaskList(assignments);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu bài tập:', err);
      setTaskList(assignments);
    }
  }, []);

  useEffect(() => {
    fetchTasksFromStorage();
  }, [fetchTasksFromStorage]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      fetchTasksFromStorage();
    });
    return unsub;
  }, [navigation, fetchTasksFromStorage]);

  const toggleTaskStatus = async (taskId) => {
    const newUpdatedList = taskList.map((item) => {
      if (item.id === taskId) {
        const isDoneState = !!(item.hoangThanh ?? item.hoanThanh);
        return {
          ...item,
          hoangThanh: !isDoneState,
          hoanThanh: !isDoneState,
        };
      }
      return item;
    });

    setTaskList(newUpdatedList);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUpdatedList));
    } catch (err) {
      console.error('Lỗi lưu trạng thái bài tập:', err);
    }
  };

  const processedTasks = useMemo(() => {
    return taskList.filter((item) => {
      const isDone = !!(item.hoangThanh ?? item.hoanThanh);
      if (activeTab === TAB_COMPLETED) return isDone;
      if (activeTab === TAB_PENDING) return !isDone;
      return true;
    });
  }, [taskList, activeTab]);

  const renderSingleTask = ({ item }) => {
    const isDone = !!(item.hoangThanh ?? item.hoanThanh);
    const dayInfo = getDaysLeftInfo(item.hanNop);

    return (
      <TouchableOpacity
        style={[styles.taskCardItem, isDone && styles.cardFinished]}
        activeOpacity={0.82}
        onPress={() =>
          navigation.navigate('AssignmentDetail', {
            assignment: item,
            onToggleStatus: () => toggleTaskStatus(item.id),
          })
        }
      >
        <View style={styles.cardHeaderTop}>
          <View style={styles.courseBadge}>
            <Ionicons name="book-outline" size={12} color="#10B981" />
            <Text style={styles.courseBadgeText}>{item.tenMH}</Text>
          </View>
          <View
            style={[
              styles.statusPillSmall,
              isDone ? styles.pillFin : dayInfo.isOverdue ? styles.pillOver : styles.pillWait,
            ]}
          >
            <Text
              style={[
                styles.pillTextSmall,
                isDone ? styles.txtFin : dayInfo.isOverdue ? styles.txtOver : styles.txtWait,
              ]}
            >
              {isDone ? 'Đã hoàn thành' : dayInfo.isOverdue ? 'Quá hạn' : 'Chưa hoàn thành'}
            </Text>
          </View>
        </View>

        <Text style={[styles.taskCardTitle, isDone && styles.titleFinished]}>
          {item.tieuDe}
        </Text>

        <View style={styles.cardFooterBottom}>
          <View style={styles.dateInfoRow}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.dateInfoText}>Hạn: {formatDisplayDate(item.hanNop)}</Text>
            {!isDone && (
              <View
                style={[
                  styles.countdownBadge,
                  dayInfo.isOverdue ? styles.countOverdue : styles.countNormal,
                ]}
              >
                <Text
                  style={[
                    styles.countdownText,
                    dayInfo.isOverdue ? styles.countTextOverdue : styles.countTextNormal,
                  ]}
                >
                  {dayInfo.text}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.circleCheckTouch}
            onPress={() => toggleTaskStatus(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={isDone ? '#10B981' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainerBox}>
      <Ionicons name="checkbox-outline" size={56} color="#CBD5E1" />
      <Text style={styles.emptyHeadingText}>Không có dữ liệu bài tập</Text>
      <Text style={styles.emptySubHeadingText}>
        {activeTab === TAB_COMPLETED
          ? 'Bạn chưa hoàn thành nhiệm vụ nào trong mục này.'
          : activeTab === TAB_PENDING
          ? 'Tuyệt vời! Tất cả các bài tập đã được giải quyết.'
          : 'Hiện tại chưa có bài tập nào được phân công.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainerStyle}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <View style={styles.mainLayout}>
        {/* Header Block */}
        <View style={styles.headerBlockCard}>
          <Text style={styles.headerBigTitle}>Nhiệm Vụ & Bài Tập</Text>
          <Text style={styles.headerSmallSub}>Theo dõi tiến độ học tập và hạn nộp</Text>
        </View>

        {/* Tab Filters */}
        <View style={styles.tabSwitchContainer}>
          {[TAB_ALL, TAB_PENDING, TAB_COMPLETED].map((tabName) => {
            const isTabActive = activeTab === tabName;
            return (
              <TouchableOpacity
                key={tabName}
                style={[styles.singleTabBtn, isTabActive && styles.singleTabBtnActive]}
                onPress={() => setActiveTab(tabName)}
                activeOpacity={0.8}
              >
                <Text style={[styles.singleTabText, isTabActive && styles.singleTabTextActive]}>
                  {tabName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List Task View */}
        <FlatList
          data={processedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderSingleTask}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listScrollContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainerStyle: { flex: 1, backgroundColor: '#10B981' },
  mainLayout: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBlockCard: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerBigTitle: { fontSize: 21, fontWeight: '800', color: '#FFFFFF' },
  headerSmallSub: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2, fontWeight: '500' },
  tabSwitchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
  },
  singleTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  singleTabBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  singleTabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  singleTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  listScrollContent: { paddingHorizontal: 16, paddingBottom: 28, paddingTop: 4 },
  taskCardItem: {
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
  cardFinished: { backgroundColor: '#FAFAFA', borderColor: '#E2E8F0' },
  cardHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '65%',
  },
  courseBadgeText: { fontSize: 11, color: '#10B981', fontWeight: '700', marginLeft: 4 },
  statusPillSmall: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pillFin: { backgroundColor: '#ECFDF5' },
  pillWait: { backgroundColor: '#FEF3C7' },
  pillOver: { backgroundColor: '#FEE2E2' },
  pillTextSmall: { fontSize: 11, fontWeight: '700' },
  txtFin: { color: '#10B981' },
  txtWait: { color: '#D97706' },
  txtOver: { color: '#EF4444' },
  taskCardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 10, lineHeight: 21 },
  titleFinished: { color: '#94A3B8', textDecorationLine: 'line-through' },
  cardFooterBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateInfoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
  dateInfoText: { fontSize: 12, color: '#64748B', marginLeft: 4, marginRight: 8, fontWeight: '500' },
  countdownBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  countNormal: { backgroundColor: '#FEF3C7' },
  countOverdue: { backgroundColor: '#FEE2E2' },
  countdownText: { fontSize: 11, fontWeight: '600' },
  countTextNormal: { color: '#D97706' },
  countTextOverdue: { color: '#EF4444' },
  circleCheckTouch: { padding: 2 },
  emptyContainerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyHeadingText: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptySubHeadingText: { marginTop: 4, fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
});

export default AssignmentsScreen;
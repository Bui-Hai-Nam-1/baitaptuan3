
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { getAssignments, updateAssignment } from '../api/assignmentApi';
import { getCourses } from '../api/courseApi';
import useCachedApi from '../hooks/useCachedApi';

const STORAGE_KEY = 'assignments_status';

const TAB_ALL = 'Tất cả';
const TAB_PENDING = 'Chưa nộp';
const TAB_COMPLETED = 'Đã nộp';

const TABS = [TAB_ALL, TAB_PENDING, TAB_COMPLETED];

const formatDisplayDate = dateStr => {
  if (!dateStr) return '';

  const segs = dateStr.split('-');

  if (segs.length === 3) {
    return `${segs[2]}/${segs[1]}/${segs[0]}`;
  }

  return dateStr;
};

const getDaysLeftInfo = deadlineStr => {
  if (!deadlineStr) {
    return { text: '', isOverdue: false };
  }

  const segs = deadlineStr.split('-').map(Number);

  if (segs.length !== 3 || segs.some(Number.isNaN)) {
    return { text: '', isOverdue: false };
  }

  const targetDate = new Date(segs[0], segs[1] - 1, segs[2]);
  const currDate = new Date();

  targetDate.setHours(0, 0, 0, 0);
  currDate.setHours(0, 0, 0, 0);

  const timeDiff = targetDate.getTime() - currDate.getTime();
  const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

  if (dayDiff < 0) {
    return {
      text: `Quá hạn ${Math.abs(dayDiff)} ngày`,
      isOverdue: true,
    };
  }

  if (dayDiff === 0) {
    return {
      text: 'Hết hạn hôm nay',
      isOverdue: false,
    };
  }

  return {
    text: `Còn ${dayDiff} ngày`,
    isOverdue: false,
  };
};

// Chuyển dữ liệu API sang cấu trúc mà giao diện đang sử dụng.
const fetchAssignmentsData = async () => {
  const [assignments, courses] = await Promise.all([
    getAssignments(),
    getCourses(),
  ]);

  return assignments.map(assignment => {
    const course = courses.find(
      item => String(item.id) === String(assignment.courseId),
    );

    return {
      ...assignment,
      id: String(assignment.id),
      tenMH: course?.name || 'Chưa có tên môn học',
      tieuDe: assignment.title || assignment.tieuDe || 'Bài tập chưa có tiêu đề',
      hanNop: assignment.dueDate || assignment.hanNop || '',
      hoanThanh: Boolean(
        assignment.completed ??
        assignment.hoanThanh ??
        assignment.hoangThanh ??
        false
      ),
    };
  });
};

// Hỗ trợ cả dữ liệu cũ lưu dưới dạng mảng và dạng object.
const parseSavedStatuses = raw => {
  if (!raw) return {};

  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed.reduce((result, item) => {
      const id = String(item.id);

      result[id] = Boolean(
        item.completed ??
        item.hoanThanh ??
        item.hoangThanh ??
        false
      );

      return result;
    }, {});
  }

  if (parsed && typeof parsed === 'object') {
    return parsed;
  }

  return {};
};

const AssignmentsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [statusOverrides, setStatusOverrides] = useState({});
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const {
    data,
    loading,
    error,
    source,
    refresh,
  } = useCachedApi('assignments_combined', fetchAssignmentsData);

  // Đọc các trạng thái hoàn thành đã lưu trên thiết bị.
  const loadSavedStatuses = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = parseSavedStatuses(raw);
      setStatusOverrides(saved);
    } catch (err) {
      console.warn('Không đọc được trạng thái bài tập đã lưu.', err);
    } finally {
      setStatusLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSavedStatuses();
  }, [loadSavedStatuses]);

  // Gộp trạng thái đã lưu với dữ liệu API/cache.
  const taskList = useMemo(() => {
    return data.map(item => {
      const id = String(item.id);

      const isDone = Object.prototype.hasOwnProperty.call(
        statusOverrides,
        id,
      )
        ? statusOverrides[id]
        : Boolean(
            item.completed ??
            item.hoanThanh ??
            item.hoangThanh ??
            false
          );

      return {
        ...item,
        id,
        hoanThanh: Boolean(isDone),
        completed: Boolean(isDone),
      };
    });
  }, [data, statusOverrides]);

  // Đồng bộ những trạng thái thay đổi khi offline lên server.
  const syncPendingStatuses = useCallback(async () => {
    let saved = {};

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      saved = parseSavedStatuses(raw);
    } catch (err) {
      console.warn('Không đọc được hàng đợi đồng bộ.', err);
      return;
    }

    const remaining = { ...saved };
    let changed = false;

    for (const id of Object.keys(saved)) {
      try {
        await updateAssignment(id, {
          completed: Boolean(saved[id]),
        });

        delete remaining[id];
        changed = true;
      } catch (err) {
        // Server chưa truy cập được: giữ thay đổi để thử lại sau.
      }
    }

    if (changed) {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(remaining),
        );
        setStatusOverrides(remaining);
      } catch (err) {
        console.warn('Không lưu được hàng đợi đồng bộ.', err);
      }
    }
  }, []);

  // Mỗi lần quay lại màn hình, thử đồng bộ và làm mới dữ liệu.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setSyncing(true);

      await syncPendingStatuses();
      await refresh();
      await loadSavedStatuses();

      setSyncing(false);
    });

    return unsubscribe;
  }, [
    navigation,
    syncPendingStatuses,
    refresh,
    loadSavedStatuses,
  ]);

  const toggleTaskStatus = useCallback(async taskId => {
    const id = String(taskId);

    const currentTask = taskList.find(
      item => String(item.id) === id,
    );

    if (!currentTask) return;

    const nextStatus = !currentTask.hoanThanh;

    // Cập nhật giao diện ngay để người dùng không phải chờ API.
    const nextOverrides = {
      ...statusOverrides,
      [id]: nextStatus,
    };

    setStatusOverrides(nextOverrides);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextOverrides),
      );
    } catch (err) {
      console.warn('Không lưu được trạng thái bài tập.', err);
    }

    try {
      // Nếu API hoạt động, lưu trạng thái lên server.
      await updateAssignment(id, {
        completed: nextStatus,
      });

      // Đã đồng bộ thành công: xóa trạng thái chờ của bài này.
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const latest = parseSavedStatuses(raw);

      delete latest[id];

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(latest),
      );

      setStatusOverrides(latest);
    } catch (err) {
      // Offline hoặc API lỗi: giữ trạng thái trong AsyncStorage.
      // Lần sau vào màn hình sẽ thử đồng bộ lại.
    }
  }, [taskList, statusOverrides]);

  const processedTasks = useMemo(() => {
    return taskList.filter(item => {
      if (activeTab === TAB_COMPLETED) {
        return item.hoanThanh;
      }

      if (activeTab === TAB_PENDING) {
        return !item.hoanThanh;
      }

      return true;
    });
  }, [taskList, activeTab]);

  const renderSingleTask = ({ item }) => {
    const isDone = item.hoanThanh;
    const dayInfo = getDaysLeftInfo(item.hanNop);

    return (
      <TouchableOpacity
        style={[
          styles.taskCardItem,
          isDone && styles.cardFinished,
        ]}
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
            <Ionicons
              name="book-outline"
              size={12}
              color="#10B981"
            />
            <Text
              style={styles.courseBadgeText}
              numberOfLines={1}
            >
              {item.tenMH}
            </Text>
          </View>

          <View
            style={[
              styles.statusPillSmall,
              isDone
                ? styles.pillFin
                : dayInfo.isOverdue
                  ? styles.pillOver
                  : styles.pillWait,
            ]}
          >
            <Text
              style={[
                styles.pillTextSmall,
                isDone
                  ? styles.txtFin
                  : dayInfo.isOverdue
                    ? styles.txtOver
                    : styles.txtWait,
              ]}
            >
              {isDone
                ? 'Đã hoàn thành'
                : dayInfo.isOverdue
                  ? 'Quá hạn'
                  : 'Chưa hoàn thành'}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.taskCardTitle,
            isDone && styles.titleFinished,
          ]}
        >
          {item.tieuDe}
        </Text>

        <View style={styles.cardFooterBottom}>
          <View style={styles.dateInfoRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color="#64748B"
            />

            <Text style={styles.dateInfoText}>
              Hạn: {formatDisplayDate(item.hanNop)}
            </Text>

            {!isDone && dayInfo.text !== '' && (
              <View
                style={[
                  styles.countdownBadge,
                  dayInfo.isOverdue
                    ? styles.countOverdue
                    : styles.countNormal,
                ]}
              >
                <Text
                  style={[
                    styles.countdownText,
                    dayInfo.isOverdue
                      ? styles.countTextOverdue
                      : styles.countTextNormal,
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
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Ionicons
              name={
                isDone
                  ? 'checkmark-circle'
                  : 'ellipse-outline'
              }
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
      <Ionicons
        name="checkbox-outline"
        size={56}
        color="#CBD5E1"
      />

      <Text style={styles.emptyHeadingText}>
        Không có bài tập
      </Text>

      <Text style={styles.emptySubHeadingText}>
        {activeTab === TAB_COMPLETED
          ? 'Bạn chưa hoàn thành bài tập nào trong mục này.'
          : activeTab === TAB_PENDING
            ? 'Bạn đã hoàn thành tất cả bài tập!'
            : 'Hiện chưa có dữ liệu bài tập.'}
      </Text>
    </View>
  );

  const isInitialLoading =
    loading || !statusLoaded || syncing;

  return (
    <SafeAreaView style={styles.safeContainerStyle}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#10B981"
      />

      <View style={styles.mainLayout}>
        <View style={styles.headerBlockCard}>
          <Text style={styles.headerBigTitle}>
            Bài Tập
          </Text>
          <Text style={styles.headerSmallSub}>
            Quản lý bài tập và hạn nộp
          </Text>
        </View>

        {!isInitialLoading && source === 'cache' && (
          <View style={styles.cacheNotice}>
            <Ionicons
              name="cloud-offline-outline"
              size={15}
              color="#92400E"
            />
            <Text style={styles.cacheNoticeText}>
              Đang hiển thị dữ liệu bài tập đã lưu offline
            </Text>
          </View>
        )}

        {!isInitialLoading && error && taskList.length > 0 && (
          <View style={styles.cacheNotice}>
            <Text style={styles.cacheNoticeText}>
              Không thể tải dữ liệu mới. Đang giữ dữ liệu đã lưu.
            </Text>
          </View>
        )}

        <View style={styles.tabSwitchContainer}>
          {TABS.map(tabName => {
            const isTabActive = activeTab === tabName;

            return (
              <TouchableOpacity
                key={tabName}
                style={[
                  styles.singleTabBtn,
                  isTabActive && styles.singleTabBtnActive,
                ]}
                onPress={() => setActiveTab(tabName)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.singleTabText,
                    isTabActive && styles.singleTabTextActive,
                  ]}
                >
                  {tabName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isInitialLoading && taskList.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator
              size="large"
              color="#10B981"
            />
            <Text style={styles.statusText}>
              Đang tải bài tập...
            </Text>
          </View>
        ) : error && taskList.length === 0 ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color="#94A3B8"
            />
            <Text style={styles.emptyHeadingText}>
              Không tải được bài tập
            </Text>
            <Text style={styles.emptySubHeadingText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={refresh}
            >
              <Text style={styles.retryButtonText}>
                Thử lại
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={processedTasks}
            keyExtractor={item => String(item.id)}
            renderItem={renderSingleTask}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listScrollContent}
            showsVerticalScrollIndicator={false}
            onRefresh={refresh}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainerStyle: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  mainLayout: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBlockCard: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerBigTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSmallSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
  },
  singleTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  singleTabBtnActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  singleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  singleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 4,
    flexGrow: 1,
  },
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
  cardFinished: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '65%',
  },
  courseBadgeText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 4,
    flexShrink: 1,
  },
  statusPillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillFin: { backgroundColor: '#ECFDF5' },
  pillWait: { backgroundColor: '#FEF3C7' },
  pillOver: { backgroundColor: '#FEE2E2' },
  pillTextSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  txtFin: { color: '#10B981' },
  txtWait: { color: '#D97706' },
  txtOver: { color: '#EF4444' },
  taskCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    lineHeight: 21,
  },
  titleFinished: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  cardFooterBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  dateInfoText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    marginRight: 8,
    fontWeight: '500',
  },
  countdownBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countNormal: { backgroundColor: '#FEF3C7' },
  countOverdue: { backgroundColor: '#FEE2E2' },
  countdownText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countTextNormal: { color: '#D97706' },
  countTextOverdue: { color: '#EF4444' },
  circleCheckTouch: { padding: 2 },
  emptyContainerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyHeadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  emptySubHeadingText: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
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

export default AssignmentsScreen;

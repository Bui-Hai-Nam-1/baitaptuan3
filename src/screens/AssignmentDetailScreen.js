import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const checkDeadlineStatus = (deadlineStr) => {
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
    return {
      text: `Đã quá hạn ${Math.abs(dayDiff)} ngày`,
      isOverdue: true,
    };
  } else if (dayDiff === 0) {
    return {
      text: 'Hạn nộp chính là hôm nay',
      isOverdue: false,
    };
  } else {
    return {
      text: `Còn lại ${dayDiff} ngày để hoàn thành`,
      isOverdue: false,
    };
  }
};

const AssignmentDetailScreen = ({ route, navigation }) => {
  const taskData = route.params?.assignment || {};
  const [completedState, setCompletedState] = useState(
    !!(taskData.hoangThanh ?? taskData.hoanThanh)
  );

  const deadlineInfo = checkDeadlineStatus(taskData.hanNop);

  const handleStatusChange = async () => {
    const toggledValue = !completedState;
    setCompletedState(toggledValue);

    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const listData = existingData ? JSON.parse(existingData) : assignments;
      const modifiedList = listData.map((item) => {
        if (item.id === taskData.id) {
          return {
            ...item,
            hoangThanh: toggledValue,
            hoanThanh: toggledValue,
          };
        }
        return item;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(modifiedList));
    } catch (err) {
      console.error('Lỗi khi cập nhật bộ nhớ:', err);
    }

    if (route.params?.onToggleStatus) {
      route.params.onToggleStatus();
    }
  };

  return (
    <SafeAreaView style={styles.mySafe}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <ScrollView
        style={styles.myScrollContainer}
        contentContainerStyle={styles.myScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title Box */}
        <View style={styles.myTopCard}>
          <View style={styles.myBadgeRow}>
            <View
              style={[
                styles.myStatusPill,
                completedState
                  ? styles.pillCompleted
                  : deadlineInfo.isOverdue
                  ? styles.pillOverdue
                  : styles.pillPending,
              ]}
            >
              <Ionicons
                name={
                  completedState
                    ? 'checkmark-circle-outline'
                    : deadlineInfo.isOverdue
                    ? 'alert-circle-outline'
                    : 'time-outline'
                }
                size={14}
                color={completedState ? '#10B981' : deadlineInfo.isOverdue ? '#EF4444' : '#D97706'}
              />
              <Text
                style={[
                  styles.myStatusPillText,
                  completedState
                    ? styles.colCompleted
                    : deadlineInfo.isOverdue
                    ? styles.colOverdue
                    : styles.colPending,
                ]}
              >
                {completedState ? 'Đã hoàn thành' : deadlineInfo.isOverdue ? 'Đã quá hạn' : 'Đang thực hiện'}
              </Text>
            </View>
          </View>

          <Text style={styles.myTaskTitle}>{taskData.tieuDe}</Text>
        </View>

        {/* Course Info Card */}
        <View style={styles.mySectionCard}>
          <View style={styles.mySectionHeader}>
            <View style={styles.myIconSquare}>
              <Ionicons name="book-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.mySectionHeading}>Thông tin môn học</Text>
          </View>

          <View style={styles.myRowBetween}>
            <Text style={styles.myLabelText}>Tên học phần:</Text>
            <Text style={styles.myValHighlight}>{taskData.tenMH}</Text>
          </View>

          <View style={styles.myRowBetween}>
            <Text style={styles.myLabelText}>Mã học phần:</Text>
            <View style={styles.myCodeMiniTag}>
              <Text style={styles.myCodeMiniText}>{taskData.maMH}</Text>
            </View>
          </View>
        </View>

        {/* Deadline Card */}
        <View style={styles.mySectionCard}>
          <View style={styles.mySectionHeader}>
            <View style={[styles.myIconSquare, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.mySectionHeading}>Thời gian nộp bài</Text>
          </View>

          <View style={styles.myRowBetween}>
            <Text style={styles.myLabelText}>Hạn chót:</Text>
            <Text style={styles.myDeadlineVal}>{formatDisplayDate(taskData.hanNop)}</Text>
          </View>

          <View
            style={[
              styles.myAlertBox,
              completedState
                ? styles.alertCompleted
                : deadlineInfo.isOverdue
                ? styles.alertOverdue
                : styles.alertPending,
            ]}
          >
            <Ionicons
              name={completedState ? 'ribbon-outline' : deadlineInfo.isOverdue ? 'warning-outline' : 'hourglass-outline'}
              size={17}
              color={completedState ? '#10B981' : deadlineInfo.isOverdue ? '#EF4444' : '#D97706'}
            />
            <Text
              style={[
                styles.myAlertText,
                completedState
                  ? styles.colCompleted
                  : deadlineInfo.isOverdue
                  ? styles.colOverdue
                  : styles.colPending,
              ]}
            >
              {completedState ? 'Bài tập đã được xác nhận hoàn thành' : deadlineInfo.text}
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.mySectionCard}>
          <View style={styles.mySectionHeader}>
            <View style={[styles.myIconSquare, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="document-text-outline" size={18} color="#10B981" />
            </View>
            <Text style={styles.mySectionHeading}>Nội dung chi tiết</Text>
          </View>

          <Text style={styles.myDescriptionContent}>
            {taskData.moTa || 'Không có mô tả chi tiết cho nhiệm vụ này.'}
          </Text>
        </View>

        {/* Action Toggle Button */}
        <TouchableOpacity
          style={[styles.myActionButton, completedState ? styles.btnUndoStyle : styles.btnCompleteStyle]}
          activeOpacity={0.85}
          onPress={handleStatusChange}
        >
          <Ionicons
            name={completedState ? 'arrow-undo-outline' : 'checkmark-done-outline'}
            size={19}
            color="#FFFFFF"
            style={styles.myBtnIcon}
          />
          <Text style={styles.myBtnText}>
            {completedState ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mySafe: { flex: 1, backgroundColor: '#F8FAFC' },
  myScrollContainer: { flex: 1 },
  myScrollContent: { padding: 16, paddingBottom: 36 },
  myTopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myBadgeRow: { flexDirection: 'row', marginBottom: 10 },
  myStatusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillCompleted: { backgroundColor: '#ECFDF5' },
  pillPending: { backgroundColor: '#FEF3C7' },
  pillOverdue: { backgroundColor: '#FEE2E2' },
  myStatusPillText: { fontSize: 12, fontWeight: '700', marginLeft: 5 },
  colCompleted: { color: '#10B981' },
  colPending: { color: '#D97706' },
  colOverdue: { color: '#EF4444' },
  myTaskTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', lineHeight: 28 },
  mySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mySectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  myIconSquare: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mySectionHeading: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  myRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  myLabelText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  myValHighlight: { fontSize: 14, fontWeight: '700', color: '#1E293B', flexShrink: 1, textAlign: 'right' },
  myCodeMiniTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  myCodeMiniText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  myDeadlineVal: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  myAlertBox: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 10 },
  alertCompleted: { backgroundColor: '#ECFDF5' },
  alertPending: { backgroundColor: '#FEF3C7' },
  alertOverdue: { backgroundColor: '#FEE2E2' },
  myAlertText: { fontSize: 13, fontWeight: '600', marginLeft: 8, flexShrink: 1 },
  myDescriptionContent: { fontSize: 14, lineHeight: 22, color: '#475569' },
  myActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnCompleteStyle: { backgroundColor: '#10B981' },
  btnUndoStyle: { backgroundColor: '#64748B' },
  myBtnIcon: { marginRight: 8 },
  myBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default AssignmentDetailScreen;
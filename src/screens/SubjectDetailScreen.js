import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { studentInfo, subjects, schedule, assignments, grades } from '../data/mockData';

const ScheduleDetailScreen = ({ route, navigation }) => {
  const currentItem = route?.params?.scheduleItem || {};

  return (
    <SafeAreaView style={styles.mySafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <ScrollView
        style={styles.myContainer}
        contentContainerStyle={styles.myContentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Banner Card */}
        <View style={styles.myTopBanner}>
          <View style={styles.myTagRow}>
            <View style={styles.myCodeTag}>
              <Text style={styles.myCodeTagText}>{currentItem.maMH || 'N/A'}</Text>
            </View>
            <View style={styles.myDayTag}>
              <Ionicons name="time" size={13} color="#10B981" />
              <Text style={styles.myDayTagText}>{currentItem.thu || 'N/A'}</Text>
            </View>
          </View>
          <Text style={styles.myMainTitle}>{currentItem.tenMH || 'Thông tin tiết học'}</Text>
        </View>

        {/* Info Grid Card */}
        <View style={styles.myDetailsCard}>
          <Text style={styles.myCardHeading}>Chi tiết lịch trình</Text>

          {/* Subject Code */}
          <View style={styles.myItemRow}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="code-working-outline" size={19} color="#10B981" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Mã học phần</Text>
              <Text style={styles.myItemTitleVal}>{currentItem.maMH || 'Đang cập nhật'}</Text>
            </View>
          </View>

          {/* Day */}
          <View style={styles.myItemRow}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="calendar-clear-outline" size={19} color="#D97706" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Thứ trong tuần</Text>
              <Text style={styles.myItemTitleVal}>{currentItem.thu || 'Đang cập nhật'}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.myItemRow}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="alarm-outline" size={19} color="#2563EB" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Khung giờ học</Text>
              <Text style={styles.myItemTitleVal}>{currentItem.thoiGian || 'Đang cập nhật'}</Text>
            </View>
          </View>

          {/* Room */}
          <View style={styles.myItemRow}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="map-outline" size={19} color="#9333EA" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Phòng học thực tế</Text>
              <Text style={styles.myItemTitleVal}>{currentItem.phongHoc || 'Đang cập nhật'}</Text>
            </View>
          </View>

          {/* Lecturer */}
          <View style={styles.myItemRow}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="school-outline" size={19} color="#C2410C" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Giảng viên giảng dạy</Text>
              <Text style={styles.myItemTitleVal}>{currentItem.giangVien || 'Đang cập nhật'}</Text>
            </View>
          </View>

          {/* Note */}
          <View style={[styles.myItemRow, styles.myNoMarginBottom]}>
            <View style={[styles.myBoxIcon, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="document-text-outline" size={19} color="#475569" />
            </View>
            <View style={styles.myItemInfo}>
              <Text style={styles.myItemTitleLabel}>Ghi chú môn học</Text>
              <Text style={[styles.myItemTitleVal, !currentItem.ghiChu && styles.myTextItalic]}>
                {currentItem.ghiChu ? currentItem.ghiChu : 'Không có ghi chú bổ sung'}
              </Text>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.myCustomButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back-outline" size={18} color="#FFFFFF" />
          <Text style={styles.myCustomButtonText}>Trở về danh sách</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mySafeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  myContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  myContentScroll: { padding: 18, paddingBottom: 36 },
  myTopBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  myCodeTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  myCodeTagText: { fontSize: 12, fontWeight: '700', color: '#10B981' },
  myDayTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  myDayTagText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  myMainTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: 0.2 },
  myDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myCardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  myItemRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  myNoMarginBottom: { marginBottom: 0 },
  myBoxIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  myItemInfo: { flex: 1, justifyContent: 'center' },
  myItemTitleLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 2 },
  myItemTitleVal: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  myTextItalic: { color: '#94A3B8', fontWeight: '400', fontStyle: 'italic' },
  myCustomButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  myCustomButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default ScheduleDetailScreen;
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
import { studentInfo, subjects, schedule, assignments, grades } from '../data/sampleData';

const ScheduleDetailScreen = ({ route, navigation }) => {
  const scheduleItem = route?.params?.scheduleItem || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90D9" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.codeBadge}>
              <Text style={styles.codeBadgeText}>{scheduleItem.maMH || 'N/A'}</Text>
            </View>
            <View style={styles.dayBadge}>
              <Ionicons name="calendar-outline" size={13} color="#4A90D9" />
              <Text style={styles.dayBadgeText}>{scheduleItem.thu || 'N/A'}</Text>
            </View>
          </View>
          <Text style={styles.title}>{scheduleItem.tenMH || 'Chi tiết lịch học'}</Text>
        </View>

        {/* Detailed Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Thông tin chi tiết</Text>

          {/* Subject Code */}
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#EBF3FB' }]}>
              <Ionicons name="barcode-outline" size={20} color="#4A90D9" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mã môn học</Text>
              <Text style={styles.infoValue}>{scheduleItem.maMH || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Day of Week */}
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="today-outline" size={20} color="#2ECC71" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thứ học</Text>
              <Text style={styles.infoValue}>{scheduleItem.thu || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="time-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian học</Text>
              <Text style={styles.infoValue}>{scheduleItem.thoiGian || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Classroom */}
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="location-outline" size={20} color="#9C27B0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phòng học</Text>
              <Text style={styles.infoValue}>{scheduleItem.phongHoc || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Lecturer */}
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="person-outline" size={20} color="#00BCD4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giảng viên phụ trách</Text>
              <Text style={styles.infoValue}>{scheduleItem.giangVien || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          {/* Note */}
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#FBC02D" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ghi chú</Text>
              <Text style={[styles.infoValue, !scheduleItem.ghiChu && styles.infoValueEmpty]}>
                {scheduleItem.ghiChu ? scheduleItem.ghiChu : 'Không có ghi chú thêm'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button: Quay lại */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Quay lại lịch học</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  codeBadge: {
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A90D9',
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90D9',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    lineHeight: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoRowLast: {
    marginBottom: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  infoValueEmpty: {
    color: '#95A5A6',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ScheduleDetailScreen;
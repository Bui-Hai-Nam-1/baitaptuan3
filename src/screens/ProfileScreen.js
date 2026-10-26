
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { studentInfo } from '../data/mockData';
import { getGrades } from '../api/gradeApi';
import { getCourses } from '../api/courseApi';
import useCachedApi from '../hooks/useCachedApi';

const STORAGE_KEY = 'student_profile';

const fetchProfileGrades = async () => {
  const [grades, courses] = await Promise.all([
    getGrades(),
    getCourses(),
  ]);

  return grades.map(grade => {
    const course = courses.find(
      item => String(item.id) === String(grade.courseId),
    );

    return {
      ...grade,
      id: String(grade.id),
      tenMH:
        course?.name ||
        course?.title ||
        course?.tenMH ||
        'Chưa có tên môn học',
      maMH: grade.courseId,
      diemQuaTrinh: grade.processScore ?? grade.diemQuaTrinh ?? null,
      diemGiuaKy: grade.midtermScore ?? grade.diemGiuaKy ?? null,
      diemCuoiKy: grade.finalScore ?? grade.diemCuoiKy ?? null,
      trangThai:
        (grade.finalScore ?? grade.diemCuoiKy) !== null &&
        (grade.finalScore ?? grade.diemCuoiKy) !== undefined &&
        (grade.finalScore ?? grade.diemCuoiKy) !== ''
          ? 'Hoàn thành'
          : 'Đang học',
    };
  });
};

const ProfileScreen = ({ navigation }) => {
  const {
    data: profileGrades,
    loading: gradesLoading,
    error: gradesError,
    source: gradesSource,
    refresh: refreshGrades,
  } = useCachedApi('profile_grades_combined', fetchProfileGrades);

  const [profile, setProfile] = useState(studentInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editForm, setEditForm] = useState({
    hoTen: studentInfo.hoTen || '',
    email: studentInfo.email || '',
    soDienThoai: studentInfo.soDienThoai || '',
  });

  useEffect(() => {
    loadSavedProfile();
  }, []);

  const loadSavedProfile = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedData !== null) {
        const parsed = JSON.parse(savedData);

        setProfile(prev => ({ ...prev, ...parsed }));

        setEditForm({
          hoTen: parsed.hoTen || studentInfo.hoTen || '',
          email: parsed.email || studentInfo.email || '',
          soDienThoai:
            parsed.soDienThoai || studentInfo.soDienThoai || '',
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin sinh viên:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await refreshGrades();
    } finally {
      setRefreshing(false);
    }
  }, [refreshGrades]);

  const handleStartEditing = () => {
    setEditForm({
      hoTen: profile.hoTen || '',
      email: profile.email || '',
      soDienThoai: profile.soDienThoai || '',
    });

    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditForm({
      hoTen: profile.hoTen || '',
      email: profile.email || '',
      soDienThoai: profile.soDienThoai || '',
    });

    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!editForm.hoTen.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    try {
      const updatedProfile = {
        ...profile,
        hoTen: editForm.hoTen.trim(),
        email: editForm.email.trim(),
        soDienThoai: editForm.soDienThoai.trim(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProfile),
      );

      setProfile(updatedProfile);
      setIsEditing(false);

      Alert.alert('Thành công', 'Đã lưu thông tin cá nhân!');
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin. Vui lòng thử lại.');
    }
  };

  const getInitials = name => {
    if (!name) return 'SV';

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 1).toUpperCase();
    }

    return (
      words[0].substring(0, 1) +
      words[words.length - 1].substring(0, 1)
    ).toUpperCase();
  };

  const getScoreColor = score => {
    if (score === null || score === undefined || score === '') {
      return '#8E8E93';
    }

    const number = Number(score);

    if (!Number.isFinite(number)) return '#8E8E93';
    if (number >= 8.5) return '#2ECC71';
    if (number >= 7) return '#4A90D9';
    if (number >= 5) return '#F39C12';

    return '#E74C3C';
  };

  const formatScore = score => {
    if (score === null || score === undefined || score === '') {
      return '--';
    }

    const number = Number(score);

    return Number.isFinite(number) ? number.toFixed(1) : '--';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F7FA"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4A90D9']}
          />
        }
      >
        {/* Header sinh viên */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(profile.hoTen)}
              </Text>
            </View>

            <View style={styles.avatarBadge}>
              <Ionicons
                name="checkmark-sharp"
                size={14}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.nameHeader}>{profile.hoTen}</Text>
          <Text style={styles.maSVHeader}>
            Mã SV: {profile.maSV}
          </Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Ionicons
                name="school-outline"
                size={13}
                color="#4A90D9"
              />
              <Text style={styles.tagText}>{profile.lop}</Text>
            </View>

            <View style={[styles.tag, styles.tagNganh]}>
              <Ionicons
                name="briefcase-outline"
                size={13}
                color="#27AE60"
              />
              <Text style={[styles.tagText, styles.tagTextNganh]}>
                {profile.nganh}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin cá nhân */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#4A90D9"
              />
              <Text style={styles.sectionTitle}>
                Thông tin cá nhân
              </Text>
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.7}
                onPress={handleStartEditing}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#4A90D9"
                />
                <Text style={styles.editButtonText}>
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Mã sinh viên */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="card-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Mã sinh viên</Text>
              <Text style={styles.valueReadOnly}>
                {profile.maSV}
              </Text>
            </View>
          </View>

          {/* Họ và tên */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="person-circle-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Họ và tên</Text>

              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.hoTen}
                  onChangeText={text =>
                    setEditForm(prev => ({ ...prev, hoTen: text }))
                  }
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#A0A0A0"
                />
              ) : (
                <Text style={styles.value}>{profile.hoTen}</Text>
              )}
            </View>
          </View>

          {/* Lớp */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="people-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Lớp</Text>
              <Text style={styles.valueReadOnly}>
                {profile.lop}
              </Text>
            </View>
          </View>

          {/* Ngành học */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="book-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Ngành học</Text>
              <Text style={styles.valueReadOnly}>
                {profile.nganh}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Email</Text>

              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={text =>
                    setEditForm(prev => ({ ...prev, email: text }))
                  }
                  placeholder="Nhập email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0A0A0"
                />
              ) : (
                <Text style={styles.value}>{profile.email}</Text>
              )}
            </View>
          </View>

          {/* Số điện thoại */}
          <View style={styles.infoRow}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="call-outline"
                size={18}
                color="#4A90D9"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.label}>Số điện thoại</Text>

              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editForm.soDienThoai}
                  onChangeText={text =>
                    setEditForm(prev => ({
                      ...prev,
                      soDienThoai: text,
                    }))
                  }
                  placeholder="Nhập số điện thoại"
                  keyboardType="phone-pad"
                  placeholderTextColor="#A0A0A0"
                />
              ) : (
                <Text style={styles.value}>
                  {profile.soDienThoai}
                </Text>
              )}
            </View>
          </View>

          {/* Nút lưu và hủy */}
          {isEditing && (
            <View style={styles.buttonActionGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={handleCancelEditing}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                activeOpacity={0.8}
                onPress={handleSaveProfile}
              >
                <Ionicons
                  name="save-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.saveButtonText}>
                  Lưu thay đổi
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bảng điểm */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="trophy-outline"
                size={20}
                color="#4A90D9"
              />
              <Text style={styles.sectionTitle}>
                Kết quả học tập
              </Text>
            </View>

            <Text style={styles.subCountBadge}>
              {profileGrades.length} môn
            </Text>
          </View>

          <View style={styles.divider} />

          {gradesSource === 'cache' && (
            <Text style={styles.gradeNotice}>
              Đang hiển thị dữ liệu đã lưu trên thiết bị.
            </Text>
          )}

          {gradesError && profileGrades.length > 0 && (
            <Text style={styles.gradeNotice}>
              Không thể làm mới điểm số. Đang hiển thị dữ liệu đã lưu.
            </Text>
          )}

          {gradesLoading && profileGrades.length === 0 && (
            <Text style={styles.gradeNotice}>
              Đang tải bảng điểm...
            </Text>
          )}

          {gradesError && profileGrades.length === 0 && (
            <TouchableOpacity onPress={refreshGrades}>
              <Text style={styles.gradeNotice}>
                Không tải được bảng điểm. Nhấn vào đây để thử lại.
              </Text>
            </TouchableOpacity>
          )}

          {!gradesLoading && !gradesError && profileGrades.length === 0 && (
            <Text style={styles.gradeNotice}>
              Chưa có dữ liệu bảng điểm.
            </Text>
          )}

          {profileGrades.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.gradeItemCard}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('GradeDetail', { grade: item })
              }
            >
              <View style={styles.gradeHeaderRow}>
                <View style={styles.gradeTitleContainer}>
                  <Text
                    style={styles.gradeSubjectName}
                    numberOfLines={1}
                  >
                    {item.tenMH}
                  </Text>

                  <Text style={styles.gradeSubjectCode}>
                    {item.maMH ?? '—'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.trangThai === 'Hoàn thành'
                      ? styles.statusCompleted
                      : styles.statusInProgress,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.trangThai === 'Hoàn thành'
                        ? styles.statusCompletedText
                        : styles.statusInProgressText,
                    ]}
                  >
                    {item.trangThai}
                  </Text>
                </View>
              </View>

              <View style={styles.gradeScoresRow}>
                <View style={styles.scoreBlock}>
                  <Text style={styles.scoreBlockLabel}>
                    Quá trình
                  </Text>
                  <Text
                    style={[
                      styles.scoreBlockValue,
                      { color: getScoreColor(item.diemQuaTrinh) },
                    ]}
                  >
                    {formatScore(item.diemQuaTrinh)}
                  </Text>
                </View>

                <View style={styles.scoreBlock}>
                  <Text style={styles.scoreBlockLabel}>
                    Giữa kỳ
                  </Text>
                  <Text
                    style={[
                      styles.scoreBlockValue,
                      { color: getScoreColor(item.diemGiuaKy) },
                    ]}
                  >
                    {formatScore(item.diemGiuaKy)}
                  </Text>
                </View>

                <View style={styles.scoreBlock}>
                  <Text style={styles.scoreBlockLabel}>
                    Cuối kỳ
                  </Text>
                  <Text
                    style={[
                      styles.scoreBlockValue,
                      { color: getScoreColor(item.diemCuoiKy) },
                    ]}
                  >
                    {item.diemCuoiKy === null ||
                    item.diemCuoiKy === undefined ||
                    item.diemCuoiKy === ''
                      ? 'Chưa có'
                      : formatScore(item.diemCuoiKy)}
                  </Text>
                </View>

                <View style={styles.chevronWrapper}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#B0B0B0"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  maSVHeader: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagNganh: {
    backgroundColor: '#E8F8F0',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90D9',
    marginLeft: 4,
  },
  tagTextNganh: {
    color: '#27AE60',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    color: '#4A90D9',
    fontWeight: '600',
    marginLeft: 4,
  },
  subCountBadge: {
    fontSize: 12,
    color: '#718096',
    backgroundColor: '#F0F3F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F5FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500',
  },
  valueReadOnly: {
    fontSize: 15,
    color: '#4A5568',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4A90D9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  buttonActionGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gradeNotice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 18,
  },
  gradeItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gradeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gradeTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  gradeSubjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  gradeSubjectCode: {
    fontSize: 12,
    color: '#718096',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: '#E8F8F0',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusCompletedText: {
    color: '#27AE60',
  },
  statusInProgressText: {
    color: '#D97706',
  },
  gradeScoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  scoreBlock: {
    alignItems: 'center',
    flex: 1,
  },
  scoreBlockLabel: {
    fontSize: 11,
    color: '#718096',
    marginBottom: 2,
  },
  scoreBlockValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevronWrapper: {
    paddingLeft: 6,
  },
});

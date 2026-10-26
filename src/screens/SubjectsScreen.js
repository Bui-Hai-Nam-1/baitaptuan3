import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getCourses } from '../api/courseApi';
import { getGrades } from '../api/gradeApi';
import useCachedApi from '../hooks/useCachedApi';


const SubjectsScreen = ({ navigation }) => {
  const [keyword, setKeyword] = useState('');
  const fetchGrades = useCallback(() => getGrades(), []);

  const {
    data: grades,
    loading: gradesLoading,
    error: gradesError,
  } = useCachedApi('grades', fetchGrades);

  // Lấy danh sách môn học từ API.
  const fetchCourses = useCallback(() => getCourses(), []);

  // Tự động dùng cache nếu mất mạng hoặc API lỗi.
  const {
    data: apiCourses,
    loading,
    error,
    source,
    refresh,
  } = useCachedApi('courses', fetchCourses);

  // Chuyển tên trường API sang tên trường giao diện đang sử dụng.
  const subjectsFromApi = useMemo(() => {
    return apiCourses.map((course) => {
      const grade = grades.find(
        (item) => String(item.courseId) === String(course.id)
      );

      // Chỉ tính những điểm thực sự đã có.
      const scores = [
        grade?.processScore,
        grade?.midtermScore,
        grade?.finalScore,
      ].filter(
        (score) =>
          score !== null &&
          score !== undefined &&
          score !== '' &&
          Number.isFinite(Number(score))
      ).map(Number);

      // Quy đổi điểm trung bình thang 10 thành phần trăm.
      const tienDo = scores.length
        ? Math.round(
            (scores.reduce((sum, score) => sum + score, 0) /
              scores.length) *
              10
          )
        : 0;

      return {
        id: course.id,
        maMH: course.id,
        tenMH: course.name,
        soTinChi: course.credits,
        giangVien: course.teacher,
        tienDo,
      };
    });
  }, [apiCourses, grades]);

  const subjectList = useMemo(() => {
    const lowerKey = keyword.toLowerCase().trim();

    if (!lowerKey) {
      return subjectsFromApi;
    }

    return subjectsFromApi.filter(
      (item) =>
        item.tenMH?.toLowerCase().includes(lowerKey) ||
        item.maMH?.toLowerCase().includes(lowerKey)
    );
  }, [keyword, subjectsFromApi]);


  const renderSubjectCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.courseCard}
        activeOpacity={0.82}
        onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseTag}>
            <Text style={styles.courseTagText}>{item.maMH}</Text>
          </View>
          <View style={styles.creditChip}>
            <Ionicons name="school-outline" size={13} color="#10B981" />
            <Text style={styles.creditChipText}>{item.soTinChi} tín chỉ</Text>
          </View>
        </View>

        <Text style={styles.courseTitle}>{item.tenMH}</Text>

        <View style={styles.lecturerRow}>
          <View style={styles.lecturerAvatar}>
            <Ionicons name="person" size={12} color="#10B981" />
          </View>
          <Text style={styles.lecturerName}>GV: {item.giangVien}</Text>
        </View>

        <View style={styles.progressBox}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressTitle}>Tiến độ học tập</Text>
            <Text style={styles.progressNum}>{item.tienDo}%</Text>
          </View>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barActiveFill,
                {
                  width: `${Math.min(Math.max(item.tienDo, 0), 100)}%`,
                  backgroundColor:
                    item.tienDo >= 80
                      ? '#10B981'
                      : item.tienDo >= 50
                      ? '#059669'
                      : '#F59E0B',
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNoResults = () => (
    <View style={styles.notFoundBox}>
      <Ionicons name="search-circle-outline" size={64} color="#CBD5E1" />
      <Text style={styles.notFoundTitle}>Không tìm thấy môn học nào</Text>
      <Text style={styles.notFoundDesc}>
        Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc mã môn học
      </Text>
    </View>
  );
  
const renderEmptyState = () => {
  if (loading) {
    return (
      <View style={styles.notFoundBox}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.notFoundDesc}>
          Đang tải danh sách môn học...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.notFoundBox}>
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color="#94A3B8"
        />
        <Text style={styles.notFoundTitle}>
          Không tải được môn học
        </Text>
        <Text style={styles.notFoundDesc}>
          Kiểm tra kết nối mạng và json-server.
        </Text>

        <TouchableOpacity
          onPress={refresh}
          style={{
            marginTop: 14,
            backgroundColor: '#10B981',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return renderNoResults();
};


  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <View style={styles.mainContainer}>
        {/* Header Block */}
        <View style={styles.headerBanner}>
          <Text style={styles.headerMainTitle}>Danh Sách Học Phần</Text>
          <Text style={styles.headerSubTitle}>
            Hiển thị {subjectList.length} môn học trong học kỳ
            {source === 'cache' ? ' · Dữ liệu offline' : ''}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarBox}>
          <Ionicons name="search-outline" size={19} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInputField}
            placeholder="Tìm theo tên hoặc mã môn học..."
            placeholderTextColor="#94A3B8"
            value={keyword}
            onChangeText={setKeyword}
            clearButtonMode="while-editing"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Subjects List */}
        <FlatList
          data={subjectList}
          keyExtractor={(item) => String(item.id || item.maMH)}
          renderItem={renderSubjectCard}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refresh}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBanner: {
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
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  scrollListPadding: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  courseTagText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  creditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  creditChipText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  lecturerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  lecturerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  lecturerName: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  progressBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  barBackground: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barActiveFill: {
    height: '100%',
    borderRadius: 4,
  },
  notFoundBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  notFoundTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  notFoundDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default SubjectsScreen;
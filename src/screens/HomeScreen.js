
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { studentInfo } from '../data/mockData';
import { getCourses } from '../api/courseApi';
import { getAssignments } from '../api/assignmentApi';
import useCachedApi from '../hooks/useCachedApi';

const fetchHomeDashboard = async () => {
  const [courses, assignments] = await Promise.all([
    getCourses(),
    getAssignments(),
  ]);

  const normalizedCourses = courses.map(course => ({
    ...course,
    id: String(course.id),
    maMH: course.code ?? course.courseCode ?? course.maMH ?? String(course.id),
    tenMH:
      course.name ??
      course.courseName ??
      course.title ??
      course.tenMH ??
      'Chưa có tên môn học',
    soTinChi: course.credits ?? course.credit ?? course.soTinChi ?? 0,
    tienDo: Number(course.progress ?? course.tienDo ?? 0),
  }));

  const normalizedAssignments = assignments.map(task => {
    const course = courses.find(
      item => String(item.id) === String(task.courseId),
    );

    const completed =
      task.completed ??
      task.isCompleted ??
      task.hoanThanh ??
      task.hoangThanh ??
      false;

    return {
      ...task,
      id: String(task.id),
      tieuDe:
        task.title ??
        task.name ??
        task.tieuDe ??
        'Bài tập chưa có tiêu đề',
      hanNop: task.dueDate ?? task.deadline ?? task.hanNop ?? '',
      hoanThanh: completed,
      tenMH:
        course?.name ??
        course?.courseName ??
        course?.title ??
        course?.tenMH ??
        'Chưa xác định môn học',
      maMH:
        course?.code ??
        course?.courseCode ??
        course?.maMH ??
        String(task.courseId ?? ''),
    };
  });

  return {
    courses: normalizedCourses,
    assignments: normalizedAssignments,
  };
};

const HomeScreen = ({ navigation }) => {
  const {
    data,
    loading,
    error,
    source,
    refresh,
  } = useCachedApi('home_dashboard', fetchHomeDashboard);

  const homeData =
    data && !Array.isArray(data)
      ? data
      : { courses: [], assignments: [] };

  const featuredSubjects = homeData.courses.slice(0, 4);

  const pendingAssignments = [...homeData.assignments]
    .filter(task => {
      return (
        task.hoanThanh !== true &&
        String(task.hoanThanh).toLowerCase() !== 'true' &&
        String(task.status ?? '').toLowerCase() !== 'completed' &&
        String(task.status ?? '').toLowerCase() !== 'submitted'
      );
    })
    .sort((a, b) => {
      if (!a.hanNop) return 1;
      if (!b.hanNop) return -1;
      return new Date(a.hanNop) - new Date(b.hanNop);
    })
    .slice(0, 3);

  const fetchTodayString = () => {
    const today = new Date();
    const dayNames = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ];

    const day = dayNames[today.getDay()];
    const date = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}, ${date}/${month}/${year}`;
  };

  const transformDate = rawDate => {
    if (!rawDate) return 'Chưa có hạn nộp';

    const match = String(rawDate).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return rawDate;
  };

  const calculateDaysLeft = targetDateStr => {
    if (!targetDateStr) return 'Chưa có hạn nộp';

    const match = String(targetDateStr).match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

    let deadline;

    if (match) {
      deadline = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      );
    } else {
      deadline = new Date(targetDateStr);
    }

    if (Number.isNaN(deadline.getTime())) {
      return 'Chưa xác định hạn';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`;
    }

    if (diffDays === 0) {
      return 'Hạn nộp hôm nay';
    }

    return `Còn ${diffDays} ngày`;
  };

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.mySafeLayout}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />

      <ScrollView
        style={styles.myContainerScroll}
        contentContainerStyle={styles.myScrollContentPad}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && homeData.courses.length > 0}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
      >
        <View style={styles.myTopHeaderBox}>
          <View style={styles.myHeaderFlexRow}>
            <View style={styles.myHeaderInfo}>
              <Text style={styles.myDateLabel}>
                {fetchTodayString()}
              </Text>
              <Text style={styles.myWelcomeLabel}>Xin chào,</Text>
              <Text style={styles.myStudentNameText}>
                {studentInfo.hoTen}
              </Text>
              <Text style={styles.myStudentIdText}>
                MSSV: {studentInfo.maSV}
              </Text>
            </View>

            <View style={styles.myAvatarWrap}>
              <Ionicons
                name="person-circle-outline"
                size={56}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {source === 'cache' && (
          <View style={styles.myNoticeBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={17}
              color="#B45309"
            />
            <Text style={styles.myNoticeText}>
              Đang hiển thị dữ liệu đã lưu offline
            </Text>
          </View>
        )}

        {error && homeData.courses.length === 0 &&
          homeData.assignments.length === 0 && (
            <TouchableOpacity
              style={styles.myErrorBox}
              onPress={handleRefresh}
              activeOpacity={0.8}
            >
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color="#DC2626"
              />
              <Text style={styles.myErrorText}>
                Không tải được dữ liệu. Nhấn để thử lại.
              </Text>
            </TouchableOpacity>
          )}

        {loading &&
          homeData.courses.length === 0 &&
          homeData.assignments.length === 0 && (
            <View style={styles.myLoadingBox}>
              <Text style={styles.myLoadingText}>
                Đang tải dữ liệu trang chủ...
              </Text>
            </View>
          )}

        <View style={styles.mySectionBlock}>
          <View style={styles.mySectionHeaderRow}>
            <View style={styles.myTitleInline}>
              <Ionicons
                name="book-outline"
                size={19}
                color="#10B981"
              />
              <Text style={styles.mySectionHeadingTitle}>
                Môn học hiện tại
              </Text>
            </View>

            <Text style={styles.mySectionCountLabel}>
              ({featuredSubjects.length} học phần)
            </Text>
          </View>

          {featuredSubjects.length === 0 && !loading ? (
            <View style={styles.myEmptyNoticeBox}>
              <Text style={styles.myEmptyNoticeText}>
                Chưa có dữ liệu môn học.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.myHorizontalSubList}
            >
              {featuredSubjects.map(crs => (
                <TouchableOpacity
                  key={crs.id}
                  style={styles.myCourseCardItem}
                  activeOpacity={0.82}
                  onPress={() =>
                    navigation.navigate('SubjectDetail', {
                      subject: crs,
                    })
                  }
                >
                  <View style={styles.myCourseCodeTag}>
                    <Text style={styles.myCourseCodeText}>
                      {crs.maMH}
                    </Text>
                  </View>

                  <Text
                    style={styles.myCourseNameText}
                    numberOfLines={2}
                  >
                    {crs.tenMH}
                  </Text>

                  <View style={styles.myCreditRow}>
                    <Ionicons
                      name="school-outline"
                      size={13}
                      color="#64748B"
                    />
                    <Text style={styles.myCreditText}>
                      {crs.soTinChi} tín chỉ
                    </Text>
                  </View>

                  <View style={styles.myCardProgressBox}>
                    <View style={styles.myProgressTextInfo}>
                      <Text style={styles.myProgLabel}>
                        Tiến độ
                      </Text>
                      <Text style={styles.myProgNum}>
                        {Math.max(
                          0,
                          Math.min(Number(crs.tienDo) || 0, 100),
                        )}%
                      </Text>
                    </View>

                    <View style={styles.myTrackBg}>
                      <View
                        style={[
                          styles.myTrackFill,
                          {
                            width: `${Math.max(
                              0,
                              Math.min(Number(crs.tienDo) || 0, 100),
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.mySectionBlock}>
          <View style={styles.mySectionHeaderRow}>
            <View style={styles.myTitleInline}>
              <Ionicons
                name="clipboard-outline"
                size={19}
                color="#D97706"
              />
              <Text style={styles.mySectionHeadingTitle}>
                Nhiệm vụ sắp tới
              </Text>
            </View>

            <Text style={styles.mySectionCountLabel}>
              ({pendingAssignments.length} bài)
            </Text>
          </View>

          {pendingAssignments.length === 0 ? (
            <View style={styles.myEmptyNoticeBox}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={42}
                color="#10B981"
              />
              <Text style={styles.myEmptyNoticeText}>
                {loading
                  ? 'Đang tải danh sách bài tập...'
                  : 'Tuyệt vời! Bạn đã hoàn thành toàn bộ bài tập.'}
              </Text>
            </View>
          ) : (
            pendingAssignments.map(taskItem => (
              <TouchableOpacity
                key={taskItem.id}
                style={styles.myTaskRowCard}
                activeOpacity={0.82}
                onPress={() =>
                  navigation.navigate('AssignmentDetail', {
                    assignment: taskItem,
                  })
                }
              >
                <View style={styles.myTaskInnerRow}>
                  <View style={styles.myTaskIconBox}>
                    <Ionicons
                      name="document-text-outline"
                      size={22}
                      color="#10B981"
                    />
                  </View>

                  <View style={styles.myTaskTitleBlock}>
                    <Text
                      style={styles.myTaskTitleText}
                      numberOfLines={1}
                    >
                      {taskItem.tieuDe}
                    </Text>
                    <Text style={styles.myTaskSubSubjectText}>
                      {taskItem.tenMH}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </View>

                <View style={styles.myTaskCardFooter}>
                  <View style={styles.myDeadlineInline}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#64748B"
                    />
                    <Text style={styles.myDeadlineText}>
                      Hạn: {transformDate(taskItem.hanNop)}
                    </Text>
                  </View>

                  <View style={styles.myCountdownBadgeMini}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color="#D97706"
                    />
                    <Text style={styles.myCountdownBadgeText}>
                      {calculateDaysLeft(taskItem.hanNop)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mySafeLayout: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  myContainerScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  myScrollContentPad: {
    paddingBottom: 28,
  },
  myTopHeaderBox: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  myHeaderFlexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myHeaderInfo: {
    flex: 1,
    marginRight: 10,
  },
  myDateLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  myWelcomeLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  myStudentNameText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  myStudentIdText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  myAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  myNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  myNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#92400E',
  },
  myErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  myErrorText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#991B1B',
  },
  myLoadingBox: {
    padding: 20,
    alignItems: 'center',
  },
  myLoadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  mySectionBlock: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  mySectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myTitleInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mySectionHeadingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 6,
  },
  mySectionCountLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  myHorizontalSubList: {
    paddingVertical: 4,
    gap: 12,
  },
  myCourseCardItem: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myCourseCodeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  myCourseCodeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  myCourseNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    minHeight: 40,
    lineHeight: 20,
  },
  myCreditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  myCreditText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  myCardProgressBox: {
    marginTop: 'auto',
  },
  myProgressTextInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  myProgLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  myProgNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  myTrackBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  myTrackFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  myTaskRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myTaskInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myTaskIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  myTaskTitleBlock: {
    flex: 1,
  },
  myTaskTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  myTaskSubSubjectText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  myTaskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  myDeadlineInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  myDeadlineText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    flexShrink: 1,
  },
  myCountdownBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  myCountdownBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 3,
  },
  myEmptyNoticeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myEmptyNoticeText: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;

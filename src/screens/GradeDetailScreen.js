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

const GradeDetailScreen = ({ route, navigation }) => {
  const currentGrade = route?.params?.grade || {};

  const evaluateScore = (scoreVal) => {
    if (scoreVal === null || scoreVal === undefined) {
      return { text: 'Chưa có', color: '#94A3B8', bg: '#F1F5F9', rank: 'Chưa đánh giá' };
    }
    if (scoreVal >= 8.5) {
      return { text: scoreVal.toFixed(1), color: '#10B981', bg: '#ECFDF5', rank: 'Xuất sắc / Giỏi' };
    }
    if (scoreVal >= 7.0) {
      return { text: scoreVal.toFixed(1), color: '#0284C7', bg: '#E0F2FE', rank: 'Khá' };
    }
    if (scoreVal >= 5.0) {
      return { text: scoreVal.toFixed(1), color: '#D97706', bg: '#FEF3C7', rank: 'Trung bình' };
    }
    return { text: scoreVal.toFixed(1), color: '#EF4444', bg: '#FEE2E2', rank: 'Cần cố gắng' };
  };

  const processScoreInfo = evaluateScore(currentGrade.diemQuaTrinh);
  const midScoreInfo = evaluateScore(currentGrade.diemGiuaKy);
  const finalScoreInfo = evaluateScore(currentGrade.diemCuoiKy);
  const totalScoreInfo = evaluateScore(currentGrade.diemTongKet);

  const matchedCourse = subjects.find((s) => s.maMH === currentGrade.maMH);

  return (
    <SafeAreaView style={styles.mySafeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#10B981" />
      <ScrollView
        contentContainerStyle={styles.myScrollPad}
        showsVerticalScrollIndicator={false}
      >
        {/* Course Header Banner */}
        <View style={styles.myHeaderCard}>
          <View style={styles.myBadgeRow}>
            <View style={styles.myCodeBadge}>
              <Ionicons name="bookmark-outline" size={13} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.myCodeText}>{currentGrade.maMH || 'N/A'}</Text>
            </View>
            <View
              style={[
                styles.myStatusPill,
                currentGrade.trangThai === 'Hoàn thành'
                  ? styles.pillDone
                  : styles.pillDoing,
              ]}
            >
              <Text
                style={[
                  styles.myStatusPillText,
                  currentGrade.trangThai === 'Hoàn thành'
                    ? styles.txtDone
                    : styles.txtDoing,
                ]}
              >
                {currentGrade.trangThai || 'Đang học'}
              </Text>
            </View>
          </View>

          <Text style={styles.mySubjectName}>{currentGrade.tenMH || 'Chi tiết điểm thành phần'}</Text>

          {matchedCourse && (
            <View style={styles.myMetaRow}>
              <View style={styles.myMetaBlock}>
                <Ionicons name="ribbon-outline" size={15} color="#64748B" />
                <Text style={styles.myMetaLabel}>{matchedCourse.soTinChi} tín chỉ</Text>
              </View>
              <View style={styles.myMetaBlock}>
                <Ionicons name="person-outline" size={15} color="#64748B" />
                <Text style={styles.myMetaLabel}>{matchedCourse.giangVien}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Total Score Summary Box */}
        <View style={styles.mySummaryCard}>
          <Text style={styles.mySummaryHeading}>Điểm tổng kết học phần</Text>
          <View
            style={[
              styles.myScoreCircleBox,
              { borderColor: totalScoreInfo.color, backgroundColor: totalScoreInfo.bg },
            ]}
          >
            <Text style={[styles.myCircleNumberText, { color: totalScoreInfo.color }]}>
              {totalScoreInfo.text}
            </Text>
          </View>
          <Text style={[styles.myRankTextLabel, { color: totalScoreInfo.color }]}>
            {totalScoreInfo.rank}
          </Text>
          <Text style={styles.mySummaryDesc}>
            {currentGrade.diemTongKet !== null && currentGrade.diemTongKet !== undefined
              ? 'Đã được tổng hợp vào hệ thống tín chỉ học tập'
              : 'Điểm tổng kết đang chờ cập nhật kết quả thi'}
          </Text>
        </View>

        {/* Component Scores List */}
        <View style={styles.myCardBox}>
          <View style={styles.myCardTitleRow}>
            <Ionicons name="stats-chart-outline" size={18} color="#10B981" />
            <Text style={styles.myCardTitleText}>Điểm các thành phần</Text>
          </View>

          <View style={styles.mySeparator} />

          {/* Process Score */}
          <View style={styles.scoreRowItem}>
            <View style={styles.scoreRowLeftBlock}>
              <View style={[styles.dotIndicator, { backgroundColor: processScoreInfo.color }]} />
              <View>
                <Text style={styles.scoreItemTitle}>Điểm quá trình (Chuyên cần / Bài tập)</Text>
                <Text style={styles.scoreItemWeightText}>Trọng số: 20%</Text>
              </View>
            </View>
            <View style={[styles.scoreResultBadge, { backgroundColor: processScoreInfo.bg }]}>
              <Text style={[styles.scoreResultText, { color: processScoreInfo.color }]}>
                {processScoreInfo.text}
              </Text>
            </View>
          </View>

          {/* Midterm Score */}
          <View style={styles.scoreRowItem}>
            <View style={styles.scoreRowLeftBlock}>
              <View style={[styles.dotIndicator, { backgroundColor: midScoreInfo.color }]} />
              <View>
                <Text style={styles.scoreItemTitle}>Điểm thi giữa kỳ</Text>
                <Text style={styles.scoreItemWeightText}>Trọng số: 30%</Text>
              </View>
            </View>
            <View style={[styles.scoreResultBadge, { backgroundColor: midScoreInfo.bg }]}>
              <Text style={[styles.scoreResultText, { color: midScoreInfo.color }]}>
                {midScoreInfo.text}
              </Text>
            </View>
          </View>

          {/* Final Score */}
          <View style={styles.scoreRowItem}>
            <View style={styles.scoreRowLeftBlock}>
              <View style={[styles.dotIndicator, { backgroundColor: finalScoreInfo.color }]} />
              <View>
                <Text style={styles.scoreItemTitle}>Điểm thi cuối kỳ</Text>
                <Text style={styles.scoreItemWeightText}>Trọng số: 50%</Text>
              </View>
            </View>
            <View style={[styles.scoreResultBadge, { backgroundColor: finalScoreInfo.bg }]}>
              <Text style={[styles.scoreResultText, { color: finalScoreInfo.color }]}>
                {finalScoreInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Visual Progress Bar Section */}
        <View style={styles.myCardBox}>
          <View style={styles.myCardTitleRow}>
            <Ionicons name="bar-chart-outline" size={18} color="#10B981" />
            <Text style={styles.myCardTitleText}>Biểu đồ phân bổ (Thang 10)</Text>
          </View>

          <View style={styles.mySeparator} />

          <View style={styles.progressBarWrapper}>
            <View style={styles.barHeaderInfo}>
              <Text style={styles.barLabelName}>Quá trình</Text>
              <Text style={styles.barValNumber}>{processScoreInfo.text}</Text>
            </View>
            <View style={styles.trackBackground}>
              <View
                style={[
                  styles.fillProgressBar,
                  {
                    width: `${currentGrade.diemQuaTrinh ? Math.min(currentGrade.diemQuaTrinh * 10, 100) : 0}%`,
                    backgroundColor: processScoreInfo.color,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressBarWrapper}>
            <View style={styles.barHeaderInfo}>
              <Text style={styles.barLabelName}>Giữa kỳ</Text>
              <Text style={styles.barValNumber}>{midScoreInfo.text}</Text>
            </View>
            <View style={styles.trackBackground}>
              <View
                style={[
                  styles.fillProgressBar,
                  {
                    width: `${currentGrade.diemGiuaKy ? Math.min(currentGrade.diemGiuaKy * 10, 100) : 0}%`,
                    backgroundColor: midScoreInfo.color,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressBarWrapper}>
            <View style={styles.barHeaderInfo}>
              <Text style={styles.barLabelName}>Cuối kỳ</Text>
              <Text style={styles.barValNumber}>{finalScoreInfo.text}</Text>
            </View>
            <View style={styles.trackBackground}>
              <View
                style={[
                  styles.fillProgressBar,
                  {
                    width: `${currentGrade.diemCuoiKy ? Math.min(currentGrade.diemCuoiKy * 10, 100) : 0}%`,
                    backgroundColor: finalScoreInfo.color,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Back Navigation Button */}
        <TouchableOpacity
          style={styles.myCustomBackButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.myBackBtnText}>Quay lại danh sách điểm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mySafeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  myScrollPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  myHeaderCard: {
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
  myBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  myCodeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  myStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillDone: {
    backgroundColor: '#ECFDF5',
  },
  txtDone: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  pillDoing: {
    backgroundColor: '#FEF3C7',
  },
  txtDoing: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
  mySubjectName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    marginBottom: 10,
  },
  myMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  myMetaBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myMetaLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 5,
    fontWeight: '500',
  },
  mySummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mySummaryHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  myScoreCircleBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  myCircleNumberText: {
    fontSize: 26,
    fontWeight: '800',
  },
  myRankTextLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  mySummaryDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  myCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  myCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  myCardTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  mySeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  scoreRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  scoreRowLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  scoreItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  scoreItemWeightText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  scoreResultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    minWidth: 56,
    alignItems: 'center',
  },
  scoreResultText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginBottom: 12,
  },
  barHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barLabelName: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  barValNumber: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  trackBackground: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  myCustomBackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  myBackBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default GradeDetailScreen;
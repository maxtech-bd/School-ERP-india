import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { timetableAPI } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIOD_COLORS = [
  '#00b894', '#6c5ce7', '#e17055', '#00cec9', 
  '#fdcb6e', '#e84393', '#74b9ff', '#a29bfe'
];

const TimeTableScreen = ({ navigation }) => {
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await timetableAPI.getTimetables();
      const timetableData = response.data?.timetables || response.data || [];
      
      setTimetables(timetableData);
      
      if (timetableData.length > 0 && !selectedTimetableId) {
        setSelectedTimetableId(timetableData[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimetableId]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const selectedTimetable = timetables.find(t => t._id === selectedTimetableId);

  const getPeriodsForDay = () => {
    if (!selectedTimetable?.slots) return [];
    
    const daySlots = selectedTimetable.slots.filter(
      slot => slot.day?.toLowerCase() === DAYS[selectedDay].toLowerCase()
    );
    
    return daySlots.sort((a, b) => (a.period_number || 0) - (b.period_number || 0));
  };

  const formatTime = (period) => {
    if (period.start_time && period.end_time) {
      return `${period.start_time} - ${period.end_time}`;
    }
    const startHour = 8 + (period.period_number || 0);
    return `${startHour}:00 - ${startHour}:45`;
  };

  const PeriodCard = ({ period, index }) => {
    const isBreak = period.is_break || period.subject?.toLowerCase().includes('break');
    const color = PERIOD_COLORS[index % PERIOD_COLORS.length];
    
    return (
      <View style={[styles.periodCard, isBreak && styles.breakCard]}>
        <LinearGradient
          colors={isBreak ? ['rgba(253, 203, 110, 0.2)', 'rgba(253, 203, 110, 0.1)'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.periodGradient}
        >
          <View style={[styles.periodNumber, { backgroundColor: isBreak ? '#fdcb6e' : color }]}>
            <Text style={styles.periodNumberText}>{period.period_number || index + 1}</Text>
          </View>
          <View style={styles.periodDetails}>
            <Text style={styles.periodSubject}>
              {isBreak ? '☕ Break' : (period.subject_name || period.subject || 'Free Period')}
            </Text>
            {!isBreak && (
              <>
                <View style={styles.periodMeta}>
                  <Text style={styles.periodTeacher}>👨‍🏫 {period.teacher_name || period.teacher || 'TBA'}</Text>
                </View>
                {(period.room_name || period.room) && (
                  <Text style={styles.periodRoom}>📍 {period.room_name || period.room}</Text>
                )}
              </>
            )}
          </View>
          <View style={styles.periodTimeContainer}>
            <Text style={styles.periodTime}>{formatTime(period)}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const EmptyPeriodCard = ({ periodNum }) => (
    <View style={styles.periodCard}>
      <View style={styles.periodGradient}>
        <View style={[styles.periodNumber, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
          <Text style={styles.periodNumberText}>{periodNum}</Text>
        </View>
        <View style={styles.periodDetails}>
          <Text style={[styles.periodSubject, { opacity: 0.5 }]}>Free Period</Text>
          <Text style={[styles.periodTeacher, { opacity: 0.5 }]}>No class scheduled</Text>
        </View>
        <View style={styles.periodTimeContainer}>
          <Text style={styles.periodTime}>{`${7 + periodNum}:00`}</Text>
        </View>
      </View>
    </View>
  );

  const periods = getPeriodsForDay();
  const periodsPerDay = selectedTimetable?.periods_per_day || 8;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📅 TimeTable</Text>
          <View style={{ width: 40 }} />
        </View>

        {timetables.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.timetableSelector}
            contentContainerStyle={styles.timetableSelectorContent}
          >
            {timetables.map((tt, index) => (
              <TouchableOpacity
                key={tt._id || index}
                style={[
                  styles.timetableButton,
                  selectedTimetableId === tt._id && styles.timetableButtonActive
                ]}
                onPress={() => setSelectedTimetableId(tt._id)}
              >
                <Text style={[
                  styles.timetableButtonText,
                  selectedTimetableId === tt._id && styles.timetableButtonTextActive
                ]}>
                  {tt.name || `Class ${tt.class_name || index + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysContainer}
          contentContainerStyle={styles.daysContent}
        >
          {DAYS.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDay === index && styles.dayButtonActive]}
              onPress={() => setSelectedDay(index)}
            >
              <LinearGradient
                colors={selectedDay === index ? ['#00b894', '#00cec9'] : ['transparent', 'transparent']}
                style={styles.dayGradient}
              >
                <Text style={[styles.dayText, selectedDay === index && styles.dayTextActive]}>
                  {day.substring(0, 3)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00b894" />
            <Text style={styles.loadingText}>Loading timetable...</Text>
          </View>
        ) : timetables.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No timetable available</Text>
            <Text style={styles.emptySubtext}>Timetables will appear here once created</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
            }
          >
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{DAYS[selectedDay]}</Text>
              <View style={styles.periodCount}>
                <Text style={styles.periodCountText}>{periods.length} periods</Text>
              </View>
            </View>
            
            {periods.length > 0 ? (
              periods.map((period, index) => (
                <PeriodCard key={period._id || index} period={period} index={index} />
              ))
            ) : (
              Array.from({ length: periodsPerDay }, (_, i) => (
                <EmptyPeriodCard key={i} periodNum={i + 1} />
              ))
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  backButton: {
    color: '#fff',
    fontSize: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timetableSelector: {
    maxHeight: 45,
    marginBottom: 8,
  },
  timetableSelectorContent: {
    paddingHorizontal: 20,
  },
  timetableButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timetableButtonActive: {
    backgroundColor: 'rgba(0, 184, 148, 0.3)',
    borderColor: '#00b894',
  },
  timetableButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  timetableButtonTextActive: {
    color: '#00b894',
    fontWeight: '600',
  },
  daysContainer: {
    maxHeight: 55,
    marginBottom: 8,
  },
  daysContent: {
    paddingHorizontal: 20,
  },
  dayButton: {
    marginRight: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  dayText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  dayTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  periodCount: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  periodCountText: {
    color: '#00b894',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  periodCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  breakCard: {
    borderWidth: 1,
    borderColor: 'rgba(253, 203, 110, 0.3)',
  },
  periodGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  periodNumber: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  periodNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodDetails: {
    flex: 1,
  },
  periodSubject: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  periodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodTeacher: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  periodRoom: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  periodTimeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  periodTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default TimeTableScreen;

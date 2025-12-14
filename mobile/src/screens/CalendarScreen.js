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
import { calendarAPI } from '../services/api';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS = {
  holiday: '#e74c3c',
  exam: '#9b59b6',
  event: '#00b894',
  meeting: '#3498db',
  sports: '#f39c12',
  cultural: '#e91e63',
  function: '#00cec9',
  default: '#6c5ce7',
};

const EVENT_ICONS = {
  holiday: '🏖️',
  exam: '📝',
  event: '🎉',
  meeting: '👥',
  sports: '⚽',
  cultural: '🎭',
  function: '🎊',
  default: '📅',
};

const CalendarScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await calendarAPI.getEvents({ month, year });
      const eventData = response.data?.events || response.data || [];
      setEvents(eventData);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentDate]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [currentDate, fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => {
      const eventDate = new Date(e.date || e.start_date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getSelectedDateEvents = () => {
    return events.filter(e => {
      const eventDate = new Date(e.date || e.start_date);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() &&
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventColor = (event) => {
    const type = event.event_type?.toLowerCase() || event.type?.toLowerCase() || 'default';
    return EVENT_COLORS[type] || EVENT_COLORS.default;
  };

  const getEventIcon = (event) => {
    const type = event.event_type?.toLowerCase() || event.type?.toLowerCase() || 'default';
    return EVENT_ICONS[type] || EVENT_ICONS.default;
  };

  const selectedDateEvents = getSelectedDateEvents();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📆 Calendar</Text>
          <TouchableOpacity 
            style={styles.todayBtn}
            onPress={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDate(today);
            }}
          >
            <Text style={styles.todayBtnText}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavBtn}>
            <Text style={styles.monthNav}>◀</Text>
          </TouchableOpacity>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>{MONTHS[currentDate.getMonth()]}</Text>
            <Text style={styles.yearTitle}>{currentDate.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavBtn}>
            <Text style={styles.monthNav}>▶</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map((day, index) => (
            <Text key={day} style={[
              styles.weekdayText,
              index === 0 && styles.sundayText
            ]}>{day}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {getDaysInMonth().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected(day) && styles.dayCellSelected,
                  isToday(day) && !isSelected(day) && styles.dayCellToday,
                ]}
                onPress={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.dayText,
                      isSelected(day) && styles.dayTextSelected,
                      isToday(day) && !isSelected(day) && styles.dayTextToday,
                      index % 7 === 0 && styles.sundayText,
                    ]}>{day}</Text>
                    {hasEvents && (
                      <View style={styles.eventDotsContainer}>
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <View 
                            key={i} 
                            style={[styles.eventDot, { backgroundColor: getEventColor(event) }]} 
                          />
                        ))}
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {selectedDateEvents.length > 0 && (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{selectedDateEvents.length}</Text>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00b894" />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00b894" />
            </View>
          ) : selectedDateEvents.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsIcon}>📭</Text>
              <Text style={styles.noEvents}>No events on this day</Text>
            </View>
          ) : (
            selectedDateEvents.map((event, index) => (
              <View key={event._id || index} style={styles.eventCard}>
                <LinearGradient
                  colors={[`${getEventColor(event)}20`, `${getEventColor(event)}10`]}
                  style={styles.eventCardGradient}
                >
                  <View style={[styles.eventColorBar, { backgroundColor: getEventColor(event) }]} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventIcon}>{getEventIcon(event)}</Text>
                      <View style={styles.eventTitleContainer}>
                        <Text style={styles.eventTitle}>{event.title || event.name}</Text>
                        <Text style={styles.eventType}>
                          {event.event_type || event.type || 'Event'}
                        </Text>
                      </View>
                    </View>
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>
                    )}
                    <Text style={styles.eventDate}>{formatEventDate(event.date || event.start_date)}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))
          )}
          
          {!loading && events.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingTitle}>📌 Upcoming Events</Text>
              {events
                .filter(e => new Date(e.date || e.start_date) >= new Date())
                .slice(0, 5)
                .map((event, index) => (
                  <TouchableOpacity 
                    key={event._id || index} 
                    style={styles.upcomingCard}
                    onPress={() => {
                      const eventDate = new Date(event.date || event.start_date);
                      setCurrentDate(eventDate);
                      setSelectedDate(eventDate);
                    }}
                  >
                    <View style={[styles.upcomingDot, { backgroundColor: getEventColor(event) }]} />
                    <View style={styles.upcomingContent}>
                      <Text style={styles.upcomingEventTitle}>{event.title || event.name}</Text>
                      <Text style={styles.upcomingEventDate}>{formatEventDate(event.date || event.start_date)}</Text>
                    </View>
                    <Text style={styles.upcomingIcon}>{getEventIcon(event)}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
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
  todayBtn: {
    backgroundColor: 'rgba(0, 184, 148, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00b894',
  },
  todayBtnText: {
    color: '#00b894',
    fontSize: 12,
    fontWeight: '600',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  monthNav: {
    color: '#00b894',
    fontSize: 14,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  yearTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  weekdaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  sundayText: {
    color: '#e74c3c',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#00b894',
    borderRadius: 16,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#00b894',
    borderRadius: 16,
  },
  dayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextSelected: {
    fontWeight: 'bold',
  },
  dayTextToday: {
    color: '#00b894',
    fontWeight: 'bold',
  },
  eventDotsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  selectedDateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventBadge: {
    backgroundColor: '#00b894',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noEventsIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  noEvents: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventCardGradient: {
    flexDirection: 'row',
    borderRadius: 16,
  },
  eventColorBar: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  eventType: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  eventDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  eventDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  upcomingSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  upcomingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingEventTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingEventDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  upcomingIcon: {
    fontSize: 20,
  },
});

export default CalendarScreen;

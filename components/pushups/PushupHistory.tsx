// components/pushups/PushupHistory.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Animated,
  TouchableOpacity
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { usePushupStore } from '../../interfaces/pushup_store';
import Colors from '../../constants/Colors';
import { router } from 'expo-router';
import { useAllPushupEntries } from '../../hooks/usePushups';

interface PushupHistoryItemProps {
  timestamp: string;
  count: number;
  onPress: () => void;
}

const PushupHistoryItem: React.FC<PushupHistoryItemProps> = ({ 
  timestamp, 
  count, 
  onPress 
}) => {
  const formattedTime = dayjs(timestamp).format('h:mm A');
  const formattedDate = dayjs(timestamp).format('MMM D, YYYY');
  const isToday = dayjs(timestamp).isSame(dayjs(), 'day');

  return (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.historyItemLeft}>
        <Text style={styles.pushupCount}>{count}</Text>
        <Text style={styles.pushupLabel}>pushups</Text>
      </View>
      
      <View style={styles.historyItemRight}>
        <Text style={styles.timeText}>{formattedTime}</Text>
        <Text style={styles.dateText}>
          {isToday ? 'Today' : formattedDate}
        </Text>
      </View>
      
      <FontAwesome6 
        name="chevron-right" 
        size={16} 
        color={Colors.light.text.secondary} 
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const PushupHistory: React.FC = () => {
  const entries = useAllPushupEntries();

  // Sort entries by timestamp, most recent first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleItemPress = (entryId: string) => {
    router.push({
      pathname: '/add-edit-pushups',
      params: { id: entryId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>History</Text>
      
      <FlatList
        data={sortedEntries}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PushupHistoryItem
            timestamp={item.timestamp}
            count={item.count}
            onPress={() => handleItemPress(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <FontAwesome6 
              name="list" 
              size={24} 
              color={Colors.light.text.secondary} 
            />
            <Text style={styles.emptyStateText}>
              No pushups recorded yet
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shared.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  pushupCount: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  pushupLabel: {
    fontSize: 12,
    color: Colors.light.text.secondary,
  },
  timeText: {
    fontSize: 16,
    color: Colors.light.text.primary,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.text.secondary,
  },
  chevron: {
    marginLeft: 4,
  },
  separator: {
    height: 12,
  },
  listContent: {
    paddingBottom: 100, // Extra padding for FAB
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    opacity: 0.5,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.light.text.secondary,
  },
});

export default PushupHistory;
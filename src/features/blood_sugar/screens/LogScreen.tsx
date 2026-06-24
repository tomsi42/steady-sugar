import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { Text, FAB, Snackbar, Portal, Modal, List, Divider } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../../../app/navigation';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { LogEntry } from '../../../shared/types/logEntry';
import { entryTimestamp } from '../../../shared/types/logEntry';
import { groupEntriesByDate, type GroupedEntries, type DateGroupLabel } from '../../../shared/utils/groupEntriesByDate';
import { useBloodSugarStore } from '../store';
import { useFoodLogStore } from '../../food_log/store';
import { useWeightStore } from '../../weight/store';
import { BloodSugarCard } from '../components/BloodSugarCard';
import { FoodCard } from '../../food_log/components/FoodCard';
import { WeightCard } from '../../weight/components/WeightCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Log'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SECTION_TITLE_KEYS: Record<DateGroupLabel, string> = {
  Today: 'log.today',
  Yesterday: 'log.yesterday',
  'This Week': 'log.this_week',
  'Last Week': 'log.last_week',
  Older: 'log.older',
};

export function LogScreen({ navigation }: Props) {
  const { t } = useTranslation();

  const readings = useBloodSugarStore((s) => s.readings);
  const bloodSugarLoad = useBloodSugarStore((s) => s.load);
  const bloodSugarRemove = useBloodSugarStore((s) => s.remove);
  const bloodSugarRestore = useBloodSugarStore((s) => s.restore);

  const foodEntries = useFoodLogStore((s) => s.entries);
  const foodLoad = useFoodLogStore((s) => s.load);
  const foodRemove = useFoodLogStore((s) => s.remove);
  const foodRestore = useFoodLogStore((s) => s.restore);

  const weightEntries = useWeightStore((s) => s.entries);
  const weightLoad = useWeightStore((s) => s.load);
  const weightRemove = useWeightStore((s) => s.remove);
  const weightRestore = useWeightStore((s) => s.restore);

  const [fabOpen, setFabOpen] = useState(false);
  const [deletedEntry, setDeletedEntry] = useState<LogEntry | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  useEffect(() => {
    bloodSugarLoad();
    foodLoad();
    weightLoad();
  }, [bloodSugarLoad, foodLoad, weightLoad]);

  const allEntries: LogEntry[] = [
    ...readings.map((r): LogEntry => ({ type: 'blood_sugar', data: r })),
    ...foodEntries.map((e): LogEntry => ({ type: 'food', data: e })),
    ...weightEntries.map((w): LogEntry => ({ type: 'weight', data: w })),
  ].sort((a, b) => entryTimestamp(b).getTime() - entryTimestamp(a).getTime());

  const groups: GroupedEntries[] = groupEntriesByDate(allEntries);

  function entryKey(entry: LogEntry): string {
    return `${entry.type}-${entry.data.id}`;
  }

  function handleEdit(entry: LogEntry) {
    if (entry.type === 'blood_sugar') {
      navigation.navigate('BloodSugarForm', { readingId: entry.data.id });
    } else if (entry.type === 'food') {
      navigation.navigate('FoodForm', { entryId: entry.data.id });
    } else {
      navigation.navigate('WeightForm', { entryId: entry.data.id });
    }
  }

  function handleDelete(entry: LogEntry) {
    if (entry.type === 'blood_sugar') {
      bloodSugarRemove(entry.data.id);
    } else if (entry.type === 'food') {
      foodRemove(entry.data.id);
    } else {
      weightRemove(entry.data.id);
    }
    setDeletedEntry(entry);
    setSnackbarVisible(true);
  }

  function handleUndo() {
    if (deletedEntry) {
      if (deletedEntry.type === 'blood_sugar') {
        const d = deletedEntry.data;
        bloodSugarRestore({
          valueMmol: d.valueMmol,
          timestamp: d.timestamp,
          context: d.context,
          notes: d.notes,
        });
      } else if (deletedEntry.type === 'food') {
        const d = deletedEntry.data;
        foodRestore({ name: d.name, category: d.category, timestamp: d.timestamp });
      } else {
        const d = deletedEntry.data;
        weightRestore({ valueKg: d.valueKg, timestamp: d.timestamp, notes: d.notes });
      }
      setDeletedEntry(null);
    }
    setSnackbarVisible(false);
  }

  function renderRightActions(entry: LogEntry) {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(entry)}
        testID={`delete-action-${entryKey(entry)}`}
      >
        <Text style={styles.deleteActionText}>{t('log.delete')}</Text>
      </TouchableOpacity>
    );
  }

  function renderItem({ item }: { item: LogEntry }) {
    const key = entryKey(item);
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(key, ref);
          else swipeableRefs.current.delete(key);
        }}
        renderRightActions={() => renderRightActions(item)}
        onSwipeableOpen={() => {
          swipeableRefs.current.forEach((sw, k) => {
            if (k !== key) sw.close();
          });
        }}
      >
        {item.type === 'blood_sugar' ? (
          <BloodSugarCard reading={item.data} onPress={() => handleEdit(item)} />
        ) : item.type === 'food' ? (
          <FoodCard entry={item.data} onPress={() => handleEdit(item)} />
        ) : (
          <WeightCard entry={item.data} onPress={() => handleEdit(item)} />
        )}
      </Swipeable>
    );
  }

  function renderSectionHeader({ section }: { section: GroupedEntries }) {
    return (
      <View style={styles.sectionHeader}>
        <Text variant="titleSmall" style={styles.sectionHeaderText}>
          {t(SECTION_TITLE_KEYS[section.title])}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {allEntries.length === 0 ? (
        <View style={styles.emptyContainer} testID="empty-state">
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('log.empty_title')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            {t('log.empty_subtitle')}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groups}
          keyExtractor={(item) => entryKey(item)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
          testID="entries-list"
        />
      )}

      <Portal>
        <Modal
          visible={fabOpen}
          onDismiss={() => setFabOpen(false)}
          contentContainerStyle={styles.modal}
          testID="fab-modal"
        >
          <List.Item
            title={t('log.fab_blood_sugar')}
            description={t('log.fab_blood_sugar_desc')}
            left={(props) => <List.Icon {...props} icon="water" color="#E53935" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('BloodSugarForm', {});
            }}
            testID="fab-option-blood-sugar"
          />
          <Divider />
          <List.Item
            title={t('log.fab_food')}
            description={t('food.fab_desc')}
            left={(props) => <List.Icon {...props} icon="food" color="#26A69A" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('FoodForm', {});
            }}
            testID="fab-option-food"
          />
          <Divider />
          <List.Item
            title={t('log.fab_weight')}
            description={t('weight.fab_desc')}
            left={(props) => <List.Icon {...props} icon="scale" color="#5C6BC0" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('WeightForm', {});
            }}
            testID="fab-option-weight"
          />
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setFabOpen(true)}
        testID="fab-button"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{ label: t('log.undo'), onPress: handleUndo }}
        testID="delete-snackbar"
      >
        {t('log.deleted')}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listContent: { paddingBottom: 88 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#212121', marginBottom: 8 },
  emptySubtext: { color: '#757575', textAlign: 'center' },
  sectionHeader: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  sectionHeaderText: { color: '#757575', textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteAction: {
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionText: { color: '#FFFFFF', fontWeight: '600' },
  modal: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledText: { color: '#BDBDBD' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

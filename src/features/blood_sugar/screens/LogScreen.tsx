import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { Text, FAB, Snackbar, Portal, Modal, List, Divider } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../../../app/navigation';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { BloodSugarReading } from '../../../shared/database/schema';
import { useBloodSugarStore } from '../store';
import { BloodSugarCard } from '../components/BloodSugarCard';
import { groupReadingsByDate, type GroupedReadings } from '../utils/groupReadingsByDate';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Log'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function LogScreen({ navigation }: Props) {
  const readings = useBloodSugarStore((s) => s.readings);
  const load = useBloodSugarStore((s) => s.load);
  const remove = useBloodSugarStore((s) => s.remove);
  const restore = useBloodSugarStore((s) => s.restore);

  const [fabOpen, setFabOpen] = useState(false);
  const [deletedReading, setDeletedReading] = useState<BloodSugarReading | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  useEffect(() => {
    load();
  }, [load]);

  const groups: GroupedReadings[] = groupReadingsByDate(readings);

  function handleEdit(reading: BloodSugarReading) {
    navigation.navigate('BloodSugarForm', { readingId: reading.id });
  }

  function handleDelete(reading: BloodSugarReading) {
    remove(reading.id);
    setDeletedReading(reading);
    setSnackbarVisible(true);
  }

  function handleUndo() {
    if (deletedReading) {
      restore({
        valueMmol: deletedReading.valueMmol,
        timestamp: deletedReading.timestamp,
        context: deletedReading.context,
        notes: deletedReading.notes,
      });
      setDeletedReading(null);
    }
    setSnackbarVisible(false);
  }

  function renderRightActions(reading: BloodSugarReading) {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(reading)}
        testID={`delete-action-${reading.id}`}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  }

  function renderItem({ item }: { item: BloodSugarReading }) {
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeableRefs.current.set(item.id, ref);
          else swipeableRefs.current.delete(item.id);
        }}
        renderRightActions={() => renderRightActions(item)}
        onSwipeableOpen={() => {
          // Close other open swipeables
          swipeableRefs.current.forEach((sw, id) => {
            if (id !== item.id) sw.close();
          });
        }}
      >
        <BloodSugarCard reading={item} onPress={() => handleEdit(item)} />
      </Swipeable>
    );
  }

  function renderSectionHeader({ section }: { section: GroupedReadings }) {
    return (
      <View style={styles.sectionHeader}>
        <Text variant="titleSmall" style={styles.sectionHeaderText}>
          {section.title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {readings.length === 0 ? (
        <View style={styles.emptyContainer} testID="empty-state">
          <Text variant="bodyLarge" style={styles.emptyText}>
            No data yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap + to log your first reading
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groups}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
          testID="readings-list"
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
            title="Blood Sugar"
            description="Log a blood sugar reading"
            left={(props) => <List.Icon {...props} icon="water" color="#E53935" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('BloodSugarForm', {});
            }}
            testID="fab-option-blood-sugar"
          />
          <Divider />
          <List.Item
            title="Food / Drink"
            description="Coming soon"
            left={(props) => <List.Icon {...props} icon="food" color="#BDBDBD" />}
            titleStyle={styles.disabledText}
            descriptionStyle={styles.disabledText}
            testID="fab-option-food"
          />
          <Divider />
          <List.Item
            title="Weight"
            description="Coming soon"
            left={(props) => <List.Icon {...props} icon="scale" color="#BDBDBD" />}
            titleStyle={styles.disabledText}
            descriptionStyle={styles.disabledText}
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
        action={{ label: 'Undo', onPress: handleUndo }}
        testID="delete-snackbar"
      >
        Reading deleted
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

import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { collectorService } from '../../src/services/collectorService';

export default function AvailablePickupsScreen() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Complete modal state
  const [activePickup, setActivePickup] = useState<any>(null);
  const [actualWeight, setActualWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPickups = async () => {
    try {
      const res = await collectorService.getAvailablePickups();
      setPickups(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleAccept = async (pickupId: string) => {
    try {
      await collectorService.acceptPickup(pickupId);
      Alert.alert('Accepted', 'You have accepted this pickup! The seller has been notified.');
      loadPickups();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to accept pickup.');
    }
  };

  const handleComplete = async () => {
    if (!actualWeight || Number(actualWeight) <= 0) {
      Alert.alert('Required', 'Please enter a valid measured weight in kg.');
      return;
    }
    setSubmitting(true);
    try {
      await collectorService.completePickup(
        activePickup.id,
        Number(actualWeight),
        notes.trim()
      );
      Alert.alert('Completed', 'Pickup confirmed and lot added to your inventory!');
      setActivePickup(null);
      setActualWeight('');
      setNotes('');
      loadPickups();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to complete pickup.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Scanning nearby pickup requests..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPickups(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Available Pickups"
            description="There are currently no unassigned scrap pickup requests in your area."
          />
        }
        renderItem={({ item }) => {
          const listing = item.listing || {};
          const isAccepted = item.status === 'ACCEPTED' || item.status === 'SCHEDULED';

          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleInfo}>
                  <Text style={styles.itemTitle}>{listing.title || 'Scrap Item'}</Text>
                  <Text style={styles.category}>{listing.material_category || 'E-Waste'}</Text>
                </View>
                <Badge label={item.status} status={item.status} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  Est. Weight: <Text style={styles.bold}>{listing.estimated_weight_kg || item.actual_weight_kg || '—'} kg</Text>
                </Text>
                <Text style={styles.infoText}>
                  Expected: <Text style={styles.bold}>₹{listing.price_expectation || 'Open'}</Text>
                </Text>
              </View>

              <Text style={styles.addressText}>📍 {item.pickup_address}</Text>

              <View style={styles.btnRow}>
                {item.status === 'REQUESTED' && (
                  <Button
                    title="Accept Pickup"
                    onPress={() => handleAccept(item.id)}
                    size="small"
                    style={styles.actionBtn}
                  />
                )}
                {isAccepted && (
                  <Button
                    title="Complete & Record Weight"
                    variant="secondary"
                    onPress={() => setActivePickup(item)}
                    size="small"
                    style={styles.actionBtn}
                  />
                )}
              </View>
            </Card>
          );
        }}
      />

      {/* Complete Modal */}
      <Modal visible={!!activePickup} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Collection Weight</Text>
            <Text style={styles.modalSub}>
              Enter the actual verified weight collected to finalize handover.
            </Text>

            <Input
              label="Actual Measured Weight (kg) *"
              placeholder="e.g. 14.5"
              value={actualWeight}
              onChangeText={setActualWeight}
              keyboardType="numeric"
            />

            <Input
              label="Collection Notes"
              placeholder="e.g. Tested item, cables included"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setActivePickup(null)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Confirm & Save"
                onPress={handleComplete}
                loading={submitting}
                style={styles.modalHalfBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  category: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: Colors.text,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text,
    marginVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  actionBtn: {
    minWidth: 140,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 4,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalHalfBtn: {
    flex: 1,
  },
});


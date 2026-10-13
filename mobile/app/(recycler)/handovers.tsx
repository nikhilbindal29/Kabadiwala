import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { recyclerService } from '../../src/services/recyclerService';

export default function RecyclerHandoversScreen() {
  const [handovers, setHandovers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Confirmation modal
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [verifiedWeight, setVerifiedWeight] = useState('');
  const [condition, setCondition] = useState('Authorized Recyclable');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHandovers = async () => {
    try {
      const res = await recyclerService.getDashboard();
      setHandovers(res?.recent_handovers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHandovers();
  }, []);

  const handleConfirmHandover = async () => {
    if (!verifiedWeight || Number(verifiedWeight) <= 0) {
      Alert.alert('Required', 'Please enter the verified facility weighbridge weight.');
      return;
    }
    setSubmitting(true);
    try {
      await recyclerService.confirmHandover(activeOrder.order_id || activeOrder.id, {
        actual_weight_kg: Number(verifiedWeight),
        condition,
        notes: notes.trim(),
      });
      Alert.alert('Confirmed', 'Handover receipt generated and recycling record logged.');
      setActiveOrder(null);
      setVerifiedWeight('');
      loadHandovers();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to confirm handover.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading incoming handover manifests..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={handovers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHandovers(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Inbound Handovers"
            description="Accepted purchase orders awaiting facility receipt will be tracked here."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderTitle}>Manifest #{item.id.slice(0, 8)}</Text>
              <Badge label={item.status} status={item.status} />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                Recorded Weight: <Text style={styles.bold}>{item.weight_kg || '—'} kg</Text>
              </Text>
              <Text style={styles.detailText}>
                Condition: <Text style={styles.bold}>{item.condition || 'Sorted'}</Text>
              </Text>
            </View>

            {item.status !== 'COMPLETED' ? (
              <Button
                title="Verify Weight & Confirm Handover"
                size="small"
                onPress={() => {
                  setActiveOrder(item);
                  setVerifiedWeight(String(item.weight_kg || ''));
                }}
                style={styles.actionBtn}
              />
            ) : (
              <Text style={styles.completedNote}>
                ✓ Form 6 Handover Certificate Logged
              </Text>
            )}
          </Card>
        )}
      />

      <Modal visible={!!activeOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Material Handover</Text>
            <Text style={styles.modalSub}>
              Verify received weight at your recycling facility weighbridge.
            </Text>

            <Input
              label="Verified Facility Weight (kg) *"
              placeholder="e.g. 52.4"
              value={verifiedWeight}
              onChangeText={setVerifiedWeight}
              keyboardType="numeric"
            />

            <Input
              label="Material Condition"
              value={condition}
              onChangeText={setCondition}
            />

            <Input
              label="Weighbridge / Inspector Notes"
              placeholder="e.g. Verified by Gate 2 scale"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setActiveOrder(null)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Confirm & Log"
                onPress={handleConfirmHandover}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: Colors.text,
  },
  actionBtn: {
    marginTop: 10,
  },
  completedNote: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
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


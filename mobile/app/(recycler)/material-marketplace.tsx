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
import { recyclerService } from '../../src/services/recyclerService';

export default function RecyclerMaterialMarketplaceScreen() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Bid modal
  const [selectedLot, setSelectedLot] = useState<any>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMaterials = async () => {
    try {
      const res = await recyclerService.browseMaterials();
      setMaterials(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleOpenBid = (lot: any) => {
    setSelectedLot(lot);
    setOfferPrice(String(lot.asking_price || ''));
  };

  const handleSubmitOffer = async () => {
    if (!offerPrice || Number(offerPrice) <= 0) {
      Alert.alert('Required', 'Please enter a valid purchase price.');
      return;
    }
    setSubmitting(true);
    try {
      await recyclerService.submitOffer({
        lot_id: selectedLot.id,
        offer_price: Number(offerPrice),
        quantity: Number(selectedLot.quantity) || Number(selectedLot.weight_kg) || 1,
        notes: notes.trim(),
      });
      Alert.alert('Offer Placed', 'Recycler purchase offer dispatched to aggregator.');
      setSelectedLot(null);
      setNotes('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Scanning compliant material streams..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMaterials(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Sourcing Streams Available"
            description="Aggregators have not posted material streams in this region yet."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleInfo}>
                <Text style={styles.title}>{item.material_category}</Text>
                {!!item.subcategory && (
                  <Text style={styles.sub}>{item.subcategory}</Text>
                )}
              </View>
              <Badge label={`Grade ${item.grade || 'A'}`} status="ACTIVE" />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Weight: <Text style={styles.bold}>{item.weight_kg} kg</Text>
              </Text>
              <Text style={styles.metaText}>
                Asking: <Text style={styles.bold}>₹{item.asking_price}</Text>
              </Text>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.location}>📍 {item.city || 'India'}</Text>
              <Button
                title="Submit Recycler Bid"
                size="small"
                onPress={() => handleOpenBid(item)}
              />
            </View>
          </Card>
        )}
      />

      <Modal visible={!!selectedLot} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Facility Purchase Offer</Text>
            <Text style={styles.modalSub}>
              Lot: {selectedLot?.material_category} • {selectedLot?.weight_kg} kg
            </Text>

            <Input
              label="Offered Price (₹) *"
              placeholder="e.g. 24000"
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
            />

            <Input
              label="Compliance / Manifest Terms"
              placeholder="e.g. Form 6 manifest required upon delivery"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalBtns}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setSelectedLot(null)}
                style={styles.modalHalfBtn}
              />
              <Button
                title="Submit Bid"
                onPress={handleSubmitOffer}
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
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  sub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  metaText: {
    fontSize: 13,
    color: Colors.text,
  },
  bold: {
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
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


import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { collectorService } from '../../src/services/collectorService';

export default function OfferComparisonScreen() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOffers = async () => {
    try {
      const res = await collectorService.getOffers();
      setOffers(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleAccept = async (offerId: string) => {
    try {
      await collectorService.acceptOffer(offerId);
      Alert.alert('Accepted', 'Offer accepted! Order created and inventory reserved.');
      loadOffers();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to accept offer.');
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      await collectorService.rejectOffer(offerId);
      Alert.alert('Rejected', 'Offer has been declined.');
      loadOffers();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to reject offer.');
    }
  };

  if (loading) return <LoadingSpinner message="Calculating offer proceeds & logistics..." />;

  return (
    <View style={styles.container}>
      <View style={styles.infoBanner}>
        <Text style={styles.infoTitle}>Net Proceeds Comparison</Text>
        <Text style={styles.infoSub}>
          Evaluated as Gross Offer minus Estimated Transport Logistics. The highest gross offer is not always the most profitable.
        </Text>
      </View>

      <FlatList
        data={offers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOffers(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Incoming Offers"
            description="Buyers have not submitted offers on your inventory lots yet."
          />
        }
        renderItem={({ item }) => {
          const gross = Number(item.offer_price) || 0;
          const transport = Number(item.transport_cost_estimate) || 0;
          const netProceeds = Math.max(0, gross - transport);
          const isPending = item.status === 'PENDING';

          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.lotTitle}>
                    Lot #{item.lot_id ? item.lot_id.slice(0, 8) : 'General'}
                  </Text>
                  <Text style={styles.lotSub}>
                    Quantity: {item.quantity} {item.unit || 'kg'}
                  </Text>
                </View>
                <Badge label={item.status} status={item.status} />
              </View>

              {/* Multi-buyer price breakdown */}
              <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.bLabel}>Gross Offer:</Text>
                  <Text style={styles.bVal}>₹{gross}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.bLabel}>Est. Transport Cost:</Text>
                  <Text style={styles.bMinus}>- ₹{transport}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.netRow]}>
                  <Text style={styles.netLabel}>Estimated Net Proceeds:</Text>
                  <Text style={styles.netVal}>₹{netProceeds}</Text>
                </View>
              </View>

              {!!item.notes && (
                <Text style={styles.notesText}>Buyer Note: "{item.notes}"</Text>
              )}

              {isPending && (
                <View style={styles.btnRow}>
                  <Button
                    title="Decline"
                    variant="outline"
                    size="small"
                    onPress={() => handleReject(item.id)}
                    style={styles.halfBtn}
                  />
                  <Button
                    title="Accept Offer"
                    size="small"
                    onPress={() => handleAccept(item.id)}
                    style={styles.halfBtn}
                  />
                </View>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  infoBanner: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryLight,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  infoSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  lotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  lotSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  breakdownBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  bMinus: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
  },
  netRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  netLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  netVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  halfBtn: {
    flex: 1,
  },
});


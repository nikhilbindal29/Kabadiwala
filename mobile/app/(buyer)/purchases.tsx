import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { buyerService } from '../../src/services/buyerService';

export default function BuyerPurchasesScreen() {
  const [activeTab, setActiveTab] = useState<'OFFERS' | 'ORDERS'>('ORDERS');
  const [offers, setOffers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [offersRes, ordersRes] = await Promise.all([
        buyerService.getMyOffers(),
        buyerService.getMyPurchases(),
      ]);
      setOffers(offersRes || []);
      setOrders(ordersRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdraw = async (offerId: string) => {
    try {
      await buyerService.withdrawOffer(offerId);
      Alert.alert('Withdrawn', 'Offer has been cancelled.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to withdraw offer.');
    }
  };

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      await buyerService.confirmPurchase(orderId);
      Alert.alert('Completed', 'Material delivery verified. Transaction settled.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to confirm delivery.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your purchases and offers..." />;

  return (
    <View style={styles.container}>
      {/* Switcher Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ORDERS' && styles.tabActive]}
          onPress={() => setActiveTab('ORDERS')}
        >
          <Text style={[styles.tabText, activeTab === 'ORDERS' && styles.tabTextActive]}>
            Purchases & Orders ({orders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'OFFERS' && styles.tabActive]}
          onPress={() => setActiveTab('OFFERS')}
        >
          <Text style={[styles.tabText, activeTab === 'OFFERS' && styles.tabTextActive]}>
            Submitted Offers ({offers.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ORDERS' ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Purchases Yet"
              description="Accepted offers will appear here as confirmed purchase orders."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderTitle}>Order #{item.id.slice(0, 8)}</Text>
                <Badge label={item.status} status={item.status} />
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Settlement Amount:</Text>
                <Text style={styles.priceVal}>₹{item.agreed_price}</Text>
              </View>

              <Text style={styles.detailText}>
                Quantity: <Text style={styles.bold}>{item.quantity} {item.unit}</Text>
              </Text>

              {item.status === 'CONFIRMED' && (
                <Button
                  title="Confirm Material Received"
                  size="small"
                  onPress={() => handleConfirmReceipt(item.id)}
                  style={styles.confirmBtn}
                />
              )}
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Submitted Offers"
              description="You have not placed any bids on material lots."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderTitle}>Offer on Lot #{item.lot_id.slice(0, 8)}</Text>
                <Badge label={item.status} status={item.status} />
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Offered Price:</Text>
                <Text style={styles.priceVal}>₹{item.offer_price}</Text>
              </View>

              <Text style={styles.detailText}>
                Bid Quantity: <Text style={styles.bold}>{item.quantity} {item.unit || 'kg'}</Text>
              </Text>

              {item.status === 'PENDING' && (
                <Button
                  title="Withdraw Offer"
                  variant="outline"
                  size="small"
                  onPress={() => handleWithdraw(item.id)}
                  style={styles.withdrawBtn}
                />
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
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
    marginBottom: 10,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text,
    marginVertical: 4,
  },
  bold: {
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: 10,
  },
  withdrawBtn: {
    marginTop: 10,
    borderColor: Colors.error,
  },
});


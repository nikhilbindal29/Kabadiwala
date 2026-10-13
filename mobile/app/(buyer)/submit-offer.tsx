import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { buyerService } from '../../src/services/buyerService';

export default function SubmitOfferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [lotId, setLotId] = useState(String(params.lotId || ''));
  const [offerPrice, setOfferPrice] = useState(String(params.askingPrice || ''));
  const [quantity, setQuantity] = useState(String(params.weight || '1'));
  const [transportCost, setTransportCost] = useState('0');
  const [validDays, setValidDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!lotId.trim() || !offerPrice || !quantity) {
      Alert.alert('Required', 'Please specify lot ID, offer price and quantity.');
      return;
    }

    setLoading(true);
    try {
      const validUntil = new Date(Date.now() + Number(validDays) * 86400000).toISOString();
      await buyerService.submitOffer({
        lot_id: lotId.trim(),
        offer_price: Number(offerPrice),
        quantity: Number(quantity),
        transport_cost_estimate: Number(transportCost) || 0,
        valid_until: validUntil,
        notes: notes.trim(),
      });

      Alert.alert('Offer Submitted!', 'The collector has been notified and can review your bid.', [
        { text: 'View Purchases', onPress: () => router.replace('/(buyer)/purchases') },
      ]);
    } catch (err: any) {
      Alert.alert('Submission Error', err.response?.data?.detail || 'Failed to submit offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Submit Bulk Purchase Offer</Text>
        <Text style={styles.sub}>
          Enter your offer price, estimated transport deduction, and validity period.
        </Text>

        <Input
          label="Target Inventory Lot ID *"
          placeholder="Paste or enter lot ID"
          value={lotId}
          onChangeText={setLotId}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Offered Price (₹) *"
              placeholder="e.g. 14000"
              value={offerPrice}
              onChangeText={setOfferPrice}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Quantity (kg) *"
              placeholder="e.g. 50"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Estimated Transport Logistics Cost (₹)"
          placeholder="e.g. 800"
          value={transportCost}
          onChangeText={setTransportCost}
          keyboardType="numeric"
        />

        <Input
          label="Offer Validity (Days)"
          placeholder="e.g. 7"
          value={validDays}
          onChangeText={setValidDays}
          keyboardType="numeric"
        />

        <Input
          label="Notes / Delivery Terms"
          placeholder="e.g. Pickup via our own tempo within 48h of acceptance"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Card style={styles.calcCard}>
          <Text style={styles.calcTitle}>Offer Summary</Text>
          <Text style={styles.calcRow}>
            Total Bid: <Text style={styles.bold}>₹{Number(offerPrice) || 0}</Text>
          </Text>
          <Text style={styles.calcRow}>
            Est. Transport: <Text style={styles.bold}>₹{Number(transportCost) || 0}</Text>
          </Text>
          <Text style={[styles.calcRow, styles.netHighlight]}>
            Est. Collector Net: ₹{Math.max(0, (Number(offerPrice) || 0) - (Number(transportCost) || 0))}
          </Text>
        </Card>

        <Button
          title="Submit Offer"
          onPress={handleSubmit}
          loading={loading}
          size="large"
          style={styles.btn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    marginTop: 4,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  calcCard: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    marginVertical: 12,
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  calcRow: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: Colors.text,
  },
  netHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  btn: {
    marginTop: 10,
    marginBottom: 30,
  },
});


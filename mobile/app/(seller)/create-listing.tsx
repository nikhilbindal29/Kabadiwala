import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Colors } from '../../src/constants/colors';
import { sellerService } from '../../src/services/sellerService';
import { adminService } from '../../src/services/adminService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('cat_electronics');
  const [title, setTitle] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [priceExpectation, setPriceExpectation] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [requestPickup, setRequestPickup] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminService.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        setSelectedCategory(cats[0].id);
      }
    }).catch(console.error);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !estimatedWeight) {
      Alert.alert('Required Fields', 'Please provide an item title and estimated weight.');
      return;
    }

    setLoading(true);
    try {
      await sellerService.createListing({
        title: title.trim(),
        material_category: selectedCategory,
        subcategory: subcategory.trim(),
        description: description.trim(),
        condition,
        quantity: Number(quantity) || 1,
        unit,
        estimated_weight_kg: Number(estimatedWeight) || 0,
        price_expectation: Number(priceExpectation) || 0,
        pickup_address: pickupAddress.trim(),
        city: city.trim(),
        request_pickup: requestPickup,
        status: 'ACTIVE',
      });

      Alert.alert('Success', 'Your e-waste listing is live!', [
        { text: 'View Listings', onPress: () => router.replace('/(seller)/listings') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>List E-Waste Item</Text>
        <Text style={styles.headerSub}>Provide details to connect with collectors & buyers</Text>

        <Input
          label="Item Title *"
          placeholder="e.g. Old Dell Laptop, CRT Monitor, Copper Wires"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Picker */}
        <Text style={styles.fieldLabel}>Material Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catText, isSelected && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Subcategory / Device Type"
          placeholder="e.g. Laptop, Smartphone, Inverter Battery"
          value={subcategory}
          onChangeText={setSubcategory}
        />

        {/* Condition Picker */}
        <Text style={styles.fieldLabel}>Item Condition</Text>
        <View style={styles.conditionRow}>
          {['Excellent', 'Good', 'Fair', 'Poor'].map((c) => {
            const isSelected = condition === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.condChip, isSelected && styles.condChipActive]}
                onPress={() => setCondition(c)}
              >
                <Text style={[styles.condText, isSelected && styles.condTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Unit"
              value={unit}
              onChangeText={setUnit}
              placeholder="pieces, kg, sets"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Weight (kg) *"
              placeholder="e.g. 2.5"
              value={estimatedWeight}
              onChangeText={setEstimatedWeight}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Expected Price (₹)"
              placeholder="e.g. 500"
              value={priceExpectation}
              onChangeText={setPriceExpectation}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Input
          label="Description / Details"
          placeholder="e.g. Non-working power supply, battery holds no charge"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        {/* Pickup Logistics */}
        <Card style={styles.logisticsCard}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Request Home/Office Pickup</Text>
            <Switch
              value={requestPickup}
              onValueChange={setRequestPickup}
              trackColor={{ false: '#767577', true: Colors.primaryLight }}
              thumbColor={requestPickup ? Colors.primary : '#f4f3f4'}
            />
          </View>
          {requestPickup && (
            <>
              <Input
                label="Pickup Address"
                placeholder="Building name, Street address"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
              <Input
                label="City"
                placeholder="e.g. Mumbai"
                value={city}
                onChangeText={setCity}
              />
            </>
          )}
        </Card>

        <Button
          title="Publish Listing"
          onPress={handleSubmit}
          loading={loading}
          size="large"
          style={styles.submitBtn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catText: {
    fontSize: 13,
    color: Colors.text,
  },
  catTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  condChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  condChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  condText: {
    fontSize: 13,
    color: Colors.text,
  },
  condTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  logisticsCard: {
    marginVertical: 12,
    padding: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 30,
  },
});


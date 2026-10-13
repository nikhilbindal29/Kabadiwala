import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../src/components/ui/ScreenWrapper';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Colors } from '../../src/constants/colors';
import { collectorService } from '../../src/services/collectorService';
import { adminService } from '../../src/services/adminService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CreateLotScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('cat_electronics');
  const [subcategory, setSubcategory] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState('Sorted');
  const [grade, setGrade] = useState('A');
  const [askingPrice, setAskingPrice] = useState('');
  const [city, setCity] = useState(user?.city || 'Mumbai');
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
    if (!weightKg || !askingPrice) {
      Alert.alert('Required Fields', 'Please enter weight in kg and asking price.');
      return;
    }

    setLoading(true);
    try {
      await collectorService.createLot({
        material_category: selectedCategory,
        subcategory: subcategory.trim(),
        weight_kg: Number(weightKg),
        quantity: Number(quantity) || 1,
        condition,
        grade,
        asking_price: Number(askingPrice),
        city: city.trim(),
        status: 'ACTIVE',
      });

      Alert.alert('Success', 'Inventory lot created and published for buyers!', [
        { text: 'View Inventory', onPress: () => router.replace('/(collector)/inventory') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to create lot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Create Material Lot</Text>
        <Text style={styles.headerSub}>
          Bundle sorted recyclables into an inventory lot for bulk buyers & recyclers
        </Text>

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
          label="Subcategory / Stream"
          placeholder="e.g. Copper Wiring, Disassembled PCBs, Lithium Batteries"
          value={subcategory}
          onChangeText={setSubcategory}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Input
              label="Weight (kg) *"
              placeholder="e.g. 50"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.half}>
            <Input
              label="Asking Price (₹) *"
              placeholder="e.g. 15000"
              value={askingPrice}
              onChangeText={setAskingPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Grade Selection */}
        <Text style={styles.fieldLabel}>Material Grade</Text>
        <View style={styles.gradeRow}>
          {['A', 'B', 'C', 'Mixed'].map((g) => {
            const isSelected = grade === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.gradeChip, isSelected && styles.gradeChipActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[styles.gradeText, isSelected && styles.gradeTextActive]}>
                  Grade {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Condition Note"
          placeholder="e.g. Dry, de-soldered, sorted by purity"
          value={condition}
          onChangeText={setCondition}
        />

        <Input
          label="Storage City / Location"
          placeholder="e.g. Mumbai"
          value={city}
          onChangeText={setCity}
        />

        <Button
          title="Publish Inventory Lot"
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  gradeChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  gradeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gradeText: {
    fontSize: 13,
    color: Colors.text,
  },
  gradeTextActive: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 16,
    marginBottom: 30,
  },
});


import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../src/components/ui/ScreenWrapper';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/contexts/AuthContext';

export default function SelectRoleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'SELLER');

  const handleProceed = () => {
    switch (selectedRole.toUpperCase()) {
      case 'SELLER':
        router.replace('/(seller)/dashboard');
        break;
      case 'COLLECTOR':
        router.replace('/(collector)/dashboard');
        break;
      case 'BUYER':
        router.replace('/(buyer)/dashboard');
        break;
      case 'RECYCLER':
        router.replace('/(recycler)/dashboard');
        break;
      case 'ADMIN':
        router.replace('/(admin)/dashboard');
        break;
      default:
        router.replace('/(seller)/dashboard');
        break;
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Active Portal</Text>
          <Text style={styles.subtitle}>Choose which workspace you want to enter</Text>
        </View>

        {[
          { id: 'SELLER', name: 'Seller Workspace', desc: 'Manage your e-waste listings and pickups', icon: 'home-outline' as const },
          { id: 'COLLECTOR', name: 'Kabadiwala Workspace', desc: 'Accept collections and manage inventory', icon: 'bicycle-outline' as const },
          { id: 'BUYER', name: 'Bulk Buyer Workspace', desc: 'Browse lots, make offers and purchases', icon: 'cart-outline' as const },
          { id: 'RECYCLER', name: 'Recycler Workspace', desc: 'Compliance tracking and material sourcing', icon: 'sync-outline' as const },
        ].map((item) => {
          const isSelected = selectedRole === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => setSelectedRole(item.id)}
            >
              <Card style={[styles.card, isSelected && styles.cardSelected]}>
                <Ionicons
                  name={item.icon}
                  size={32}
                  color={isSelected ? Colors.primary : Colors.textSecondary}
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.name, isSelected && styles.nameSelected]}>
                    {item.name}
                  </Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Button
          title="Enter Workspace"
          onPress={handleProceed}
          size="large"
          style={styles.btn}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F4FAF6',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  nameSelected: {
    color: Colors.primaryDark,
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btn: {
    marginTop: 16,
  },
});


import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../src/components/ui/ScreenWrapper';
import { Input } from '../src/components/ui/Input';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/contexts/AuthContext';

const ROLES = [
  { id: 'SELLER', title: 'Waste Seller', desc: 'Household or business scrap pickup' },
  { id: 'COLLECTOR', title: 'Kabadiwala', desc: 'Local aggregator & scrap collector' },
  { id: 'BUYER', title: 'Bulk Buyer', desc: 'Refurbisher or bulk scrap trading' },
  { id: 'RECYCLER', title: 'Recycler', desc: 'Authorized processing facility' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [locality, setLocality] = useState('');
  const [role, setRole] = useState('SELLER');

  // Conditional fields
  const [sellerType, setSellerType] = useState('household');
  const [businessName, setBusinessName] = useState('');
  const [serviceLocations, setServiceLocations] = useState('');
  const [capacity, setCapacity] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [authorizationDetails, setAuthorizationDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !city.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (role === 'RECYCLER' && !businessName.trim()) {
      setError('Legal business name is required for authorized recyclers.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        city: city.trim(),
        locality: locality.trim(),
        seller_type: role === 'SELLER' ? sellerType : undefined,
        business_name: businessName.trim() || undefined,
        service_locations: serviceLocations.trim() || undefined,
        capacity: capacity.trim() || undefined,
        facility_address: facilityAddress.trim() || undefined,
        authorization_details: authorizationDetails.trim() || undefined,
      });
      router.replace('/');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check inputs.';
      setError(msg);
      Alert.alert('Registration Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Join ScrapSetu</Text>
          <Text style={styles.subtitle}>Create your marketplace profile</Text>
        </View>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Role Selection */}
        <Text style={styles.sectionLabel}>Select Your Role *</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((r) => {
            const isSelected = role === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                onPress={() => setRole(r.id)}
              >
                <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>
                  {r.title}
                </Text>
                <Text style={[styles.roleDesc, isSelected && styles.roleDescSelected]}>
                  {r.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Basic Information */}
        <Input
          label="Full Name *"
          placeholder="e.g. Ramesh Kumar"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Email Address *"
          placeholder="e.g. ramesh@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mobile Number *"
          placeholder="e.g. 9876543210"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Input
          label="Password *"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Input
          label="City *"
          placeholder="e.g. Mumbai, Delhi, Bangalore"
          value={city}
          onChangeText={setCity}
        />

        <Input
          label="Locality / Area"
          placeholder="e.g. Andheri West, Sector 14"
          value={locality}
          onChangeText={setLocality}
        />

        {/* Conditional Role-specific Fields */}
        {role === 'SELLER' && (
          <View style={styles.conditionalBlock}>
            <Text style={styles.sectionLabel}>Seller Type</Text>
            <View style={styles.chipsRow}>
              {['household', 'individual', 'office', 'business'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, sellerType === t && styles.chipActive]}
                  onPress={() => setSellerType(t)}
                >
                  <Text style={[styles.chipText, sellerType === t && styles.chipTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {sellerType === 'business' && (
              <Input
                label="Business / Organization Name"
                placeholder="e.g. Acme Tech Solutions"
                value={businessName}
                onChangeText={setBusinessName}
              />
            )}
          </View>
        )}

        {role === 'COLLECTOR' && (
          <View style={styles.conditionalBlock}>
            <Input
              label="Service Areas / Cities Covered"
              placeholder="e.g. Western Suburbs, South Mumbai"
              value={serviceLocations}
              onChangeText={setServiceLocations}
            />
            <Input
              label="Collection Capacity (kg/month)"
              placeholder="e.g. 2000"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </View>
        )}

        {role === 'BUYER' && (
          <View style={styles.conditionalBlock}>
            <Input
              label="Company / Workshop Name"
              placeholder="e.g. EcoRefurb Devices"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <Input
              label="Monthly Purchase Capacity (kg)"
              placeholder="e.g. 5000"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </View>
        )}

        {role === 'RECYCLER' && (
          <View style={styles.conditionalBlock}>
            <Input
              label="Legal Business Name *"
              placeholder="e.g. GreenCycle Recyclers Pvt Ltd"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <Input
              label="Processing Facility Address"
              placeholder="Industrial Area, Phase 2"
              value={facilityAddress}
              onChangeText={setFacilityAddress}
            />
            <Input
              label="State Pollution Board License / Authorization ID"
              placeholder="e.g. SPCB/EW/2026/042"
              value={authorizationDetails}
              onChangeText={setAuthorizationDetails}
            />
          </View>
        )}

        <Button
          title="Complete Registration"
          onPress={handleRegister}
          loading={loading}
          size="large"
          style={styles.submitBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  backBtn: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    width: '48%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  roleCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  roleTitleSelected: {
    color: Colors.primaryDark,
  },
  roleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  roleDescSelected: {
    color: Colors.primary,
  },
  conditionalBlock: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../src/components/ui/ScreenWrapper';
import { Button } from '../src/components/ui/Button';
import { Card } from '../src/components/ui/Card';
import { Colors } from '../src/constants/colors';
import { storage } from '../src/utils/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const toggleLanguage = async (lang: string) => {
    setSelectedLang(lang);
    await i18n.changeLanguage(lang);
    await storage.setLanguage(lang);
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Language selector toggle */}
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, selectedLang === 'en' && styles.langChipActive]}
            onPress={() => toggleLanguage('en')}
          >
            <Text style={[styles.langText, selectedLang === 'en' && styles.langTextActive]}>
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, selectedLang === 'hi' && styles.langChipActive]}
            onPress={() => toggleLanguage('hi')}
          >
            <Text style={[styles.langText, selectedLang === 'hi' && styles.langTextActive]}>
              हिंदी
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>ScrapSetu</Text>
          <Text style={styles.tagline}>Recycling Today • A Cleaner Tomorrow</Text>
        </View>

        {/* Feature Cards */}
        <Card style={styles.featureCard}>
          <Ionicons name="home-outline" size={28} color={Colors.primary} />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Waste Sellers</Text>
            <Text style={styles.featureDesc}>
              Schedule door-step pickup for household & office e-waste.
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <Ionicons name="bicycle-outline" size={28} color={Colors.primary} />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Local Kabadiwalas</Text>
            <Text style={styles.featureDesc}>
              Digitize collections, find bulk buyers, and get fair prices.
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <Ionicons name="business-outline" size={28} color={Colors.primary} />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Bulk Buyers & Refurbishers</Text>
            <Text style={styles.featureDesc}>
              Discover sorted inventory lots with transparent quality grades.
            </Text>
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <Ionicons name="sync-outline" size={28} color={Colors.primary} />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Authorized Recyclers</Text>
            <Text style={styles.featureDesc}>
              Source verified materials with compliant legal handovers.
            </Text>
          </View>
        </Card>

        {/* Bottom CTA */}
        <View style={styles.actions}>
          <Button
            title="Create an Account"
            onPress={() => router.push('/register')}
            size="large"
          />
          <Button
            title="Sign In"
            variant="outline"
            onPress={() => router.push('/login')}
            size="large"
            style={styles.signInBtn}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E9ECEF',
  },
  langChipActive: {
    backgroundColor: Colors.primary,
  },
  langText: {
    fontSize: 13,
    color: Colors.text,
  },
  langTextActive: {
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
  },
  featureText: {
    marginLeft: 14,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    marginTop: 20,
    marginBottom: 30,
  },
  signInBtn: {
    marginTop: 10,
  },
});


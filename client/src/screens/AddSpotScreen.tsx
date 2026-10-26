import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SpotType } from '../types/spot';
import { spotsService } from '../services/api/spotsService';

interface AddSpotScreenProps {
  onSuccess: () => void;
}

const garageHero = require('../../assets/garage_hero.png');
const garageInterior = require('../../assets/garage_interior.png');

export const AddSpotScreen: React.FC<AddSpotScreenProps> = ({ onSuccess }) => {
  const [street, setStreet] = useState('Dajwór 14');
  const [city, setCity] = useState('Kraków');
  const [postalCode, setPostalCode] = useState('31-052');
  const [price, setPrice] = useState('5,00');
  const [selectedType, setSelectedType] = useState<SpotType>('GARAGE');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await spotsService.createSpot({
        title: `Miejsce ${selectedType === 'GARAGE' ? 'Garażowe' : 'Parkingowe'} - ${street}`,
        address: street,
        city,
        postalCode,
        hourlyPrice: parseFloat(price.replace(',', '.')) || 5.0,
        spotType: selectedType,
      });

      Alert.alert(
        'Miejsce opublikowane! 🚀',
        'Twoje miejsce parkingowe jest już widoczne dla kierowców w wyznaczonych godzinach.',
        [{ text: 'Wróć do mapy', onPress: onSuccess }]
      );
    } catch {
      Alert.alert('Błąd', 'Nie udało się dodać miejsca. Spróbuj ponownie.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dodaj swoje miejsce</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.saveDraft}>Zapisz szkic</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Zarabiaj na wolnym miejscu parkingowym. Na początek wystarczy kilka informacji.
        </Text>

        {/* Location Section */}
        <Text style={styles.sectionHeading}>Gdzie jest Twoje miejsce?</Text>

        <Text style={styles.inputLabel}>Ulica i numer</Text>
        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={16} color="#6b7280" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.textInput}
            value={street}
            onChangeText={setStreet}
            placeholder="np. Dajwór 14"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.flex1, { marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Miasto</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="Kraków"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={[styles.flex1, { marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Kod pocztowy</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={postalCode}
                onChangeText={setPostalCode}
                placeholder="31-052"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Feather name="lock" size={13} color="#6b7280" style={{ marginRight: 6 }} />
          <Text style={styles.privacyText}>Dokładny adres udostępnimy dopiero po rezerwacji.</Text>
        </View>

        {/* Price Section */}
        <View style={styles.priceHeaderRow}>
          <Text style={styles.sectionHeading}>Ustal cenę</Text>
          <Text style={styles.currencyBadge}>PLN</Text>
        </View>

        <Text style={styles.inputLabel}>Cena za godzinę</Text>
        <View style={styles.priceInputWrapper}>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="5,00"
          />
          <Text style={styles.priceUnit}>/ godz.</Text>
        </View>

        <View style={styles.priceHintBox}>
          <Ionicons name="sparkles" size={18} color="#1b5e3a" style={{ marginRight: 8 }} />
          <Text style={styles.hintText}>Miejsca w okolicy kosztują zwykle 4–8 zł za godz.</Text>
        </View>

        {/* Photos Section */}
        <View style={styles.photosHeaderRow}>
          <Text style={styles.sectionHeading}>Pokaż swoje miejsce</Text>
          <Text style={styles.photosCounter}>2 / 5 zdjęć</Text>
        </View>
        <Text style={styles.photosSub}>Dodaj wyraźne zdjęcia wjazdu i miejsca parkingowego.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosRow}>
          {/* Photo 1: Garage Front */}
          <View style={styles.photoThumbWrapper}>
            <Image source={garageHero} style={styles.photoThumb} resizeMode="cover" />
            <View style={styles.mainBadge}>
              <Text style={styles.mainBadgeText}>Główne</Text>
            </View>
          </View>

          {/* Photo 2: Garage Interior */}
          <View style={styles.photoThumbWrapper}>
            <Image source={garageInterior} style={styles.photoThumb} resizeMode="cover" />
            <TouchableOpacity style={styles.removePhotoBadge} activeOpacity={0.8}>
              <Feather name="x" size={13} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Photo 3: Add button */}
          <TouchableOpacity style={styles.addPhotoButton} activeOpacity={0.7}>
            <Feather name="camera" size={24} color="#1b5e3a" style={{ marginBottom: 6 }} />
            <Text style={styles.addPhotoLabel}>Dodaj zdjęcie</Text>
          </TouchableOpacity>
        </ScrollView>
        <Text style={styles.photoFormatNote}>JPG lub PNG · Do 10 MB na zdjęcie</Text>

        {/* Spot Type Section */}
        <Text style={styles.sectionHeading}>Rodzaj miejsca</Text>
        <View style={styles.typeOptionsRow}>
          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'GARAGE' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('GARAGE')}
            activeOpacity={0.8}
          >
            {selectedType === 'GARAGE' && (
              <Feather name="check" size={16} color="#1b5e3a" style={{ marginRight: 6 }} />
            )}
            <Text
              style={[styles.typeButtonText, selectedType === 'GARAGE' && styles.typeTextSelected]}
            >
              Garaż
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'DRIVEWAY' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('DRIVEWAY')}
            activeOpacity={0.8}
          >
            {selectedType === 'DRIVEWAY' && (
              <Feather name="check" size={16} color="#1b5e3a" style={{ marginRight: 6 }} />
            )}
            <Text
              style={[
                styles.typeButtonText,
                selectedType === 'DRIVEWAY' && styles.typeTextSelected,
              ]}
            >
              Podjazd
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, selectedType === 'OUTDOOR' && styles.typeButtonSelected]}
            onPress={() => setSelectedType('OUTDOOR')}
            activeOpacity={0.8}
          >
            {selectedType === 'OUTDOOR' && (
              <Feather name="check" size={16} color="#1b5e3a" style={{ marginRight: 6 }} />
            )}
            <Text
              style={[styles.typeButtonText, selectedType === 'OUTDOOR' && styles.typeTextSelected]}
            >
              Na zewnątrz
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.publishButton, isPublishing && styles.buttonDisabled]}
          onPress={handlePublish}
          disabled={isPublishing}
          activeOpacity={0.85}
        >
          <Text style={styles.publishButtonText}>
            {isPublishing ? 'Publikowanie...' : 'Opublikuj miejsce'}
          </Text>
          <Feather name="arrow-right" size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Publikując, akceptujesz regulamin gospodarzy. Cenę i dostępność możesz zmienić w każdej
          chwili.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  saveDraft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b5e3a',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  priceInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#1b5e3a',
    fontWeight: '500',
    flex: 1,
  },
  photosHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photosCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  photosSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  photosRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoThumbWrapper: {
    width: 110,
    height: 96,
    borderRadius: 14,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  addPhotoButton: {
    width: 110,
    height: 96,
    borderRadius: 14,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1b5e3a',
  },
  photoFormatNote: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 16,
  },
  typeOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  typeButtonSelected: {
    borderColor: '#1b5e3a',
    backgroundColor: '#f0fdf4',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  typeTextSelected: {
    color: '#1b5e3a',
  },
  publishButton: {
    backgroundColor: '#1b5e3a',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  publishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});

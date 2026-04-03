import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PROPERTY_IDS_KEY = 'titanhome:saved-property-ids';

export async function getSavedPropertyIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_PROPERTY_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function isPropertySaved(propertyId: string): Promise<boolean> {
  const ids = await getSavedPropertyIds();
  return ids.includes(propertyId);
}

export async function toggleSavedProperty(propertyId: string): Promise<boolean> {
  const ids = await getSavedPropertyIds();
  const next = ids.includes(propertyId)
    ? ids.filter((id) => id !== propertyId)
    : [...ids, propertyId];
  await AsyncStorage.setItem(SAVED_PROPERTY_IDS_KEY, JSON.stringify(next));
  return next.includes(propertyId);
}

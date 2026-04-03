import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Property } from '../lib/types';
import { COLORS } from '../lib/colors';

interface PropertyCardProps {
  property: Property;
  variant?: 'horizontal' | 'vertical' | 'featured';
}

export default function PropertyCard({
  property,
  variant = 'vertical',
}: PropertyCardProps) {
  const router = useRouter();
  const safeImages = Array.isArray(property.images) && property.images.length > 0
    ? property.images.filter((item) => typeof item === 'string' && item.length > 0)
    : [];
  const imageUri = safeImages[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
  const priceLabel = `${property.priceFormatted} ${property.priceUnit === 'tỷ' ? 'tỷ' : property.priceUnit}`;

  const handlePress = () =>{
    router.push(`/property/${property.id}` as any);
  };

  const isVip = property.isFeatured === true || Number(property.priorityLevel || 0) > 0;

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        activeOpacity={0.9}
        onPress={handlePress}
     >
        <View style={styles.featuredImageWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.featuredImage}
          />
          {/* VIP Badge */}
          {isVip ? (
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>VIP</Text>
            </View>
          ) : (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>MỚI RA MẮT</Text>
            </View>
          )}
          {/* Heart button */}
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.featuredContent}>
          <View style={styles.featuredRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredTitle} numberOfLines={1}>
                {property.title}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={14}
                  color={COLORS.secondary}
                />
                <Text style={styles.locationText}>
                  {property.district}, {property.city}
                </Text>
              </View>
            </View>
            <Text style={styles.featuredPrice}>{priceLabel}</Text>
          </View>
          <View style={styles.specsRow}>
            {property.bedrooms>0 && (
              <View style={styles.specItem}>
                <Ionicons name="bed-outline" size={16} color={COLORS.outline} />
                <Text style={styles.specText}>
                  {property.bedrooms} PN
                </Text>
              </View>
            )}
            <View style={styles.specItem}>
              <Ionicons name="resize-outline" size={16} color={COLORS.outline} />
              <Text style={styles.specText}>{property.area} m²</Text>
            </View>
            {property.features.length>0 && (
              <View style={styles.specItem}>
                <Ionicons name="water-outline" size={16} color={COLORS.outline} />
                <Text style={styles.specText}>
                  {property.bathrooms} WC
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <View style={styles.horizontalImageWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.horizontalImage}
          />
          {/* VIP badge */}
          {isVip ? (
            <View style={styles.vipBadgeSmall}>
              <Text style={styles.vipBadgeTextSmall}>VIP</Text>
            </View>
          ) : null}
          {/* Price badge overlay */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{priceLabel}</Text>
          </View>
          {/* Heart icon */}
          <TouchableOpacity style={styles.heartButtonSmall}>
            <Ionicons name="heart-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {property.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={COLORS.secondary} />
            <Text style={styles.horizontalLocation} numberOfLines={1}>
              {property.district}, {property.city}
            </Text>
          </View>
          <View style={styles.horizontalSpecs}>
            {property.area>0 && (
              <View style={styles.miniSpec}>
                <Ionicons name="resize-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.miniSpecText}>{property.area} m²</Text>
              </View>
            )}
            {property.bedrooms>0 && (
              <View style={styles.miniSpec}>
                <Ionicons name="bed-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.miniSpecText}>{property.bedrooms} PN</Text>
              </View>
            )}
            {property.bathrooms>0 && (
              <View style={styles.miniSpec}>
                <Ionicons name="water-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.miniSpecText}>{property.bathrooms}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default vertical card
  return (
    <TouchableOpacity
      style={styles.verticalCard}
      activeOpacity={0.9}
      onPress={handlePress}
   >
      <View style={styles.verticalImageWrap}>
        <Image
          source={{ uri: imageUri }}
          style={styles.verticalImage}
        />
        {isVip ? (
          <View style={styles.vipBadgeSmall}>
            <Text style={styles.vipBadgeTextSmall}>VIP</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.verticalContent}>
        <Text style={styles.verticalTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={COLORS.secondary} />
          <Text style={styles.verticalLocation} numberOfLines={1}>
            {property.district}, {property.city}
          </Text>
        </View>
        <View style={styles.verticalBottom}>
          <Text style={styles.verticalPrice}>{priceLabel}</Text>
          <View style={styles.verticalSpecs}>
            {property.bedrooms>0 && (
              <View style={styles.miniSpec}>
                <Ionicons name="bed-outline" size={14} color={COLORS.outline} />
                <Text style={styles.miniSpecText}>{property.bedrooms}</Text>
              </View>
            )}
            <View style={styles.miniSpec}>
              <Ionicons name="resize-outline" size={14} color={COLORS.outline} />
              <Text style={styles.miniSpecText}>{property.area}m²</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  // VIP Badge styles
  vipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#f59e0b', // amber-500
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  vipBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  vipBadgeSmall: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  vipBadgeTextSmall: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Featured card
  featuredCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 4,
    marginRight: 16,
  },
  featuredImageWrap: {
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 280,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  featuredBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 16,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195, 198, 209, 0.2)',
    paddingTop: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Horizontal card - listing style
  horizontalCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 16,
  },
  horizontalImageWrap: {
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: 200,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 30, 64, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priceBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  heartButtonSmall: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContent: {
    padding: 14,
    gap: 4,
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  horizontalLocation: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  horizontalSpecs: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  miniSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniSpecText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.onSurfaceVariant,
  },

  // Vertical card
  verticalCard: {
    width: 260,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
    marginRight: 16,
  },
  verticalImageWrap: {
    position: 'relative',
  },
  verticalImage: {
    width: '100%',
    height: 150,
  },
  verticalContent: {
    padding: 14,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  verticalLocation: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginBottom: 10,
  },
  verticalBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  verticalSpecs: {
    flexDirection: 'row',
    gap: 8,
  },
});

import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { Artist } from '@/types/event';

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <View style={styles.container}>
      <Image
        source={artist.image ? { uri: artist.image } : undefined}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface2,
    marginBottom: 6,
  },
  name: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'center',
  },
});

import { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { normalizeImageUrl } from '../constants/layout';
import { isLocalImageUri } from '../lib/imagePicker';
import { resolveDesignInputUrl } from '../lib/storage';
import { colors, radius } from '../constants/theme';

type Props = {
  uri: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function RemoteImage({ uri, style, containerStyle, borderRadius = radius.lg }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [displayUri, setDisplayUri] = useState<string | null>(null);
  const normalizedUri = isLocalImageUri(uri) ? uri : normalizeImageUrl(uri);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setDisplayUri(null);

    void resolveDesignInputUrl(normalizedUri)
      .then((resolved) => {
        if (active) setDisplayUri(resolved);
      })
      .catch(() => {
        if (active) {
          setDisplayUri(normalizedUri);
        }
      });

    return () => {
      active = false;
    };
  }, [normalizedUri]);

  return (
    <View style={[styles.container, { borderRadius }, containerStyle]}>
      {(loading || error) && (
        <View style={[styles.placeholder, { borderRadius }]}>
          {error ? (
            <Ionicons name="image-outline" size={28} color={colors.textSecondary} />
          ) : (
            <ActivityIndicator color={colors.textSecondary} />
          )}
        </View>
      )}
      {!error && displayUri && (
        <Image
          source={{ uri: displayUri }}
          style={[styles.image, { borderRadius }, style]}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.skeleton,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.skeleton,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

import { View } from 'react-native';
import { AppText } from './AppText';

interface AvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, size = 48, className = '' }: AvatarProps) {
  // Ambil inisial: huruf pertama dari nama
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <View 
      className={`items-center justify-center bg-blue-100 dark:bg-blue-900/40 rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <AppText variant="body" className="text-blue-600 dark:text-blue-400 font-bold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </AppText>
    </View>
  );
}

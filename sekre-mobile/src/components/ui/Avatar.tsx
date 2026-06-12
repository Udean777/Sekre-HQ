import { View, Text } from 'react-native';

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
      className={`items-center justify-center bg-blue-100 rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Text className="text-blue-600 font-bold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}

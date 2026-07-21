import { Redirect } from 'expo-router';

export default function Index() {
  // Secara otomatis arahkan ke dashboard. 
  // Jika user belum login, _layout.tsx akan mencegatnya dan mengarahkan ke halaman login.
  return <Redirect href="/(dashboard)" />;
}

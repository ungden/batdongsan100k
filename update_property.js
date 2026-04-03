const fs = require('fs');
const path = './mobile/app/property/[id].tsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Update imports
if (!content.includes("import { useEffect")) {
  content = content.replace("import React, { useState }", "import React, { useState, useEffect }");
}
if (!content.includes("import { supabase }")) {
  content = content.replace(
    "import { getPropertyById } from '../../lib/data';",
    "import { getPropertyById } from '../../lib/data';\nimport { supabase } from '../../lib/supabase';\nimport { mapSupabaseListingToProperty } from '../(tabs)/index';"
  );
}

// 2. Update component body
const oldBody = `export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const toggleSave = () => setIsSaved(!isSaved);

  const property = getPropertyById(id);

  if (!property) {`;

const newBody = `export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const toggleSave = () => setIsSaved(!isSaved);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      if (!id) return;
      
      // If it's a mock ID (e.g. '1', '2'), use mock data
      if (!id.includes('-')) {
        const mockData = getPropertyById(id);
        if (mockData) {
          setProperty(mockData);
        }
        setLoading(false);
        return;
      }

      // Otherwise fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles(id, full_name, avatar_url, phone)')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setProperty(mapSupabaseListingToProperty(data));
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.notFoundText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (!property) {`;

content = content.replace(oldBody, newBody);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated property screen');

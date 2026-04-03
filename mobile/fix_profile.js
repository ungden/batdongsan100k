const fs = require('fs');
const file = 'app/(tabs)/profile.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update imports
content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useRouter } from 'expo-router';\nimport { supabase } from '../../lib/supabase';");

// 2. Update MenuItem
content = content.replace("badge?: string;\n}", "badge?: string;\n  action?: () => void;\n}");

// 3. Add state inside component
content = content.replace("export default function ProfileScreen() {", "export default function ProfileScreen() {\n  const router = useRouter();\n  const [user, setUser] = useState<any>(null);\n\n  useEffect(() => {\n    supabase.auth.getUser().then(({ data: { user } }) => {\n      setUser(user);\n    });\n    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {\n      setUser(session?.user ?? null);\n    });\n    return () => authListener.subscription.unsubscribe();\n  }, []);");

fs.writeFileSync(file, content);

const fs = require('fs');
const file = 'app/property/[id].tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const [showFullDescription, setShowFullDescription] = useState(false);',
  'const [showFullDescription, setShowFullDescription] = useState(false);\n  const [isSaved, setIsSaved] = useState(false);\n  const toggleSave = () => setIsSaved(!isSaved);'
);

fs.writeFileSync(file, content);

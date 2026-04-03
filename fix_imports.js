const fs = require('fs');
const path = './mobile/app/property/[id].tsx';

let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import { Property }")) {
  content = content.replace(
    "import { getPropertyById }",
    "import { Property } from '../../lib/types';\nimport { getPropertyById }"
  );
  content = content.replace(
    "const [property, setProperty] = useState<any>(null);",
    "const [property, setProperty] = useState<Property | null>(null);"
  );
  fs.writeFileSync(path, content, 'utf8');
  console.log("Fixed Property types");
} else {
  console.log("Property type already imported");
}

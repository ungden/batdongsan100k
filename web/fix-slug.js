const fs = require('fs');
const file = './src/lib/queries/properties.ts';
let content = fs.readFileSync(file, 'utf8');

const oldCatch = `  } catch (err) {
    console.error("Fallback error in getPropertyBySlug:", err)
    return undefined
  }`;

const newCatch = `  } catch (err) {
    console.error("Fallback error in getPropertyBySlug:", err)
    const { getPropertyBySlug: getMock } = await import('@/lib/data')
    return getMock(slug)
  }`;

content = content.replace(oldCatch, newCatch);
fs.writeFileSync(file, content);

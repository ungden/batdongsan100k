import { createClient } from "@supabase/supabase-js";

function getHighResUrl(url) {
  if (!url) return url;
  if (url.includes("img.meeyland.com")) return url.split("?")[0];
  if (url.includes("img.homedy.com")) return url.replace(/_\d+x\d+\.(jpg|jpeg|png)$/i, ".$1");
  if (url.includes("cloud.mogi.vn")) return url.replace(/\/thumb-(?:small|ms|large)\//i, "/");
  if (url.includes("cafeland.vn")) {
    const proxyMatch = url.match(/^.*\/image-data\/\d+-\d+\/(.*)$/i);
    if (proxyMatch) return "https://" + proxyMatch[1];
  }
  if (url.includes("odt.vn")) return url.replace(/\/(thumb|thumbs)\//i, "/");
  return url;
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Searching for listings with images to update to high-res versions...");
  
  let offset = 0;
  const limit = 1000;
  let totalFixed = 0;

  while (true) {
    const { data: listings, error } = await supabase
      .from('properties')
      .select('id, images')
      .not('images', 'is', null)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error fetching listings at offset ${offset}:`, error);
      break;
    }

    if (!listings || listings.length === 0) {
      break;
    }

    let batchFixed = 0;
    
    for (const listing of listings) {
      if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) continue;
      
      const newImages = listing.images.map(getHighResUrl);
      
      // Check if the images array was modified (if any image URL changed)
      let isModified = false;
      for (let i = 0; i < listing.images.length; i++) {
        if (newImages[i] !== listing.images[i]) {
          isModified = true;
          break;
        }
      }
      
      if (isModified) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ images: newImages })
          .eq('id', listing.id);
          
        if (updateError) {
          console.error(`Failed to update listing ID ${listing.id}:`, updateError);
        } else {
          batchFixed++;
          totalFixed++;
        }
      }
    }

    console.log(`Processed batch ${offset} to ${offset + limit - 1}. Fixed: ${batchFixed}`);

    if (listings.length < limit) {
      break;
    }
    
    // Increment offset for the next page
    offset += limit;
  }

  console.log(`\nScript complete! Total listings with updated high-res images: ${totalFixed}`);
}

main().catch(console.error);

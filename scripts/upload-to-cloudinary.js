const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'b4dd6lyg',
  api_key: process.env.CLOUDINARY_API_KEY || '839493269412152',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Kp-_OWOgu5sic_1jlEPLwkecJ10',
  secure: true,
});

const BASE_DIR = path.join(__dirname, '..', 'public', 'assets', 'img');

function determineFolder(relPath) {
  const norm = relPath.replace(/\\/g, '/').toLowerCase();
  
  if (norm.includes('avatar') || norm.includes('athletes')) {
    // Determine entity name
    const filename = path.basename(norm, path.extname(norm));
    return `npc-rwanda/athletes/${filename}`;
  }
  if (norm.includes('news')) {
    const filename = path.basename(norm, path.extname(norm));
    return `npc-rwanda/news/${filename}`;
  }
  if (norm.includes('event')) {
    const filename = path.basename(norm, path.extname(norm));
    return `npc-rwanda/events/${filename}`;
  }
  if (norm.includes('partner')) {
    return 'npc-rwanda/partners';
  }
  if (norm.includes('leader')) {
    return 'npc-rwanda/leaders';
  }
  return 'npc-rwanda/site';
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'].includes(ext)) {
        fileList.push(fullPath);
      }
    }
  });
  return fileList;
}

async function uploadAll() {
  console.log('--- Starting Cloudinary Upload to npc-rwanda/ ---');
  console.log('Source directory:', BASE_DIR);

  if (!fs.existsSync(BASE_DIR)) {
    console.error('Directory not found:', BASE_DIR);
    return;
  }

  const files = getAllFiles(BASE_DIR);
  console.log(`Found ${files.length} images to process.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of files) {
    const relPath = path.relative(BASE_DIR, filePath);
    const targetFolder = determineFolder(relPath);
    const filename = path.basename(filePath, path.extname(filePath));

    try {
      console.log(`Uploading: ${relPath} -> ${targetFolder}/${filename}`);
      const res = await cloudinary.uploader.upload(filePath, {
        folder: targetFolder,
        public_id: filename,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'auto',
      });
      console.log(`  ✓ Success: ${res.secure_url}`);
      successCount++;
    } catch (err) {
      console.error(`  ✗ Failed to upload ${relPath}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n--- Upload Finished ---');
  console.log(`Uploaded successfully: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

uploadAll();

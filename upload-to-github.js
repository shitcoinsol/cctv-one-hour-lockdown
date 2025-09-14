import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

// GitHub client helper function
async function getUncachableGitHubClient() {
  let connectionSettings;

  async function getAccessToken() {
    if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
      return connectionSettings.settings.access_token;
    }
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      throw new Error('X_REPLIT_TOKEN not found for repl/depl');
    }

    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      throw new Error('GitHub not connected');
    }
    return accessToken;
  }

  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Get repository info
const OWNER = 'shitcoinsol';
const REPO = 'cctv-one-hour-lockdown';

// Files to exclude from upload
const EXCLUDE_PATTERNS = [
  '.git',
  'node_modules',
  'dist',
  '.env',
  '.env.local',
  'tmp',
  'scripts/create-github-repo.js',
  'scripts/upload-to-github.js'
];

// Function to check if file should be excluded
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

// Function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (shouldExclude(fullPath)) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Function to upload a single file
async function uploadFile(github, filePath, content) {
  try {
    const base64Content = Buffer.from(content).toString('base64');
    
    await github.rest.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: `Add ${filePath}`,
      content: base64Content,
    });
    
    console.log(`✅ Uploaded: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${filePath}:`, error.message);
    return false;
  }
}

// Main function to upload all files
async function uploadAllFiles() {
  try {
    console.log('🔑 Authenticating with GitHub...');
    const github = await getUncachableGitHubClient();
    
    console.log('📁 Getting list of files to upload...');
    const files = getAllFiles('.');
    
    console.log(`📋 Found ${files.length} files to upload`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Upload files in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}...`);
      
      const promises = batch.map(async (file) => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const relativePath = file.replace('./', '');
          return await uploadFile(github, relativePath, content);
        } catch (error) {
          console.error(`❌ Error reading ${file}:`, error.message);
          return false;
        }
      });
      
      const results = await Promise.all(promises);
      successCount += results.filter(Boolean).length;
      failCount += results.filter(r => !r).length;
      
      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < files.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Upload complete!`);
    console.log(`✅ Successfully uploaded: ${successCount} files`);
    console.log(`❌ Failed uploads: ${failCount} files`);
    console.log(`\n🔗 Repository URL: https://github.com/${OWNER}/${REPO}`);
    
  } catch (error) {
    console.error('❌ Error during upload process:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadAllFiles();
import { Octokit } from '@octokit/rest';
import { createServer } from 'http';

// GitHub client helper function (copied from routes.ts)
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

async function createGitHubRepository() {
  try {
    console.log('🔑 Authenticating with GitHub...');
    const github = await getUncachableGitHubClient();
    
    console.log('👤 Getting user information...');
    const { data: user } = await github.rest.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login} (${user.name})`);
    
    console.log('🏗️  Creating repository...');
    const { data: repo } = await github.rest.repos.createForAuthenticatedUser({
      name: 'cctv-one-hour-lockdown',
      description: 'CCTV One Hour Lockdown - Luxury countdown application with UTC-based timing and feed grid reveal',
      private: false,
      auto_init: false
    });
    
    console.log('✅ Repository created successfully!');
    console.log(`📁 Repository: ${repo.full_name}`);
    console.log(`🔗 URL: ${repo.html_url}`);
    console.log(`📋 Clone URL: ${repo.clone_url}`);
    console.log(`🔑 SSH URL: ${repo.ssh_url}`);
    
    return {
      success: true,
      repo: {
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating repository:', error.message);
    
    if (error.message.includes('name already exists')) {
      console.log('ℹ️  Repository already exists. Fetching existing repository...');
      try {
        const github = await getUncachableGitHubClient();
        const { data: user } = await github.rest.users.getAuthenticated();
        const { data: repo } = await github.rest.repos.get({
          owner: user.login,
          repo: 'cctv-one-hour-lockdown'
        });
        
        console.log('✅ Found existing repository!');
        console.log(`📁 Repository: ${repo.full_name}`);
        console.log(`🔗 URL: ${repo.html_url}`);
        console.log(`📋 Clone URL: ${repo.clone_url}`);
        console.log(`🔑 SSH URL: ${repo.ssh_url}`);
        
        return {
          success: true,
          repo: {
            name: repo.name,
            full_name: repo.full_name,
            html_url: repo.html_url,
            clone_url: repo.clone_url,
            ssh_url: repo.ssh_url
          }
        };
      } catch (fetchError) {
        console.error('❌ Error fetching existing repository:', fetchError.message);
        return { success: false, error: fetchError.message };
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Run the script
createGitHubRepository()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 Success! GitHub repository is ready.');
      console.log('\nNext steps:');
      console.log('1. Add files to git');
      console.log('2. Commit changes');
      console.log(`3. Push to: ${result.repo.clone_url}`);
    } else {
      console.error('\n💥 Failed to create repository:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
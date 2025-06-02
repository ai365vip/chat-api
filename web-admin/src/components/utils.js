import { API, showError } from '../helpers';

export async function getOAuthState() {
  const res = await API.get('/api/oauth/state');
  const { success, message, data } = res.data;
  if (success) {
    return data;
  } else {
    showError(message);
    return '';
  }
}

export async function onDiscordOAuthClicked(discord_client_id) {
  const state = await getOAuthState();
  if (!state) return;
  window.open(
    `https://discord.com/oauth2/authorize?client_id=${discord_client_id}&redirect_uri=${window.location.origin}/oauth/discord&response_type=code&scope=identify+openid&state=${state}`
  );
}

export async function onGitHubOAuthClicked(github_client_id) {
  const state = await getOAuthState();
  if (!state) return;
  window.open(
    `https://github.com/login/oauth/authorize?client_id=${github_client_id}&state=${state}&scope=user:email`
  );
}
function getAvatarUrl(user) {
  if (!user.avatar) return null;

  // detect if avatar is animated (starts with 'a_') and assign appropriate ext
  const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';

  return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.${ext}`;
}

module.exports = { getAvatarUrl };

// server/src/tests/utils/discord.test.js

const { getAvatarUrl } = require('../utils/discord');

describe('getAvatarUrl', () => {
  it('should return null if avatar is not present', () => {
    const user = { discordId: '12345', avatar: null };
    expect(getAvatarUrl(user)).toBeNull();
  });

  it('should return a PNG URL for static avatars', () => {
    const user = { discordId: '12345', avatar: 'abcdef' };
    const expected = 'https://cdn.discordapp.com/avatars/12345/abcdef.png';
    expect(getAvatarUrl(user)).toBe(expected);
  });

  it('should return a GIF URL for animated avatars', () => {
    const user = { discordId: '12345', avatar: 'a_abcdef' };
    const expected = 'https://cdn.discordapp.com/avatars/12345/a_abcdef.gif';
    expect(getAvatarUrl(user)).toBe(expected);
  });
});
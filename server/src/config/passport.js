    const passport = require('passport');
    const DiscordStrategy = require('passport-discord').Strategy;
    const { PrismaClient } = require('../../../generated/prisma');
    const prisma = new PrismaClient();

    const scopes = ['identify'];

    function setupPassport() {
      passport.use(
        new DiscordStrategy(
          {
            clientID: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            callbackURL: process.env.DISCORD_CALLBACK_URL,
            scope: scopes,
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              // checks if user exists with same discordId
              let user = await prisma.user.findUnique({
                where: { discordId: profile.id },
              });

              // if no user is found, create one using discord profile data
              if (!user) {
                user = await prisma.user.create({
                  data: {
                    discordId: profile.id,
                    username: profile.username,
                    avatar: profile.avatar,
                  },
                });
              } else {
                // optionally update avatar on login if changed
                if (user.avatar !== profile.avatar) {
                  user = await prisma.user.update({
                    where: { discordId: profile.id },
                    data: { avatar: profile.avatar },
                  });
                }
              }

              // login success, pass user to session
              return done(null, user);
            } catch (error) {
              // error, cancel login
              return done(error, null);
            }
          }
        )
      );
      // tell passport what part of user object to save in session, just user.id
      passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      // on subsequent requests, pull full user record
      passport.deserializeUser(async (id, done) => {
        try {
          const user = await prisma.user.findUnique({ where: { id } });
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      });
    }

    module.exports = setupPassport;

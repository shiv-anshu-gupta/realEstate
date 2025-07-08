const { Clerk } = require("@clerk/clerk-sdk-node");

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

exports.verifyToken = async (token) => {
  const session = await clerk.sessions.verifySession(token);
  const user = await clerk.users.getUser(session.userId);
  return user;
};

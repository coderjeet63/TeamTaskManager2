const serializeUser = (user) => {
  const payload = user.toObject ? user.toObject() : { ...user };
  delete payload.password;
  return payload;
};

module.exports = serializeUser;

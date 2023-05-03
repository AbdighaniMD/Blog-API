const getTokenFromHeader = (req) => {
    //get token from header
    const authHeader = req.headers;
    const token = authHeader["authorization"].split(" ")[1];

    if (token !== undefined) {
        return token;
      } else {
        return false;
      }
}

module.exports = getTokenFromHeader;
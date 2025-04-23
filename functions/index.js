const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

admin.initializeApp();

const VALID_SECRET = "b4@d7V3X!ZrPq29K#tf";

exports.getUnityTokenV2 = onRequest(async (req, res) => {
  const { secretKey } = req.body;

  if (secretKey !== VALID_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const uid = "unity-client";
    const customClaims = { role: "unity" };
    const token = await admin.auth().createCustomToken(uid, customClaims);
    return res.json({ token });
  } catch (error) {
    logger.error("Token generation error:", error.message);
    return res.status(500).json({ error: "Token creation failed", message: error.message });
  }
});
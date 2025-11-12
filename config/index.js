module.exports = {
  port: process.env.PORT || 3000,
  /** Update this to your public base URL (without trailing slash), e.g. "https://myste.com" */
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  /** How many tables to generate QR codes for by default */
  tableCount: parseInt(process.env.TABLE_COUNT || "20", 10),
  /** Path to logo used in notifications and UI */
  logoPath: "/assets/logo.png",
  /** Notification title prefix */
  brandName: process.env.BRAND_NAME || "Bellio",
};

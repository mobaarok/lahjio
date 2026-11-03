// Turns a phone's time zone ("Asia/Riyadh") into a country for Admin > Analytics.
// It's a good guess, not exact: a phone set to Riyadh time could be in Kuwait.
const byTimeZone = {
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Aden": "Yemen",
  "Asia/Dubai": "UAE",
  "Asia/Muscat": "Oman",
  "Asia/Qatar": "Qatar",
  "Asia/Bahrain": "Bahrain",
  "Asia/Kuwait": "Kuwait",
  "Asia/Baghdad": "Iraq",
  "Asia/Amman": "Jordan",
  "Africa/Cairo": "Egypt",
  "Asia/Dhaka": "Bangladesh",
  "Asia/Kolkata": "India",
  "Asia/Calcutta": "India",
  "Asia/Karachi": "Pakistan",
  "Asia/Kathmandu": "Nepal",
  "Asia/Katmandu": "Nepal",
  "Asia/Colombo": "Sri Lanka",
  "Asia/Manila": "Philippines",
  "Asia/Jakarta": "Indonesia",
  "Asia/Kuala_Lumpur": "Malaysia",
  "Asia/Singapore": "Singapore",
  "Europe/London": "United Kingdom",
};

export function countryOf(timeZone) {
  if (!timeZone) return "Unknown";
  return byTimeZone[timeZone] ?? timeZone.split("/").pop().replace(/_/g, " ");
}

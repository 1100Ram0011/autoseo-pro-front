export const countryPhoneRules = {
  "+93": { length: 9, startsWith: /^[7]/ }, // Afghanistan: mobile starts with 7
  "+355": { length: 9, startsWith: /^[6]/ }, // Albania: mobile starts with 6
  "+213": { length: 9, startsWith: /^[5-7]/ }, // Algeria: mobile starts with 5,6,7
  "+376": { length: 6, startsWith: /^[3,6]/ }, // Andorra: mobile starts with 3,6
  "+244": { length: 9, startsWith: /^[9]/ }, // Angola: mobile starts with 9
  "+1264": { length: 7, startsWith: /^[2-9]/ }, // Anguilla: follows NANP
  "+1268": { length: 7, startsWith: /^[2-9]/ }, // Antigua and Barbuda: follows NANP
  "+54": { length: 10, startsWith: /^[9]/ }, // Argentina: mobile starts with 9
  "+374": { length: 8, startsWith: /^[4,7,9]/ }, // Armenia: mobile starts with 4,7,9
  "+297": { length: 7, startsWith: /^[5,6,7]/ }, // Aruba: mobile starts with 5,6,7
  "+61": { length: 9, startsWith: /^[4]/ }, // Australia: mobile starts with 4
  "+43": { length: 10, startsWith: /^[6]/ }, // Austria: mobile starts with 6
  "+994": { length: 9, startsWith: /^[4,5,7]/ }, // Azerbaijan: mobile starts with 4,5,7
  "+1242": { length: 7, startsWith: /^[2-9]/ }, // Bahamas: follows NANP
  "+973": { length: 8, startsWith: /^[3]/ }, // Bahrain: mobile starts with 3
  "+880": { length: 10, startsWith: /^[1]/ }, // Bangladesh: mobile starts with 1
  "+1246": { length: 7, startsWith: /^[2-9]/ }, // Barbados: follows NANP
  "+375": { length: 9, startsWith: /^[2,3]/ }, // Belarus: mobile starts with 2,3
  "+32": { length: 9, startsWith: /^[4]/ }, // Belgium: mobile starts with 4
  "+501": { length: 7, startsWith: /^[6]/ }, // Belize: mobile starts with 6
  "+229": { length: 8, startsWith: /^[9]/ }, // Benin: mobile starts with 9
  "+1441": { length: 7, startsWith: /^[2-9]/ }, // Bermuda: follows NANP
  "+975": { length: 8, startsWith: /^[1,7]/ }, // Bhutan: mobile starts with 1,7
  "+591": { length: 8, startsWith: /^[6-7]/ }, // Bolivia: mobile starts with 6,7
  "+387": { length: 8, startsWith: /^[6]/ }, // Bosnia: mobile starts with 6
  "+267": { length: 8, startsWith: /^[7]/ }, // Botswana: mobile starts with 7
  "+55": { length: 11, startsWith: /^[1-9]/ }, // Brazil: varies by region
  "+673": { length: 7, startsWith: /^[7-8]/ }, // Brunei: mobile starts with 7,8
  "+359": { length: 9, startsWith: /^[8-9]/ }, // Bulgaria: mobile starts with 8,9
  "+226": { length: 8, startsWith: /^[5-7]/ }, // Burkina Faso: mobile starts with 5,6,7
  "+855": { length: 9, startsWith: /^[1,6-9]/ }, // Cambodia: mobile starts with 1,6,7,8,9
  "+237": { length: 9, startsWith: /^[6]/ }, // Cameroon: mobile starts with 6
  "+1": { length: 10, startsWith: /^[2-9]/ }, // Canada: follows NANP
  "+238": { length: 7, startsWith: /^[5,9]/ }, // Cape Verde: mobile starts with 5,9
  "+1345": { length: 7, startsWith: /^[2-9]/ }, // Cayman Islands: follows NANP
  "+236": { length: 8, startsWith: /^[7]/ }, // Central African Republic: mobile starts with 7
  "+235": { length: 8, startsWith: /^[6]/ }, // Chad: mobile starts with 6
  "+56": { length: 9, startsWith: /^[9]/ }, // Chile: mobile starts with 9
  "+86": { length: 11, startsWith: /^[1]/ }, // China: mobile starts with 1
  "+57": { length: 10, startsWith: /^[3]/ }, // Colombia: mobile starts with 3
  "+269": { length: 7, startsWith: /^[3]/ }, // Comoros: mobile starts with 3
  "+506": { length: 8, startsWith: /^[6-8]/ }, // Costa Rica: mobile starts with 6,7,8
  "+385": { length: 9, startsWith: /^[9]/ }, // Croatia: mobile starts with 9
  "+53": { length: 8, startsWith: /^[5]/ }, // Cuba: mobile starts with 5
  "+357": { length: 8, startsWith: /^[9]/ }, // Cyprus: mobile starts with 9
  "+420": { length: 9, startsWith: /^[6,7]/ }, // Czech Republic: mobile starts with 6,7
  "+45": { length: 8, startsWith: /^[2-3,5-9]/ }, // Denmark: mobile starts with 2,3,5-9
  "+253": { length: 8, startsWith: /^[7]/ }, // Djibouti: mobile starts with 7
  "+1767": { length: 7, startsWith: /^[2-9]/ }, // Dominica: follows NANP
  "+1809": { length: 7, startsWith: /^[2-9]/ }, // Dominican Republic: follows NANP
  "+593": { length: 9, startsWith: /^[9]/ }, // Ecuador: mobile starts with 9
  "+20": { length: 10, startsWith: /^[1]/ }, // Egypt: mobile starts with 1
  "+503": { length: 8, startsWith: /^[7]/ }, // El Salvador: mobile starts with 7
  "+240": { length: 9, startsWith: /^[2]/ }, // Equatorial Guinea: mobile starts with 2
  "+372": { length: 8, startsWith: /^[5]/ }, // Estonia: mobile starts with 5
  "+251": { length: 9, startsWith: /^[9]/ }, // Ethiopia: mobile starts with 9
  "+679": { length: 7, startsWith: /^[7,9]/ }, // Fiji: mobile starts with 7,9
  "+358": { length: 9, startsWith: /^[4,5]/ }, // Finland: mobile starts with 4,5
  "+33": { length: 9, startsWith: /^[6,7]/ }, // France: mobile starts with 6,7
  "+241": { length: 8, startsWith: /^[0,1,2,5-9]/ }, // Gabon: mobile starts with 0,1,2,5-9
  "+220": { length: 7, startsWith: /^[7,9]/ }, // Gambia: mobile starts with 7,9
  "+995": { length: 9, startsWith: /^[5]/ }, // Georgia: mobile starts with 5
  "+49": { length: 11, startsWith: /^[1]/ }, // Germany: mobile starts with 1
  "+233": { length: 9, startsWith: /^[2]/ }, // Ghana: mobile starts with 2
  "+30": { length: 10, startsWith: /^[6,7]/ }, // Greece: mobile starts with 6,7
  "+299": { length: 6, startsWith: /^[4,5]/ }, // Greenland: mobile starts with 4,5
  "+1473": { length: 7, startsWith: /^[2-9]/ }, // Grenada: follows NANP
  "+502": { length: 8, startsWith: /^[4,5]/ }, // Guatemala: mobile starts with 4,5
  "+224": { length: 9, startsWith: /^[6]/ }, // Guinea: mobile starts with 6
  "+245": { length: 7, startsWith: /^[5,6,7]/ }, // Guinea-Bissau: mobile starts with 5,6,7
  "+592": { length: 7, startsWith: /^[6]/ }, // Guyana: mobile starts with 6
  "+509": { length: 8, startsWith: /^[3,4]/ }, // Haiti: mobile starts with 3,4
  "+504": { length: 8, startsWith: /^[3,7,8,9]/ }, // Honduras: mobile starts with 3,7,8,9
  "+852": { length: 8, startsWith: /^[5-9]/ }, // Hong Kong: mobile starts with 5-9
  "+36": { length: 9, startsWith: /^[2,3,7]/ }, // Hungary: mobile starts with 2,3,7
  "+354": { length: 7, startsWith: /^[6,7,8]/ }, // Iceland: mobile starts with 6,7,8
  "+91": { length: 10, startsWith: /^[6-9]/ }, // India: mobile starts with 6,7,8,9
  "+62": { length: 10, startsWith: /^[8]/ }, // Indonesia: mobile starts with 8
  "+98": { length: 10, startsWith: /^[9]/ }, // Iran: mobile starts with 9
  "+964": { length: 10, startsWith: /^[7]/ }, // Iraq: mobile starts with 7
  "+353": { length: 9, startsWith: /^[8]/ }, // Ireland: mobile starts with 8
  "+972": { length: 9, startsWith: /^[5]/ }, // Israel: mobile starts with 5
  "+39": { length: 10, startsWith: /^[3]/ }, // Italy: mobile starts with 3
  "+225": { length: 8, startsWith: /^[0,4-8]/ }, // Ivory Coast: mobile starts with 0,4-8
  "+1876": { length: 7, startsWith: /^[2-9]/ }, // Jamaica: follows NANP
  "+81": { length: 10, startsWith: /^[7-9]/ }, // Japan: mobile starts with 7,8,9
  "+962": { length: 9, startsWith: /^[7]/ }, // Jordan: mobile starts with 7
  "+7": { length: 10, startsWith: /^[9]/ }, // Kazakhstan: mobile starts with 9
  "+254": { length: 9, startsWith: /^[7]/ }, // Kenya: mobile starts with 7
  "+965": { length: 8, startsWith: /^[5,6,9]/ }, // Kuwait: mobile starts with 5,6,9
  "+996": { length: 9, startsWith: /^[5,7]/ }, // Kyrgyzstan: mobile starts with 5,7
  "+856": { length: 10, startsWith: /^[2]/ }, // Laos: mobile starts with 2
  "+371": { length: 8, startsWith: /^[2]/ }, // Latvia: mobile starts with 2
  "+961": { length: 8, startsWith: /^[3,7]/ }, // Lebanon: mobile starts with 3,7
  "+266": { length: 8, startsWith: /^[5,6]/ }, // Lesotho: mobile starts with 5,6
  "+231": { length: 8, startsWith: /^[4,5,6,7]/ }, // Liberia: mobile starts with 4,5,6,7
  "+218": { length: 9, startsWith: /^[9]/ }, // Libya: mobile starts with 9
  "+423": { length: 7, startsWith: /^[7]/ }, // Liechtenstein: mobile starts with 7
  "+370": { length: 8, startsWith: /^[6]/ }, // Lithuania: mobile starts with 6
  "+352": { length: 9, startsWith: /^[6]/ }, // Luxembourg: mobile starts with 6
  "+853": { length: 8, startsWith: /^[6]/ }, // Macau: mobile starts with 6
  "+261": { length: 9, startsWith: /^[3]/ }, // Madagascar: mobile starts with 3
  "+265": { length: 9, startsWith: /^[8,9]/ }, // Malawi: mobile starts with 8,9
  "+60": { length: 9, startsWith: /^[1]/ }, // Malaysia: mobile starts with 1
  "+960": { length: 7, startsWith: /^[7,9]/ }, // Maldives: mobile starts with 7,9
  "+223": { length: 8, startsWith: /^[6,7]/ }, // Mali: mobile starts with 6,7
  "+356": { length: 8, startsWith: /^[7,9]/ }, // Malta: mobile starts with 7,9
  "+692": { length: 7, startsWith: /^[4]/ }, // Marshall Islands: mobile starts with 4
  "+222": { length: 8, startsWith: /^[2,3,4]/ }, // Mauritania: mobile starts with 2,3,4
  "+230": { length: 8, startsWith: /^[5]/ }, // Mauritius: mobile starts with 5
  "+52": { length: 10, startsWith: /^[1-9]/ }, // Mexico: varies by region
  "+373": { length: 8, startsWith: /^[6,7]/ }, // Moldova: mobile starts with 6,7
  "+377": { length: 8, startsWith: /^[4,6]/ }, // Monaco: mobile starts with 4,6
  "+976": { length: 8, startsWith: /^[8,9]/ }, // Mongolia: mobile starts with 8,9
  "+382": { length: 8, startsWith: /^[6]/ }, // Montenegro: mobile starts with 6
  "+212": { length: 9, startsWith: /^[6]/ }, // Morocco: mobile starts with 6
  "+258": { length: 9, startsWith: /^[8]/ }, // Mozambique: mobile starts with 8
  "+95": { length: 9, startsWith: /^[9]/ }, // Myanmar: mobile starts with 9
  "+264": { length: 9, startsWith: /^[8]/ }, // Namibia: mobile starts with 8
  "+977": { length: 10, startsWith: /^[9]/ }, // Nepal: mobile starts with 9
  "+31": { length: 9, startsWith: /^[6]/ }, // Netherlands: mobile starts with 6
  "+64": { length: 9, startsWith: /^[2]/ }, // New Zealand: mobile starts with 2
  "+505": { length: 8, startsWith: /^[8]/ }, // Nicaragua: mobile starts with 8
  "+227": { length: 8, startsWith: /^[9]/ }, // Niger: mobile starts with 9
  "+234": { length: 10, startsWith: /^[7,8,9]/ }, // Nigeria: mobile starts with 7,8,9
  "+850": { length: 9, startsWith: /^[1]/ }, // North Korea: mobile starts with 1
  "+47": { length: 8, startsWith: /^[4,9]/ }, // Norway: mobile starts with 4,9
  "+968": { length: 8, startsWith: /^[9]/ }, // Oman: mobile starts with 9
  "+92": { length: 10, startsWith: /^[3]/ }, // Pakistan: mobile starts with 3
  "+970": { length: 9, startsWith: /^[5]/ }, // Palestine: mobile starts with 5
  "+507": { length: 8, startsWith: /^[6]/ }, // Panama: mobile starts with 6
  "+675": { length: 8, startsWith: /^[7]/ }, // Papua New Guinea: mobile starts with 7
  "+595": { length: 9, startsWith: /^[9]/ }, // Paraguay: mobile starts with 9
  "+51": { length: 9, startsWith: /^[9]/ }, // Peru: mobile starts with 9
  "+63": { length: 10, startsWith: /^[9]/ }, // Philippines: mobile starts with 9
  "+48": { length: 9, startsWith: /^[5,6,7,8]/ }, // Poland: mobile starts with 5,6,7,8
  "+351": { length: 9, startsWith: /^[9]/ }, // Portugal: mobile starts with 9
  "+974": { length: 8, startsWith: /^[3,5,6,7]/ }, // Qatar: mobile starts with 3,5,6,7
  "+40": { length: 9, startsWith: /^[7]/ }, // Romania: mobile starts with 7
  "+07": { length: 10, startsWith: /^[9]/ }, // Russia: mobile starts with 9
  "+250": { length: 9, startsWith: /^[7]/ }, // Rwanda: mobile starts with 7
  "+966": { length: 9, startsWith: /^[5]/ }, // Saudi Arabia: mobile starts with 5
  "+221": { length: 9, startsWith: /^[7]/ }, // Senegal: mobile starts with 7
  "+381": { length: 9, startsWith: /^[6]/ }, // Serbia: mobile starts with 6
  "+248": { length: 7, startsWith: /^[2]/ }, // Seychelles: mobile starts with 2
  "+232": { length: 8, startsWith: /^[7,9]/ }, // Sierra Leone: mobile starts with 7,9
  "+65": { length: 8, startsWith: /^[8,9]/ }, // Singapore: mobile starts with 8,9
  "+421": { length: 9, startsWith: /^[9]/ }, // Slovakia: mobile starts with 9
  "+386": { length: 8, startsWith: /^[3,4]/ }, // Slovenia: mobile starts with 3,4
  "+252": { length: 8, startsWith: /^[6,7]/ }, // Somalia: mobile starts with 6,7
  "+27": { length: 9, startsWith: /^[6,7,8]/ }, // South Africa: mobile starts with 6,7,8
  "+82": { length: 10, startsWith: /^[1]/ }, // South Korea: mobile starts with 1
  "+211": { length: 9, startsWith: /^[9]/ }, // South Sudan: mobile starts with 9
  "+34": { length: 9, startsWith: /^[6,7]/ }, // Spain: mobile starts with 6,7
  "+94": { length: 9, startsWith: /^[7]/ }, // Sri Lanka: mobile starts with 7
  "+249": { length: 9, startsWith: /^[9]/ }, // Sudan: mobile starts with 9
  "+597": { length: 7, startsWith: /^[6,7,8]/ }, // Suriname: mobile starts with 6,7,8
  "+46": { length: 9, startsWith: /^[7]/ }, // Sweden: mobile starts with 7
  "+41": { length: 9, startsWith: /^[7]/ }, // Switzerland: mobile starts with 7
  "+963": { length: 9, startsWith: /^[9]/ }, // Syria: mobile starts with 9
  "+886": { length: 9, startsWith: /^[9]/ }, // Taiwan: mobile starts with 9
  "+992": { length: 9, startsWith: /^[9]/ }, // Tajikistan: mobile starts with 9
  "+255": { length: 9, startsWith: /^[6,7]/ }, // Tanzania: mobile starts with 6,7
  "+66": { length: 9, startsWith: /^[6,8,9]/ }, // Thailand: mobile starts with 6,8,9
  "+228": { length: 8, startsWith: /^[9]/ }, // Togo: mobile starts with 9
  "+216": { length: 8, startsWith: /^[2,4,5,9]/ }, // Tunisia: mobile starts with 2,4,5,9
  "+90": { length: 10, startsWith: /^[5]/ }, // Turkey: mobile starts with 5
  "+993": { length: 8, startsWith: /^[6]/ }, // Turkmenistan: mobile starts with 6
  "+256": { length: 9, startsWith: /^[7]/ }, // Uganda: mobile starts with 7
  "+380": { length: 9, startsWith: /^[5,6,7,9]/ }, // Ukraine: mobile starts with 5,6,7,9
  "+971": { length: 9, startsWith: /^[5]/ }, // UAE: mobile starts with 5
  "+44": { length: 10, startsWith: /^[7]/ }, // UK: mobile starts with 7
  "+01": { length: 10, startsWith: /^[2-9]/ }, // USA: follows NANP
  "+598": { length: 8, startsWith: /^[9]/ }, // Uruguay: mobile starts with 9
  "+998": { length: 9, startsWith: /^[9]/ }, // Uzbekistan: mobile starts with 9
  "+58": { length: 10, startsWith: /^[4]/ }, // Venezuela: mobile starts with 4
  "+84": { length: 9, startsWith: /^[3,5,7,8,9]/ }, // Vietnam: mobile starts with 3,5,7,8,9
  "+967": { length: 9, startsWith: /^[7]/ }, // Yemen: mobile starts with 7
  "+260": { length: 9, startsWith: /^[9]/ }, // Zambia: mobile starts with 9
  "+263": { length: 9, startsWith: /^[7]/ }, // Zimbabwe: mobile starts with 7
};


// for 2025-01-17T12:59:36.000Z format - Output: 17-01-2025
export function formatToNormalDate(isoDateString) {
  const date = new Date(isoDateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// Text case constants
export const textCases = {
  TITLE: "title",
  UPPER: "upper",
  LOWER: "lower",
  SENTENCE: "sentence",
  NONE: "none",
};

// Text case formatting function
export function formatCase(text, caseType = textCases.TITLE) {
  if (!text || typeof text !== "string") return text;

  switch (caseType) {
    case textCases.UPPER:
      return text.toUpperCase();
    case textCases.LOWER:
      return text.toLowerCase();
    case textCases.TITLE:
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    case textCases.SENTENCE:
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case textCases.NONE:
      return text;
    default:
      return text;
  }
}

//Format amount by country
export function formatAmountByCountry(
  amount,
  countryCode = "IN",
  showSymbol = true,
  roundAmount = true
) {
  // console.log({"amount":amount,"countryCode":countryCode,"showSymbol":showSymbol,"roundAmount":roundAmount },"formatcountryPara")
  // If amount is already a number, use it directly
  const num = typeof amount === "number" ? amount : Number(amount);

  // Return the original amount if it's not a valid number
  if (isNaN(num)) return amount;

  // Round the number if roundAmount is true, otherwise keep as is
  const finalNum = roundAmount ? Math.round(num) : num;

  const country = countryInfoMap[countryCode] || countryInfoMap["IN"]; // fallback to Indian
  const locale = country.locale || "en-IN";
  const currency = country.currency || "₹";

  // Format with locale-specific comma separation
  const formattedNumber = finalNum.toLocaleString(locale);

  // Return with or without currency symbol
  if (showSymbol === false) {
    return formattedNumber;
  }

  return `${currency} ${formattedNumber}`;
}

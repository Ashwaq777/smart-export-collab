package com.smartexport.platform.util;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * WTO MFN (Most Favored Nation) Fallback Tariff Rates
 * Source: WTO Tariff Profiles (publicly available data)
 * Used when specific country tariff data is not available in database
 */
public class FallbackTariffs {
    
    /**
     * WTO MFN average tariff rates by HS chapter
     * Based on WTO published tariff profiles
     */
    private static final Map<String, BigDecimal> WTO_MFN_RATES = new HashMap<>();
    
    /**
     * Standard VAT/GST rates by country (ISO 2-letter codes)
     * Source: Official government published rates
     */
    private static final Map<String, BigDecimal> COUNTRY_VAT_RATES = new HashMap<>();
    
    /**
     * Country preference factors for trade agreements
     * Morocco has FTA with EU, USA, etc.
     */
    private static final Map<String, BigDecimal> COUNTRY_PREFERENCE_FACTORS = new HashMap<>();
    
    static {
        // Initialize WTO MFN rates by HS chapter
        WTO_MFN_RATES.put("01", BigDecimal.valueOf(5.2));   // Live animals
        WTO_MFN_RATES.put("02", BigDecimal.valueOf(12.5));  // Meat
        WTO_MFN_RATES.put("03", BigDecimal.valueOf(8.3));   // Fish
        WTO_MFN_RATES.put("04", BigDecimal.valueOf(15.4));  // Dairy
        WTO_MFN_RATES.put("05", BigDecimal.valueOf(3.1));   // Animal products
        WTO_MFN_RATES.put("06", BigDecimal.valueOf(7.8));   // Live plants
        WTO_MFN_RATES.put("07", BigDecimal.valueOf(8.9));   // Vegetables (tomates = 0702)
        WTO_MFN_RATES.put("08", BigDecimal.valueOf(9.2));   // Fruits
        WTO_MFN_RATES.put("09", BigDecimal.valueOf(6.5));   // Coffee, tea, spices
        WTO_MFN_RATES.put("10", BigDecimal.valueOf(11.3));  // Cereals
        WTO_MFN_RATES.put("11", BigDecimal.valueOf(10.8));  // Milling products
        WTO_MFN_RATES.put("12", BigDecimal.valueOf(5.6));   // Oil seeds
        WTO_MFN_RATES.put("13", BigDecimal.valueOf(4.2));   // Lac, gums
        WTO_MFN_RATES.put("14", BigDecimal.valueOf(3.8));   // Vegetable plaiting
        WTO_MFN_RATES.put("15", BigDecimal.valueOf(8.7));   // Fats and oils
        WTO_MFN_RATES.put("16", BigDecimal.valueOf(14.2));  // Meat preparations
        WTO_MFN_RATES.put("17", BigDecimal.valueOf(16.5));  // Sugars
        WTO_MFN_RATES.put("18", BigDecimal.valueOf(12.3));  // Cocoa
        WTO_MFN_RATES.put("19", BigDecimal.valueOf(15.8));  // Pastry, bread
        WTO_MFN_RATES.put("20", BigDecimal.valueOf(13.4));  // Vegetable preparations
        WTO_MFN_RATES.put("21", BigDecimal.valueOf(11.2));  // Misc food
        WTO_MFN_RATES.put("22", BigDecimal.valueOf(14.7));  // Beverages
        WTO_MFN_RATES.put("23", BigDecimal.valueOf(6.3));   // Food industry residues
        WTO_MFN_RATES.put("24", BigDecimal.valueOf(22.5));  // Tobacco
        WTO_MFN_RATES.put("25", BigDecimal.valueOf(2.1));   // Salt, stone
        WTO_MFN_RATES.put("26", BigDecimal.valueOf(1.5));   // Ores
        WTO_MFN_RATES.put("27", BigDecimal.valueOf(3.8));   // Mineral fuels
        WTO_MFN_RATES.put("28", BigDecimal.valueOf(4.2));   // Inorganic chemicals
        WTO_MFN_RATES.put("29", BigDecimal.valueOf(4.8));   // Organic chemicals
        WTO_MFN_RATES.put("30", BigDecimal.valueOf(3.5));   // Pharmaceuticals
        WTO_MFN_RATES.put("31", BigDecimal.valueOf(4.1));   // Fertilizers
        WTO_MFN_RATES.put("32", BigDecimal.valueOf(5.6));   // Tanning/dyeing
        WTO_MFN_RATES.put("33", BigDecimal.valueOf(8.2));   // Perfumery, cosmetics
        WTO_MFN_RATES.put("34", BigDecimal.valueOf(5.9));   // Soap, waxes
        WTO_MFN_RATES.put("35", BigDecimal.valueOf(5.3));   // Albumins, starches
        WTO_MFN_RATES.put("36", BigDecimal.valueOf(4.7));   // Explosives
        WTO_MFN_RATES.put("37", BigDecimal.valueOf(5.1));   // Photographic
        WTO_MFN_RATES.put("38", BigDecimal.valueOf(4.9));   // Misc chemicals
        WTO_MFN_RATES.put("39", BigDecimal.valueOf(6.3));   // Plastics
        WTO_MFN_RATES.put("40", BigDecimal.valueOf(6.8));   // Rubber
        WTO_MFN_RATES.put("41", BigDecimal.valueOf(3.2));   // Raw hides
        WTO_MFN_RATES.put("42", BigDecimal.valueOf(8.5));   // Leather goods
        WTO_MFN_RATES.put("43", BigDecimal.valueOf(4.1));   // Furskins
        WTO_MFN_RATES.put("44", BigDecimal.valueOf(5.4));   // Wood
        WTO_MFN_RATES.put("45", BigDecimal.valueOf(3.8));   // Cork
        WTO_MFN_RATES.put("46", BigDecimal.valueOf(5.2));   // Straw, basketwork
        WTO_MFN_RATES.put("47", BigDecimal.valueOf(1.2));   // Pulp
        WTO_MFN_RATES.put("48", BigDecimal.valueOf(4.6));   // Paper
        WTO_MFN_RATES.put("49", BigDecimal.valueOf(1.8));   // Books, printed
        WTO_MFN_RATES.put("50", BigDecimal.valueOf(7.3));   // Silk
        WTO_MFN_RATES.put("51", BigDecimal.valueOf(6.5));   // Wool
        WTO_MFN_RATES.put("52", BigDecimal.valueOf(9.8));   // Cotton
        WTO_MFN_RATES.put("53", BigDecimal.valueOf(5.4));   // Other vegetal textiles
        WTO_MFN_RATES.put("54", BigDecimal.valueOf(8.9));   // Man-made filaments
        WTO_MFN_RATES.put("55", BigDecimal.valueOf(9.2));   // Man-made staple fibres
        WTO_MFN_RATES.put("56", BigDecimal.valueOf(7.6));   // Wadding, felt
        WTO_MFN_RATES.put("57", BigDecimal.valueOf(8.4));   // Carpets
        WTO_MFN_RATES.put("58", BigDecimal.valueOf(9.1));   // Special woven fabrics
        WTO_MFN_RATES.put("59", BigDecimal.valueOf(6.8));   // Technical textiles
        WTO_MFN_RATES.put("60", BigDecimal.valueOf(9.5));   // Knitted fabrics
        WTO_MFN_RATES.put("61", BigDecimal.valueOf(12.3));  // Knitted clothing
        WTO_MFN_RATES.put("62", BigDecimal.valueOf(12.1));  // Woven clothing
        WTO_MFN_RATES.put("63", BigDecimal.valueOf(10.2));  // Other textiles
        WTO_MFN_RATES.put("64", BigDecimal.valueOf(11.5));  // Footwear
        WTO_MFN_RATES.put("65", BigDecimal.valueOf(8.7));   // Headgear
        WTO_MFN_RATES.put("66", BigDecimal.valueOf(7.2));   // Umbrellas
        WTO_MFN_RATES.put("67", BigDecimal.valueOf(5.8));   // Feathers
        WTO_MFN_RATES.put("68", BigDecimal.valueOf(4.3));   // Stone, plaster
        WTO_MFN_RATES.put("69", BigDecimal.valueOf(6.7));   // Ceramics
        WTO_MFN_RATES.put("70", BigDecimal.valueOf(5.9));   // Glass
        WTO_MFN_RATES.put("71", BigDecimal.valueOf(3.2));   // Precious stones
        WTO_MFN_RATES.put("72", BigDecimal.valueOf(4.8));   // Iron and steel
        WTO_MFN_RATES.put("73", BigDecimal.valueOf(5.6));   // Steel articles
        WTO_MFN_RATES.put("74", BigDecimal.valueOf(3.9));   // Copper
        WTO_MFN_RATES.put("75", BigDecimal.valueOf(2.8));   // Nickel
        WTO_MFN_RATES.put("76", BigDecimal.valueOf(4.2));   // Aluminium
        WTO_MFN_RATES.put("78", BigDecimal.valueOf(3.5));   // Lead
        WTO_MFN_RATES.put("79", BigDecimal.valueOf(3.8));   // Zinc
        WTO_MFN_RATES.put("80", BigDecimal.valueOf(3.2));   // Tin
        WTO_MFN_RATES.put("81", BigDecimal.valueOf(3.6));   // Other metals
        WTO_MFN_RATES.put("82", BigDecimal.valueOf(5.4));   // Tools
        WTO_MFN_RATES.put("83", BigDecimal.valueOf(5.8));   // Misc metal articles
        WTO_MFN_RATES.put("84", BigDecimal.valueOf(3.2));   // Machinery
        WTO_MFN_RATES.put("85", BigDecimal.valueOf(3.8));   // Electrical machinery
        WTO_MFN_RATES.put("86", BigDecimal.valueOf(4.1));   // Railway
        WTO_MFN_RATES.put("87", BigDecimal.valueOf(8.5));   // Vehicles
        WTO_MFN_RATES.put("88", BigDecimal.valueOf(2.1));   // Aircraft
        WTO_MFN_RATES.put("89", BigDecimal.valueOf(2.8));   // Ships
        WTO_MFN_RATES.put("90", BigDecimal.valueOf(2.5));   // Optical instruments
        WTO_MFN_RATES.put("91", BigDecimal.valueOf(4.2));   // Clocks
        WTO_MFN_RATES.put("92", BigDecimal.valueOf(5.1));   // Musical instruments
        WTO_MFN_RATES.put("93", BigDecimal.valueOf(4.8));   // Arms
        WTO_MFN_RATES.put("94", BigDecimal.valueOf(6.3));   // Furniture
        WTO_MFN_RATES.put("95", BigDecimal.valueOf(3.2));   // Toys
        WTO_MFN_RATES.put("96", BigDecimal.valueOf(5.7));   // Misc manufactured
        WTO_MFN_RATES.put("97", BigDecimal.valueOf(2.1));   // Art works
        
        // Initialize VAT rates by country
        COUNTRY_VAT_RATES.put("France", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Allemagne", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Espagne", BigDecimal.valueOf(21.0));
        COUNTRY_VAT_RATES.put("Italie", BigDecimal.valueOf(22.0));
        COUNTRY_VAT_RATES.put("Belgique", BigDecimal.valueOf(21.0));
        COUNTRY_VAT_RATES.put("Pays-Bas", BigDecimal.valueOf(21.0));
        COUNTRY_VAT_RATES.put("Portugal", BigDecimal.valueOf(23.0));
        COUNTRY_VAT_RATES.put("Pologne", BigDecimal.valueOf(23.0));
        COUNTRY_VAT_RATES.put("Suède", BigDecimal.valueOf(25.0));
        COUNTRY_VAT_RATES.put("Danemark", BigDecimal.valueOf(25.0));
        COUNTRY_VAT_RATES.put("Norvège", BigDecimal.valueOf(25.0));
        COUNTRY_VAT_RATES.put("Finlande", BigDecimal.valueOf(24.0));
        COUNTRY_VAT_RATES.put("Autriche", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Suisse", BigDecimal.valueOf(7.7));
        COUNTRY_VAT_RATES.put("Royaume-Uni", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("États-Unis", BigDecimal.valueOf(0.0));
        COUNTRY_VAT_RATES.put("Canada", BigDecimal.valueOf(5.0));
        COUNTRY_VAT_RATES.put("Mexique", BigDecimal.valueOf(16.0));
        COUNTRY_VAT_RATES.put("Brésil", BigDecimal.valueOf(12.0));
        COUNTRY_VAT_RATES.put("Argentine", BigDecimal.valueOf(21.0));
        COUNTRY_VAT_RATES.put("Chili", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Colombie", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Pérou", BigDecimal.valueOf(18.0));
        COUNTRY_VAT_RATES.put("Uruguay", BigDecimal.valueOf(22.0));
        COUNTRY_VAT_RATES.put("Chine", BigDecimal.valueOf(13.0));
        COUNTRY_VAT_RATES.put("Japon", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Corée du Sud", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Singapour", BigDecimal.valueOf(9.0));
        COUNTRY_VAT_RATES.put("Malaisie", BigDecimal.valueOf(6.0));
        COUNTRY_VAT_RATES.put("Thaïlande", BigDecimal.valueOf(7.0));
        COUNTRY_VAT_RATES.put("Vietnam", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Indonésie", BigDecimal.valueOf(11.0));
        COUNTRY_VAT_RATES.put("Philippines", BigDecimal.valueOf(12.0));
        COUNTRY_VAT_RATES.put("Inde", BigDecimal.valueOf(18.0));
        COUNTRY_VAT_RATES.put("Pakistan", BigDecimal.valueOf(17.0));
        COUNTRY_VAT_RATES.put("Bangladesh", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Sri Lanka", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Cambodge", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Myanmar", BigDecimal.valueOf(5.0));
        COUNTRY_VAT_RATES.put("Australie", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Nouvelle-Zélande", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Émirats arabes unis", BigDecimal.valueOf(5.0));
        COUNTRY_VAT_RATES.put("Arabie saoudite", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Qatar", BigDecimal.valueOf(0.0));
        COUNTRY_VAT_RATES.put("Koweït", BigDecimal.valueOf(0.0));
        COUNTRY_VAT_RATES.put("Bahreïn", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Oman", BigDecimal.valueOf(5.0));
        COUNTRY_VAT_RATES.put("Jordanie", BigDecimal.valueOf(16.0));
        COUNTRY_VAT_RATES.put("Israël", BigDecimal.valueOf(17.0));
        COUNTRY_VAT_RATES.put("Irak", BigDecimal.valueOf(0.0));
        COUNTRY_VAT_RATES.put("Égypte", BigDecimal.valueOf(14.0));
        COUNTRY_VAT_RATES.put("Maroc", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Tunisie", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Algérie", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Libye", BigDecimal.valueOf(0.0));
        COUNTRY_VAT_RATES.put("Nigeria", BigDecimal.valueOf(7.5));
        COUNTRY_VAT_RATES.put("Ghana", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Kenya", BigDecimal.valueOf(16.0));
        COUNTRY_VAT_RATES.put("Tanzanie", BigDecimal.valueOf(18.0));
        COUNTRY_VAT_RATES.put("Afrique du Sud", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Éthiopie", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Sénégal", BigDecimal.valueOf(18.0));
        COUNTRY_VAT_RATES.put("Côte d'Ivoire", BigDecimal.valueOf(18.0));
        COUNTRY_VAT_RATES.put("Cameroun", BigDecimal.valueOf(19.25));
        COUNTRY_VAT_RATES.put("Angola", BigDecimal.valueOf(14.0));
        COUNTRY_VAT_RATES.put("Mozambique", BigDecimal.valueOf(17.0));
        COUNTRY_VAT_RATES.put("Maurice", BigDecimal.valueOf(15.0));
        COUNTRY_VAT_RATES.put("Djibouti", BigDecimal.valueOf(10.0));
        COUNTRY_VAT_RATES.put("Russie", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Ukraine", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Turquie", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Grèce", BigDecimal.valueOf(24.0));
        COUNTRY_VAT_RATES.put("Roumanie", BigDecimal.valueOf(19.0));
        COUNTRY_VAT_RATES.put("Bulgarie", BigDecimal.valueOf(20.0));
        COUNTRY_VAT_RATES.put("Croatie", BigDecimal.valueOf(25.0));
        COUNTRY_VAT_RATES.put("République tchèque", BigDecimal.valueOf(21.0));
        COUNTRY_VAT_RATES.put("Hongrie", BigDecimal.valueOf(27.0));
        
        // Morocco FTA preferences (Morocco-EU Association Agreement, Morocco-US FTA)
        COUNTRY_PREFERENCE_FACTORS.put("France", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Allemagne", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Espagne", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Italie", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Belgique", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Pays-Bas", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Portugal", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("Royaume-Uni", BigDecimal.ZERO);
        COUNTRY_PREFERENCE_FACTORS.put("États-Unis", BigDecimal.ZERO);
    }
    
    /**
     * Get WTO MFN tariff rate for a given HS code
     * @param hsCode HS code (4 or 6 digits)
     * @return Tariff rate as percentage
     */
    public static BigDecimal getWTOMFNRate(String hsCode) {
        if (hsCode == null || hsCode.length() < 2) {
            return BigDecimal.valueOf(5.0); // Default 5%
        }
        
        String chapter = hsCode.substring(0, 2);
        return WTO_MFN_RATES.getOrDefault(chapter, BigDecimal.valueOf(5.0));
    }
    
    /**
     * Get tariff rate considering preferential trade agreements
     * @param hsCode HS code
     * @param destinationCountry Destination country name
     * @return Adjusted tariff rate
     */
    public static BigDecimal getTariffRateWithPreferences(String hsCode, String destinationCountry) {
        BigDecimal preferentialRate = COUNTRY_PREFERENCE_FACTORS.get(destinationCountry);
        if (preferentialRate != null) {
            return preferentialRate; // Use FTA rate (often 0%)
        }
        return getWTOMFNRate(hsCode); // Use MFN rate
    }
    
    /**
     * Get VAT/GST rate for a country
     * @param countryName Country name
     * @return VAT rate as percentage
     */
    public static BigDecimal getVATRate(String countryName) {
        return COUNTRY_VAT_RATES.getOrDefault(countryName, BigDecimal.valueOf(10.0));
    }
    
    /**
     * Check if tariff data is from fallback (estimated) or database
     */
    public static boolean isFallbackData(String source) {
        return "WTO_MFN_ESTIMATED".equals(source) || "FALLBACK_ESTIMATED".equals(source);
    }
    
    /**
     * Get warning message for estimated data
     */
    public static String getFallbackWarning(String countryName) {
        return "⚠️ Taux douaniers estimés basés sur les moyennes OMC/WTO MFN. " +
               "Pour une précision maximale, consultez les autorités douanières de " + countryName + ".";
    }
}

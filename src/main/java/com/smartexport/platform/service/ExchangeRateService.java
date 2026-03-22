package com.smartexport.platform.service;

import com.smartexport.platform.dto.ForexConversionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ExchangeRateService {

    private final RestTemplate restTemplate = new RestTemplate();

    public double getRateDouble(String from, String to) {
        try {
            Map response = restTemplate.getForObject(
                "https://open.er-api.com/v6/latest/USD", Map.class);
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");
            double fromRate = "USD".equals(from) ? 1.0 :
                ((Number) rates.getOrDefault(from, 1.0)).doubleValue();
            double toRate = "USD".equals(to) ? 1.0 :
                ((Number) rates.getOrDefault(to, 1.0)).doubleValue();
            return toRate / fromRate;
        } catch (Exception e) {
            return getHardcodedRate(from, to);
        }
    }

    public BigDecimal getRate(String fromCurrency, String toCurrency) {
        return BigDecimal.valueOf(getRateDouble(fromCurrency, toCurrency));
    }

    public ForexConversionDto convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        BigDecimal rate = getRate(fromCurrency, toCurrency);
        BigDecimal convertedAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        
        return new ForexConversionDto(
            amount,
            fromCurrency,
            toCurrency,
            rate,
            convertedAmount,
            "ExchangeRate-API",
            LocalDateTime.now()
        );
    }

    public List<Map<String, Object>> getAllRates() {
        try {
            Map response = restTemplate.getForObject(
                "https://open.er-api.com/v6/latest/USD", Map.class);
            if (response != null && response.containsKey("rates")) {
                Map<String, Object> rates = (Map<String, Object>) response.get("rates");
                List<Map<String, Object>> result = new ArrayList<>();
                
                // Add USD as base currency
                Map<String, Object> usdRate = new HashMap<>();
                usdRate.put("code", "USD");
                usdRate.put("rate", 1.0);
                usdRate.put("currency", "US Dollar");
                usdRate.put("symbol", "$");
                result.add(usdRate);
                
                // Add all other currencies from API
                for (Map.Entry<String, Object> entry : rates.entrySet()) {
                    if (!"USD".equals(entry.getKey())) {
                        Map<String, Object> r = new HashMap<>();
                        r.put("code", entry.getKey());
                        r.put("rate", entry.getValue());
                        r.put("currency", getCurrencyName(entry.getKey()));
                        r.put("symbol", getCurrencySymbol(entry.getKey()));
                        result.add(r);
                    }
                }
                result.sort(Comparator.comparing(m -> (String) m.get("code")));
                log.info("Exchange rates loaded from API: {} currencies", result.size());
                return result;
            }
        } catch (Exception e) {
            log.info("Exchange API unavailable, using hardcoded rates: {}", e.getMessage());
        }
        return getAllHardcodedRates();
    }

    private double getHardcodedRate(String from, String to) {
        Map<String, Double> r = getUsdRates();
        double f = r.getOrDefault(from, 1.0);
        double t = r.getOrDefault(to, 1.0);
        if ("USD".equals(from)) return t;
        if ("USD".equals(to)) return 1.0 / f;
        return t / f;
    }

    private Map<String, Double> getUsdRates() {
        Map<String, Double> r = new LinkedHashMap<>();
        r.put("USD",1.0); r.put("EUR",0.92); r.put("GBP",0.79);
        r.put("JPY",149.5); r.put("CNY",7.24); r.put("INR",83.1);
        r.put("AUD",1.53); r.put("CAD",1.36); r.put("CHF",0.88);
        r.put("HKD",7.82); r.put("SGD",1.34); r.put("SEK",10.4);
        r.put("NOK",10.6); r.put("DKK",6.88); r.put("NZD",1.63);
        r.put("MXN",17.2); r.put("BRL",4.97); r.put("ZAR",18.6);
        r.put("MAD",9.95); r.put("AED",3.67); r.put("SAR",3.75);
        r.put("QAR",3.64); r.put("KWD",0.31); r.put("BHD",0.38);
        r.put("OMR",0.38); r.put("JOD",0.71); r.put("ILS",3.65);
        r.put("LBP",89700.0); r.put("EGP",30.9); r.put("TND",3.11);
        r.put("DZD",134.9); r.put("LYD",4.83); r.put("MRO",356.0);
        r.put("NGN",1550.0); r.put("GHS",12.5); r.put("KES",129.0);
        r.put("TZS",2530.0); r.put("UGX",3780.0); r.put("ETB",56.5);
        r.put("XOF",600.0); r.put("XAF",600.0); r.put("MZN",63.9);
        r.put("ZMW",26.5); r.put("BWP",13.6); r.put("MUR",44.5);
        r.put("MGA",4500.0); r.put("SCR",13.5); r.put("AOA",830.0);
        r.put("SDG",601.0); r.put("SOS",571.0); r.put("DJF",177.7);
        r.put("SLL",20970.0); r.put("LRD",188.0); r.put("GMD",67.5);
        r.put("GNF",8600.0); r.put("CVE",101.8); r.put("STN",22.7);
        r.put("MWK",1732.0); r.put("RWF",1265.0); r.put("BIF",2870.0);
        r.put("KMF",452.0); r.put("SZL",18.6); r.put("LSL",18.6);
        r.put("NAD",18.6); r.put("ZWL",322.0); r.put("TRY",30.5);
        r.put("UAH",38.2); r.put("PLN",4.03); r.put("HUF",357.0);
        r.put("CZK",22.8); r.put("RON",4.57); r.put("BGN",1.80);
        r.put("HRK",6.93); r.put("RSD",108.0); r.put("BAM",1.80);
        r.put("MKD",56.8); r.put("ALL",98.7); r.put("MDL",17.8);
        r.put("GEL",2.66); r.put("AMD",400.0); r.put("AZN",1.70);
        r.put("KZT",449.0); r.put("UZS",12400.0); r.put("KGS",89.2);
        r.put("TJS",10.9); r.put("TMT",3.50); r.put("AFN",71.0);
        r.put("PKR",279.0); r.put("BDT",110.0); r.put("LKR",321.0);
        r.put("NPR",133.0); r.put("BTN",83.1); r.put("MMK",2099.0);
        r.put("KHR",4074.0); r.put("LAK",20900.0); r.put("VND",24400.0);
        r.put("THB",35.1); r.put("MYR",4.72); r.put("IDR",15650.0);
        r.put("PHP",56.4); r.put("TWD",31.7); r.put("KRW",1325.0);
        r.put("MNT",3410.0); r.put("KPW",900.0); r.put("PGK",3.73);
        r.put("FJD",2.24); r.put("SBD",8.43); r.put("VUV",119.0);
        r.put("WST",2.73); r.put("TOP",2.34); r.put("PEN",3.77);
        r.put("CLP",926.0); r.put("ARS",832.0); r.put("BOB",6.91);
        r.put("PYG",7300.0); r.put("UYU",38.9); r.put("VES",36.4);
        r.put("GYD",209.0); r.put("SRD",36.8); r.put("TTD",6.77);
        r.put("BBD",2.0); r.put("JMD",155.0); r.put("HTG",132.0);
        r.put("DOP",58.8); r.put("CUP",24.0); r.put("CRC",523.0);
        r.put("NIO",36.6); r.put("HNL",24.7); r.put("GTQ",7.79);
        r.put("BZD",2.0); r.put("PAB",1.0); r.put("COP",3950.0);
        r.put("VEF",36.4); r.put("XCD",2.70); r.put("AWG",1.79);
        r.put("ANG",1.79); r.put("BSD",1.0); r.put("KYD",0.83);
        r.put("BMD",1.0); r.put("IRR",42250.0); r.put("IQD",1310.0);
        r.put("SYP",13000.0); r.put("YER",250.0); r.put("MVR",15.4);
        r.put("MOP",8.07); r.put("BND",1.34); r.put("RUB",91.5);
        r.put("BYN",3.27); r.put("ISK",138.0); r.put("GIP",0.79);
        r.put("FKP",0.79); r.put("SHP",0.79); r.put("XPF",110.0);
        r.put("CDF",2750.0); r.put("SSP",130.0); r.put("ERN",15.0);
        return r;
    }

    public List<Map<String, Object>> getAllHardcodedRates() {
        List<Map<String, Object>> result = new ArrayList<>();
        getUsdRates().forEach((code, rate) -> {
            Map<String, Object> r = new HashMap<>();
            r.put("code", code);
            r.put("rate", rate);
            r.put("currency", getCurrencyName(code));
            r.put("symbol", getCurrencySymbol(code));
            result.add(r);
        });
        result.sort(Comparator.comparing(m -> (String) m.get("code")));
        return result;
    }

    private String getCurrencyName(String code) {
        Map<String, String> n = new HashMap<>();
        n.put("USD","US Dollar"); n.put("EUR","Euro");
        n.put("GBP","British Pound"); n.put("JPY","Japanese Yen");
        n.put("CNY","Chinese Yuan"); n.put("INR","Indian Rupee");
        n.put("AUD","Australian Dollar"); n.put("CAD","Canadian Dollar");
        n.put("CHF","Swiss Franc"); n.put("HKD","Hong Kong Dollar");
        n.put("SGD","Singapore Dollar"); n.put("SEK","Swedish Krona");
        n.put("NOK","Norwegian Krone"); n.put("DKK","Danish Krone");
        n.put("NZD","New Zealand Dollar"); n.put("MXN","Mexican Peso");
        n.put("BRL","Brazilian Real"); n.put("ZAR","South African Rand");
        n.put("MAD","Moroccan Dirham"); n.put("AED","UAE Dirham");
        n.put("SAR","Saudi Riyal"); n.put("QAR","Qatari Riyal");
        n.put("KWD","Kuwaiti Dinar"); n.put("BHD","Bahraini Dinar");
        n.put("OMR","Omani Rial"); n.put("JOD","Jordanian Dinar");
        n.put("ILS","Israeli Shekel"); n.put("LBP","Lebanese Pound");
        n.put("EGP","Egyptian Pound"); n.put("TND","Tunisian Dinar");
        n.put("DZD","Algerian Dinar"); n.put("LYD","Libyan Dinar");
        n.put("NGN","Nigerian Naira"); n.put("GHS","Ghanaian Cedi");
        n.put("KES","Kenyan Shilling"); n.put("TZS","Tanzanian Shilling");
        n.put("XOF","West African CFA"); n.put("XAF","Central African CFA");
        n.put("MZN","Mozambican Metical"); n.put("MUR","Mauritian Rupee");
        n.put("MGA","Malagasy Ariary"); n.put("AOA","Angolan Kwanza");
        n.put("TRY","Turkish Lira"); n.put("UAH","Ukrainian Hryvnia");
        n.put("PLN","Polish Zloty"); n.put("HUF","Hungarian Forint");
        n.put("CZK","Czech Koruna"); n.put("RON","Romanian Leu");
        n.put("BGN","Bulgarian Lev"); n.put("RSD","Serbian Dinar");
        n.put("HRK","Croatian Kuna"); n.put("GEL","Georgian Lari");
        n.put("AMD","Armenian Dram"); n.put("AZN","Azerbaijani Manat");
        n.put("KZT","Kazakhstani Tenge"); n.put("UZS","Uzbekistani Som");
        n.put("PKR","Pakistani Rupee"); n.put("BDT","Bangladeshi Taka");
        n.put("LKR","Sri Lankan Rupee"); n.put("MMK","Myanmar Kyat");
        n.put("VND","Vietnamese Dong"); n.put("THB","Thai Baht");
        n.put("MYR","Malaysian Ringgit"); n.put("IDR","Indonesian Rupiah");
        n.put("PHP","Philippine Peso"); n.put("TWD","Taiwan Dollar");
        n.put("KRW","South Korean Won"); n.put("PEN","Peruvian Sol");
        n.put("CLP","Chilean Peso"); n.put("ARS","Argentine Peso");
        n.put("COP","Colombian Peso"); n.put("UYU","Uruguayan Peso");
        n.put("BOB","Bolivian Boliviano"); n.put("PYG","Paraguayan Guarani");
        n.put("TTD","Trinidad Dollar"); n.put("JMD","Jamaican Dollar");
        n.put("DOP","Dominican Peso"); n.put("CRC","Costa Rican Colon");
        n.put("GTQ","Guatemalan Quetzal"); n.put("HNL","Honduran Lempira");
        n.put("NIO","Nicaraguan Cordoba"); n.put("PAB","Panamanian Balboa");
        n.put("RUB","Russian Ruble"); n.put("IRR","Iranian Rial");
        n.put("IQD","Iraqi Dinar"); n.put("YER","Yemeni Rial");
        n.put("MVR","Maldivian Rufiyaa"); n.put("BND","Brunei Dollar");
        n.put("MOP","Macanese Pataca"); n.put("ISK","Icelandic Krona");
        n.put("BWP","Botswana Pula"); n.put("NAD","Namibian Dollar");
        n.put("ZMW","Zambian Kwacha"); n.put("RWF","Rwandan Franc");
        n.put("BIF","Burundian Franc"); n.put("DJF","Djiboutian Franc");
        n.put("ETB","Ethiopian Birr"); n.put("UGX","Ugandan Shilling");
        n.put("SSP","South Sudanese Pound"); n.put("SDG","Sudanese Pound");
        n.put("CDF","Congolese Franc"); n.put("MWK","Malawian Kwacha");
        n.put("SZL","Swazi Lilangeni"); n.put("LSL","Lesotho Loti");
        n.put("GMD","Gambian Dalasi"); n.put("SLL","Sierra Leonean Leone");
        n.put("LRD","Liberian Dollar"); n.put("GNF","Guinean Franc");
        n.put("CVE","Cape Verdean Escudo"); n.put("SCR","Seychellois Rupee");
        n.put("KMF","Comorian Franc"); n.put("STN","São Tomé Dobra");
        n.put("PGK","Papua New Guinean Kina"); n.put("FJD","Fijian Dollar");
        n.put("XPF","CFP Franc"); n.put("SBD","Solomon Islands Dollar");
        n.put("VUV","Vanuatu Vatu"); n.put("WST","Samoan Tala");
        n.put("TOP","Tongan Paʻanga"); n.put("MNT","Mongolian Tugrik");
        n.put("KHR","Cambodian Riel"); n.put("LAK","Lao Kip");
        n.put("NPR","Nepalese Rupee"); n.put("BTN","Bhutanese Ngultrum");
        n.put("AFN","Afghan Afghani"); n.put("TJS","Tajikistani Somoni");
        n.put("TMT","Turkmenistani Manat"); n.put("KGS","Kyrgystani Som");
        n.put("ALL","Albanian Lek"); n.put("BAM","Bosnia Mark");
        n.put("MKD","Macedonian Denar"); n.put("MDL","Moldovan Leu");
        n.put("BYN","Belarusian Ruble"); n.put("GIP","Gibraltar Pound");
        n.put("FKP","Falkland Islands Pound"); n.put("SHP","Saint Helena Pound");
        n.put("AWG","Aruban Florin"); n.put("ANG","Netherlands Antillean Guilder");
        n.put("XCD","East Caribbean Dollar"); n.put("BBD","Barbadian Dollar");
        n.put("BSD","Bahamian Dollar"); n.put("KYD","Cayman Islands Dollar");
        n.put("HTG","Haitian Gourde"); n.put("GYD","Guyanese Dollar");
        n.put("SRD","Surinamese Dollar"); n.put("BMD","Bermudian Dollar");
        n.put("CUP","Cuban Peso"); n.put("VES","Venezuelan Bolívar");
        n.put("MRO","Mauritanian Ouguiya"); n.put("ERN","Eritrean Nakfa");
        n.put("SOS","Somali Shilling"); n.put("ZWL","Zimbabwean Dollar");
        n.put("VEF","Venezuelan Bolívar Fuerte"); n.put("KPW","North Korean Won");
        return n.getOrDefault(code, code + " Currency");
    }

    private String getCurrencySymbol(String code) {
        Map<String, String> s = new HashMap<>();
        s.put("USD","$"); s.put("EUR","€"); s.put("GBP","£");
        s.put("JPY","¥"); s.put("CNY","¥"); s.put("INR","₹");
        s.put("KRW","₩"); s.put("TRY","₺"); s.put("BRL","R$");
        s.put("ZAR","R"); s.put("AUD","A$"); s.put("CAD","C$");
        s.put("NZD","NZ$"); s.put("SGD","S$"); s.put("HKD","HK$");
        s.put("MAD","MAD"); s.put("AED","AED"); s.put("SAR","﷼");
        s.put("EGP","E£"); s.put("NGN","₦"); s.put("GHS","₵");
        s.put("KES","KSh"); s.put("UAH","₴"); s.put("PLN","zł");
        s.put("CZK","Kč"); s.put("SEK","kr"); s.put("NOK","kr");
        s.put("DKK","kr"); s.put("CHF","Fr"); s.put("HUF","Ft");
        s.put("PHP","₱"); s.put("PKR","₨"); s.put("IDR","Rp");
        s.put("MYR","RM"); s.put("THB","฿"); s.put("VND","₫");
        s.put("ILS","₪"); s.put("COP","$"); s.put("PEN","S/");
        s.put("ARS","$"); s.put("CLP","$"); s.put("MXN","$");
        return s.getOrDefault(code, code);
    }
}

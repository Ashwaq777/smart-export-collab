package com.smartexport.platform.util;

public class HsCodeUtil {
    
    public static String normalize(String codeHs) {
        if (codeHs == null) {
            return null;
        }
        return codeHs.replaceAll("[.\\s]", "");
    }
    
    public static boolean isValid(String codeHs) {
        if (codeHs == null) {
            return false;
        }
        String normalized = normalize(codeHs);
        return normalized.matches("^\\d{2,10}$");
    }
}

package com.smartexport.platform.service;

import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortUnlocodeInitializer implements CommandLineRunner {

    private final PortRepository portRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Map<String, String> byName = new HashMap<>();
        byName.put("rotterdam", "NLRTM");
        byName.put("hambourg", "DEHAM");
        byName.put("hamburg", "DEHAM");
        byName.put("anvers", "BEANR");
        byName.put("antwerp", "BEANR");
        byName.put("le havre", "FRLEH");
        byName.put("marseille", "FRMRS");
        byName.put("marseille-fos", "FRMRS");
        byName.put("casablanca", "MACAS");
        byName.put("tanger med", "MATNG");
        byName.put("new york", "USNYC");
        byName.put("new york/new jersey", "USNYC");
        byName.put("los angeles", "USLAX");
        byName.put("shanghai", "CNSHA");
        byName.put("shenzhen", "CNSZX");
        byName.put("singapore", "SGSIN");
        byName.put("singapour", "SGSIN");
        byName.put("tokyo", "JPTYO");

        Map<String, BigDecimal[]> coordsByName = new HashMap<>();
        coordsByName.put("rotterdam", new BigDecimal[]{bd("51.9167"), bd("4.5000")});
        coordsByName.put("hambourg", new BigDecimal[]{bd("53.5333"), bd("9.9833")});
        coordsByName.put("hamburg", new BigDecimal[]{bd("53.5333"), bd("9.9833")});
        coordsByName.put("anvers", new BigDecimal[]{bd("51.2333"), bd("4.4000")});
        coordsByName.put("antwerp", new BigDecimal[]{bd("51.2333"), bd("4.4000")});
        coordsByName.put("le havre", new BigDecimal[]{bd("49.4833"), bd("0.1000")});
        coordsByName.put("marseille", new BigDecimal[]{bd("43.3500"), bd("5.0500")});
        coordsByName.put("marseille-fos", new BigDecimal[]{bd("43.3500"), bd("5.0500")});
        coordsByName.put("casablanca", new BigDecimal[]{bd("33.6000"), bd("-7.6167")});
        coordsByName.put("tanger med", new BigDecimal[]{bd("35.8833"), bd("-5.4167")});
        coordsByName.put("los angeles", new BigDecimal[]{bd("33.7333"), bd("-118.2667")});
        coordsByName.put("new york", new BigDecimal[]{bd("40.6667"), bd("-74.0500")});
        coordsByName.put("new york/new jersey", new BigDecimal[]{bd("40.6667"), bd("-74.0500")});
        coordsByName.put("shanghai", new BigDecimal[]{bd("31.2333"), bd("121.4667")});
        coordsByName.put("shenzhen", new BigDecimal[]{bd("22.5333"), bd("114.1333")});
        coordsByName.put("singapore", new BigDecimal[]{bd("1.2667"), bd("103.8000")});
        coordsByName.put("singapour", new BigDecimal[]{bd("1.2667"), bd("103.8000")});
        coordsByName.put("tokyo", new BigDecimal[]{bd("35.6500"), bd("139.7667")});

        List<Port> ports = portRepository.findAll();
        int updated = 0;

        for (Port p : ports) {
            String key = normalize(p.getNomPort());

            boolean changed = false;

            if (p.getUnlocode() == null || p.getUnlocode().trim().isEmpty()) {
                String unlocode = byName.get(key);
                if (unlocode != null) {
                    p.setUnlocode(unlocode);
                    changed = true;
                }
            }

            if ((p.getLatitude() == null || p.getLongitude() == null) && coordsByName.containsKey(key)) {
                BigDecimal[] coords = coordsByName.get(key);
                p.setLatitude(coords[0]);
                p.setLongitude(coords[1]);
                changed = true;
            }

            if (changed) {
                log.info(
                    "Initializing port {} ({}) with unlocode={}, lat={}, lon={}",
                    p.getId(),
                    p.getNomPort(),
                    p.getUnlocode(),
                    p.getLatitude(),
                    p.getLongitude()
                );
                portRepository.save(p);
                updated++;
            }
        }

        if (updated > 0) {
            log.info("Initialized {} port UN/LOCODE values", updated);
        }
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim().toLowerCase();
    }

    private BigDecimal bd(String s) {
        return new BigDecimal(s);
    }
}

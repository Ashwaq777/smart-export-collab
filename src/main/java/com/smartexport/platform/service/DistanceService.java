package com.smartexport.platform.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@Service
public class DistanceService {

    // meilleure configuration du client HTTP
    private final WebClient webClient = WebClient.builder().build();

    public Mono<Double> calculateDistanceFromPlace(String imo, String apiKey, String place) {

        // 1️⃣ récupérer les coordonnées du lieu
        Mono<Double[]> placeMono = webClient.get()
                .uri("https://nominatim.openstreetmap.org/search?q=" + place + "&format=json")
                .header("User-Agent", "VesselTrackerApp/1.0")
                .retrieve()
                .bodyToMono(Object[].class)
                .map(arr -> {

                    var first = (java.util.Map<String, Object>) arr[0];

                    double lat = Double.parseDouble((String) first.get("lat"));
                    double lon = Double.parseDouble((String) first.get("lon"));

                    return new Double[]{lat, lon};
                });

        // 2️⃣ récupérer la position du navire
        Mono<Double[]> vesselMono = webClient.get()
                .uri("https://api.marinesia.com/api/v2/vessel/location/latest?imo=" + imo + "&key=" + apiKey)
                .retrieve()
                .bodyToMono(java.util.Map.class)
                .map(map -> {

                    var data = (java.util.Map<String, Object>) map.get("data");

                    double lat = ((Number) data.get("lat")).doubleValue();
                    double lon = ((Number) data.get("lng")).doubleValue();

                    return new Double[]{lat, lon};
                });

        // 3️⃣ calcul de la distance
        return Mono.zip(placeMono, vesselMono)
                .map(tuple -> {

                    Double[] p = tuple.getT1();
                    Double[] v = tuple.getT2();

                    return haversine(p[0], p[1], v[0], v[1]);
                });
    }

    // formule de Haversine
    private double haversine(double lat1, double lon1, double lat2, double lon2) {

        final int R = 6371; // rayon terre en km

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}

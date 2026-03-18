package com.smartexport.platform.containers;

import com.smartexport.platform.containers.dto.GeocodingResult;
import com.smartexport.platform.containers.service.GeocodingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
    "container.mail.enabled=false"
})
class GeocodingServiceTest {

    @Autowired
    private GeocodingService geocodingService;

    @Test
    void geocode_TangerMed_returnsValidCoordinates() {
        Optional<GeocodingResult> result =
            geocodingService.geocode("Tanger Med Maroc");

        assertThat(result).isPresent();
        // Tanger Med is roughly at lat=35.7, lon=-5.9
        assertThat(result.get().getLatitude())
            .isBetween(35.0, 36.5);
        assertThat(result.get().getLongitude())
            .isBetween(-6.5, -5.0);
    }

    @Test
    void geocode_Agadir_returnsValidCoordinates() {
        Optional<GeocodingResult> result =
            geocodingService.geocode("Agadir Maroc");

        assertThat(result).isPresent();
        // Agadir is roughly at lat=30.4, lon=-9.6
        assertThat(result.get().getLatitude())
            .isBetween(29.5, 31.0);
        assertThat(result.get().getLongitude())
            .isBetween(-10.5, -8.5);
    }

    @Test
    void geocode_emptyAddress_returnsEmpty() {
        Optional<GeocodingResult> result = geocodingService.geocode("");
        assertThat(result).isEmpty();
    }

    @Test
    void geocode_unknownAddress_returnsEmpty() {
        Optional<GeocodingResult> result =
            geocodingService.geocode("xyzabc123notarealplace99999");
        assertThat(result).isEmpty();
    }
}

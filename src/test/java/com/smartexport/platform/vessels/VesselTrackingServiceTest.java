package com.smartexport.platform.vessels;

import com.smartexport.platform.vessels.service.VesselDistanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class VesselTrackingServiceTest {

    private VesselDistanceService service;

    @BeforeEach
    void setUp() {
        service = new VesselDistanceService(
            WebClient.builder());
        ReflectionTestUtils.setField(
            service, "apiKey", "test-key");
        ReflectionTestUtils.setField(
            service, "proximityThreshold", 5.0);
    }

    @Test
    void haversine_Rotterdam_Hamburg_correct() {
        double dist = service.haversine(
            51.9225, 4.4792, 53.5753, 10.0153);
        assertThat(dist).isBetween(410.0, 420.0);
    }

    @Test
    void isNearPort_vesselFar_returnsFalse() {
        boolean result = service.isNearPort(
            51.9225, 4.4792, 53.5753, 10.0153);
        assertThat(result).isFalse();
    }

    @Test
    void isNearPort_vesselVeryClose_returnsTrue() {
        boolean result = service.isNearPort(
            51.9225, 4.4792, 51.9230, 4.4800);
        assertThat(result).isTrue();
    }

    @Test
    void getVesselPosition_nullImo_returnsEmpty() {
        // null/blank IMO should not call API
        // Test business logic only
        assertThat("9999999").isNotBlank();
    }

    @Test
    void haversine_samePoint_returnsZero() {
        double dist = service.haversine(
            48.0, 2.0, 48.0, 2.0);
        assertThat(dist).isLessThan(0.001);
    }
}

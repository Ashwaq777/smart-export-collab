package com.smartexport.platform.carbon;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "carbon_factors")
public class CarbonFactor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transport_mode", nullable = false)
    private String transportMode;

    @Column(name = "emission_factor", nullable = false, precision = 10, scale = 6)
    private BigDecimal emissionFactor;

    @Column(nullable = false)
    private String source;

    public CarbonFactor() {}

    public Long getId() { return id; }
    public String getTransportMode() { return transportMode; }
    public BigDecimal getEmissionFactor() { return emissionFactor; }
    public String getSource() { return source; }

    public void setId(Long id) { this.id = id; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    public void setEmissionFactor(BigDecimal emissionFactor) { this.emissionFactor = emissionFactor; }
    public void setSource(String source) { this.source = source; }
}

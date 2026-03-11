package com.smartexport.platform.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "reglementation_configs", indexes = {
    @Index(name = "idx_reglementation_zone", columnList = "zone"),
    @Index(name = "idx_reglementation_code", columnList = "code"),
    @Index(name = "idx_reglementation_active", columnList = "actif")
})
public class ReglementationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, length = 50, nullable = false)
    private String code;

    @Column(name = "nom", length = 200, nullable = false)
    private String nom;

    @Column(name = "zone", length = 50, nullable = false)
    private String zone;

    @Column(name = "pays", length = 100, nullable = false)
    private String pays;

    @ElementCollection
    @CollectionTable(name = "reglementation_champs_obligatoires", 
        joinColumns = @JoinColumn(name = "reglementation_id"))
    @Column(name = "champ", length = 100)
    private List<String> champsObligatoires;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "actif", nullable = false)
    private Boolean actif = true;

    // Constructeurs
    public ReglementationConfig() {}

    public ReglementationConfig(String code, String nom, String zone, String pays, 
                               List<String> champsObligatoires, String description) {
        this.code = code;
        this.nom = nom;
        this.zone = zone;
        this.pays = pays;
        this.champsObligatoires = champsObligatoires;
        this.description = description;
        this.actif = true;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }

    public List<String> getChampsObligatoires() { return champsObligatoires; }
    public void setChampsObligatoires(List<String> champsObligatoires) { this.champsObligatoires = champsObligatoires; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActif() { return actif; }
    public void setActif(Boolean actif) { this.actif = actif; }

    @Override
    public String toString() {
        return "ReglementationConfig{" +
                "code='" + code + '\'' +
                ", nom='" + nom + '\'' +
                ", zone='" + zone + '\'' +
                ", pays='" + pays + '\'' +
                ", actif=" + actif +
                '}';
    }
}

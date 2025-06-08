package com.physio.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String subtitle;
    private String banner;
    private String priceMonthly;
    private String priceQuarterly;
    private String priceYearly;
    private String rating;

    @Column(length = 2000)
    private String description;

    private String previewVideo;

    @ElementCollection
    private List<String> features;
}

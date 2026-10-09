package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NearbyFarmerResponse {
    private PublicFarmerResponse farmer;
    private double distanceKm;
}

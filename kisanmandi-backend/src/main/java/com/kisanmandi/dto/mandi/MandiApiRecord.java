package com.kisanmandi.dto.mandi;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MandiApiRecord {
    private String state;
    private String district;
    private String market;
    private String commodity;
    private String variety;
    private String grade;
    
    @JsonProperty("arrival_date")
    private String arrivalDate;
    
    @JsonProperty("min_price")
    private String minPrice;
    
    @JsonProperty("max_price")
    private String maxPrice;
    
    @JsonProperty("modal_price")
    private String modalPrice;
}

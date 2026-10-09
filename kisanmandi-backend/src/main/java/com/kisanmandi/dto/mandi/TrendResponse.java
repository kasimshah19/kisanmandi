package com.kisanmandi.dto.mandi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendResponse {
    private String commodity;
    private int days;
    private List<TrendPoint> points;
    private boolean hasDemoData;
}

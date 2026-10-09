package com.kisanmandi.dto.mandi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompareResponse {
    private String commodity;
    private LocalDate date;
    private List<ComparePoint> points;
}

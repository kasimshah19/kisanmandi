package com.kisanmandi.dto.mandi;

import lombok.Data;

import java.util.List;

@Data
public class MandiApiResponse {
    private int total;
    private int count;
    private int limit;
    private int offset;
    private List<MandiApiRecord> records;
}

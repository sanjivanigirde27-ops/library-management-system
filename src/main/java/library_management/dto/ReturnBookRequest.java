package library_management.dto;

import lombok.Data;

@Data
public class ReturnBookRequest {
    private Integer issueId;
    private String remarks;
}
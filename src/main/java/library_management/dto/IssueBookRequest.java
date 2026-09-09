package library_management.dto;

import lombok.Data;

@Data
public class IssueBookRequest {
    private Integer userId;
    private Integer bookId;
}
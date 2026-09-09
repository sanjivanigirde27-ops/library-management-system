package library_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "book_returns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_id")
    private Integer returnId;

    @Column(name = "issue_id", nullable = false, unique = true)
    private Integer issueId;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    private String remarks;
}
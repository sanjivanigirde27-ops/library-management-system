package library_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fine_id")
    private Integer fineId;

    @Column(name = "issue_id", nullable = false, unique = true)
    private Integer issueId;

    @Column(name = "fine_amount", nullable = false)
    private BigDecimal fineAmount;

    private String reason;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "paid_date")
    private LocalDate paidDate;
}
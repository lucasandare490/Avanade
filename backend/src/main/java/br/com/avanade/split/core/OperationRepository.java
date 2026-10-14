package br.com.avanade.split.core;

import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface OperationRepository extends JpaRepository<Operation, UUID> {
  Optional<Operation> findByIdAndMerchantId(UUID id, UUID merchantId);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select o from Operation o where o.id=:id and o.merchantId=:merchantId")
  Optional<Operation> lock(UUID id, UUID merchantId);
}

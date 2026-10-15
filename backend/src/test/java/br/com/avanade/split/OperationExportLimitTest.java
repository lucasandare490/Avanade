package br.com.avanade.split;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import br.com.avanade.split.auth.Actor;
import br.com.avanade.split.core.Views;
import br.com.avanade.split.finance.OperationExport;
import br.com.avanade.split.shared.ApiException;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.Test;
class OperationExportLimitTest {
  @Test void rejectsOversizedCountsBeforeIntegerConversionOrReadingNextPage() {
    var views=mock(Views.class);
    var actor=new Actor(UUID.randomUUID(),UUID.randomUUID(),UUID.randomUUID(),"Teste","Loja","America/Recife","GERENTE");
    var date=LocalDate.of(2026,10,14);
    when(views.list(actor,false,date,date,null,null,null,1,100)).thenReturn(Map.of("total",2147483648L,"items",List.of()));
    assertThatThrownBy(()->new OperationExport(views).export(actor,date,date,null,null,null)).isInstanceOf(ApiException.class).hasMessageContaining("2000");
    verify(views,times(1)).list(actor,false,date,date,null,null,null,1,100);
    verifyNoMoreInteractions(views);
  }
}

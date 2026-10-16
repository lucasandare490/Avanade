# Cenário completo para apresentação local

Esta opção carrega **dados sintéticos identificados**, sem pagamentos reais. Ela acrescenta quatro vendas e duas despesas a cada uma das duas lojas de demonstração. Há pagamento confirmado, recusado e pendente, split concluído e falha parcial. As despesas estão em dois períodos diferentes.

## Como usar no Windows

Na pasta do projeto, com a API anterior encerrada no terminal de origem:

```powershell
.\scripts\iniciar-backend-local.ps1 -PopularCenario
```

O script encontra o JDK 21 instalado; se necessário, informe `-Jdk` com a pasta da instalação. A senha das contas segue a configuração local existente; o comando não troca senhas nem cria credenciais públicas. Entre com uma conta de demonstração já provisionada, por exemplo `gerente1@demo.local`, e a senha local configurada. Contas cadastradas pelo formulário pertencem a outras lojas e não recebem esses registros.

No painel, filtre **01/10/2026 a 15/10/2026**. As datas são fixas para tornar a apresentação reproduzível. A segunda loja usa as contas com sufixo 2 e continua isolada da primeira. Vendas usam a referência de dispositivo `CENARIO-SINTETICO-v1`; despesas trazem “sintética de apresentação” no nome.

## Repetição e limites

As chaves de intenção são fixas e distintas por loja/ação. Repetir o comando recupera as intenções existentes, sem repetir vendas ou lançamentos de caixa. Nenhum registro anterior é apagado. Se uma operação for retomada posteriormente, a carga não desfaz essa alteração para recriar o estado de falha.

O carregamento é opcional; iniciar normalmente não insere o conjunto financeiro. Relógio e resultados controlados valem apenas para a execução da carga; depois o relógio volta ao horário atual e o processamento normal demonstrativo é mantido. As configurações temporárias são isoladas por thread.

O código de carga está no conjunto de fontes de desenvolvimento/teste, fora do JAR distribuído. Este comando não habilita a carga em servidor publicado. O script recusa a opção se a API já estiver ativa, em vez de afirmar que carregou algo sem executar.

## Evidência

`CenarioCompletoTest` verifica repetição sem duplicação, as duas lojas, estados de pagamento/split, despesas de períodos diferentes e restauração do relógio/processamento normal, usando PostgreSQL real descartável. Esta verificação não substitui o aceite visual da apresentação.

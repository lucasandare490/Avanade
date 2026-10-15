> **Estado atual:** consulte o [incremento de integração e validação](../../documentacao/revisao-2026-10-14/ESTADO-ATUAL.md). Web e contrato Android implementados; Android ainda depende de homologação HTTPS/dispositivo, e IA externa não foi escolhida. Trechos datados abaixo preservam entregas anteriores.

# Checklist dos incrementos 0.1 e 0.2

Data: 12/10/2026. Autorização de implementação recebida após auditoria. Evidências em [VALIDACAO.md](VALIDACAO.md); critérios originais preservados no pacote `entrega-para-backend`. Não equivale a aceite completo do MVP.

- [x] Fundação: Java21/Spring Boot, Maven Wrapper, estrutura por domínio, PostgreSQL17.11, Flyway e configuração.
- [x] Persistência: três migrations, tenant nas FKs, composição, efeitos únicos, histórico imutável, runtime separado do proprietário.
- [x] Segurança: sessão revogável/expirável, três perfis, duas lojas, hashes, CORS restrito, limite de corpo e rate limit local.
- [x] Venda: mock de pagamento, regra versionada, split determinístico e três parcelas; venda sem operação quando pagamento não confirmado/regra ausente.
- [x] Recuperação: intenção durável, conflito por chave divergente, concorrência, reprocessamento de falha parcial sem duplicação.
- [x] Consultas: vendas/operações/detalhe/ledger, filtros/páginas/tenant.
- [x] Despesas pagas: categorias, validação, idempotência e saída única.
- [x] Caixa: abertura por histórico, líquido concluído, despesas, saldo final e fuso.
- [x] Simulação sem efeitos financeiros; explicação local com MockAIProvider e fallback.
- [x] Testes automatizados de domínio e integração em PostgreSQL real; smoke HTTP.
- [x] Backup/restore em banco descartável com comparação integral dos registros de12 tabelas.
- [x] Contrato, exemplos, modelo, dicionário, README e devolutiva inicial.
- [x] Integração web implementada: contrato, sessão bearer, consultas, vendas, despesas e recuperação. [Guia](../../frontend/documentacao/INTEGRACAO-BACKEND.md).
- [ ] Aceite final do Android e homologação conjunta do MVP.
- [ ] Projeção e tendências: mantidas pendentes por decisão expressa do usuário.
- [ ] Classificação sugerida de despesas e alertas: P3, dependem de regras/contratos correspondentes.
- [ ] Docker Compose executado, HTTPS para POS e implantação compartilhada: ambiente Docker não disponível; produção não autorizada.
- [x] Incremento 0.2 (13/10/2026): queda após commit e antes da resposta HTTP, consultas em lote, EXPLAIN com massa sintética e limites de datas do caixa; [evidências](INCREMENTO-02.md).
- [ ] Ensaio de carga sustentada e limites operacionais homologados.
- [ ] Upgrade estrutural sobre massa existente (além de revalidar migrations no reinício), CI remoto e auditoria automatizada de vulnerabilidades.
- [ ] Retenção/anonimização, política de backups e responsáveis operacionais finais.
- [ ] Revisão conjunta do OpenAPI e dos estados sem operação pelos consumidores.

Repetições automáticas externas/outbox/inbox não foram introduzidas: adapters são locais e síncronos. Não existem transferências reais, crédito, cancelamento ou exportação neste incremento.

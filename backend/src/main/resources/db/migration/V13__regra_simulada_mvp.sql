-- Regra financeira simulada do MVP (Thayná Batista da Silva).
-- Sem ela, a produção (sem semente de demonstração) recusava o split de toda venda
-- com TAX_RULE_UNAVAILABLE. Mesmos percentuais da demonstração e do site:
-- 10% de tributo e 2% de taxa, categoria GENERAL. Percentuais de exemplo, não legislação.
-- Começa em 1999, antes da regra DEMO-v1 (2000): onde a demonstração existe, ela
-- continua valendo; onde não existe, vale esta.
INSERT INTO tax_rule(id, version, category, tax_bps, fee_bps, valid_from)
VALUES ('20000000-0000-0000-0000-000000000001', 'MVP-SIMULADO-v1', 'GENERAL', 1000, 200, '1999-01-01T00:00:00Z')
ON CONFLICT DO NOTHING;

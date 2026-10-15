ALTER TABLE tax_rule ADD COLUMN valid_to timestamptz;
ALTER TABLE tax_rule ADD CONSTRAINT tax_rule_valid_interval CHECK (valid_to IS NULL OR valid_to > valid_from);
COMMENT ON COLUMN tax_rule.valid_to IS 'Fim exclusivo da vigência; NULL mantém vigência aberta. Operações preservam snapshot histórico.';

-- Crédito de IBS/CBS destacado na nota de compra (Thayná Batista da Silva).
-- Na Reforma Tributária, o imposto pago nas compras vira crédito que abate o
-- imposto das vendas. Guardamos o valor informado ou lido do XML da NF-e.
ALTER TABLE expense
  ADD COLUMN tax_credit_cents bigint NOT NULL DEFAULT 0;
ALTER TABLE expense
  ADD CONSTRAINT expense_tax_credit_range CHECK (tax_credit_cents >= 0 AND tax_credit_cents <= amount_cents);

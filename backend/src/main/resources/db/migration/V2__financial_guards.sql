CREATE TRIGGER immutable_intent BEFORE UPDATE OR DELETE ON request_intent FOR EACH ROW EXECUTE FUNCTION reject_immutable_mutation();
CREATE FUNCTION protect_operation_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.id,NEW.sale_id,NEW.merchant_id,NEW.rule_id,NEW.rule_version,NEW.tax_bps,NEW.fee_bps,NEW.gross_cents,NEW.tax_cents,NEW.fee_cents,NEW.net_cents,NEW.created_at)
 IS DISTINCT FROM ROW(OLD.id,OLD.sale_id,OLD.merchant_id,OLD.rule_id,OLD.rule_version,OLD.tax_bps,OLD.fee_bps,OLD.gross_cents,OLD.tax_cents,OLD.fee_cents,OLD.net_cents,OLD.created_at)
 THEN RAISE EXCEPTION 'immutable operation snapshot' USING ERRCODE='23514'; END IF;
 IF OLD.status='CONCLUIDA' AND ROW(NEW.status,NEW.completed_at) IS DISTINCT FROM ROW(OLD.status,OLD.completed_at)
 THEN RAISE EXCEPTION 'completed operation is final' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER operation_snapshot BEFORE UPDATE ON split_operation FOR EACH ROW EXECUTE FUNCTION protect_operation_snapshot();
CREATE FUNCTION protect_parcel() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.id,NEW.operation_id,NEW.merchant_id,NEW.kind,NEW.amount_cents,NEW.destination)
 IS DISTINCT FROM ROW(OLD.id,OLD.operation_id,OLD.merchant_id,OLD.kind,OLD.amount_cents,OLD.destination)
 OR (OLD.status='CONFIRMADA' AND ROW(NEW.status,NEW.confirmed_at) IS DISTINCT FROM ROW(OLD.status,OLD.confirmed_at))
 THEN RAISE EXCEPTION 'immutable parcel data or confirmation' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER parcel_snapshot BEFORE UPDATE ON parcel FOR EACH ROW EXECUTE FUNCTION protect_parcel();
CREATE FUNCTION validate_financial_effect() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.operation_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM split_operation o WHERE o.id=NEW.operation_id AND o.merchant_id=NEW.merchant_id AND o.status='CONCLUIDA' AND o.net_cents=NEW.amount_cents)
 THEN RAISE EXCEPTION 'invalid split cash effect' USING ERRCODE='23514'; END IF;
 IF NEW.expense_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM expense e WHERE e.id=NEW.expense_id AND e.merchant_id=NEW.merchant_id AND -e.amount_cents=NEW.amount_cents AND e.paid_on=NEW.booked_on)
 THEN RAISE EXCEPTION 'invalid expense cash effect' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER cash_effect BEFORE INSERT ON cash_entry FOR EACH ROW EXECUTE FUNCTION validate_financial_effect();
CREATE FUNCTION validate_operation_parcels() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE op split_operation; parcel_count bigint; confirmed_count bigint; total bigint;
BEGIN
 SELECT * INTO op FROM split_operation WHERE id=NEW.id;
 SELECT count(*),count(*) FILTER(WHERE status='CONFIRMADA'),sum(amount_cents) INTO parcel_count,confirmed_count,total FROM parcel WHERE operation_id=op.id;
 IF parcel_count<>3 OR total<>op.gross_cents OR (op.status='CONCLUIDA' AND confirmed_count<>3)
 THEN RAISE EXCEPTION 'invalid operation parcels' USING ERRCODE='23514'; END IF;
 IF NOT EXISTS(SELECT 1 FROM payment WHERE sale_id=op.sale_id AND status='CONFIRMED')
 THEN RAISE EXCEPTION 'split requires confirmed payment' USING ERRCODE='23514'; END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER operation_parcels AFTER INSERT OR UPDATE ON split_operation DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION validate_operation_parcels();

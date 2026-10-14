-- The standard runtime role is provisioned before migration by Docker/local/test bootstrap.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE UPDATE ON ALL TABLES IN SCHEMA public FROM split_app;
REVOKE ALL ON flyway_schema_history FROM split_app;
GRANT UPDATE ON auth_session, sale, split_operation, parcel TO split_app;

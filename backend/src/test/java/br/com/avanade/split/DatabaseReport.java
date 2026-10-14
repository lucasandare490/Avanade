package br.com.avanade.split;

import java.nio.file.*;
import java.sql.*;
import java.util.*;

/** Generates structural documentation only; no user/session/financial rows are exported. */
public class DatabaseReport {
  public static void main(String[] args) throws Exception {
    try (var c =
            DriverManager.getConnection(
                "jdbc:postgresql://127.0.0.1:54329/postgres", "postgres", "");
        var s = c.createStatement()) {
      StringBuilder doc =
          new StringBuilder(
              "# Dicionário extraído do PostgreSQL\n\n"
                  + "Gerado por `DatabaseReport`; schema public após migrations. Sem dados de"
                  + " usuários.\n\n");
      var tables = new ArrayList<String>();
      try (var r =
          s.executeQuery(
              "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER"
                  + " BY table_name")) {
        while (r.next()) tables.add(r.getString(1));
      }
      for (String table : tables) {
        doc.append("## ")
            .append(table)
            .append("\n\n| Coluna | Tipo | Nullable | Default |\n|---|---|---|---|\n");
        try (var p =
            c.prepareStatement(
                "SELECT column_name,data_type,character_maximum_length,is_nullable,column_default"
                    + " FROM information_schema.columns WHERE table_schema='public' AND"
                    + " table_name=? ORDER BY ordinal_position")) {
          p.setString(1, table);
          try (var r = p.executeQuery()) {
            while (r.next())
              doc.append("| ")
                  .append(r.getString(1))
                  .append(" | ")
                  .append(r.getString(2))
                  .append(r.getObject(3) == null ? "" : "(" + r.getObject(3) + ")")
                  .append(" | ")
                  .append(r.getString(4))
                  .append(" | ")
                  .append(r.getString(5) == null ? "—" : r.getString(5))
                  .append(" |\n");
          }
        }
        doc.append("\nConstraints:\n\n");
        try (var p =
            c.prepareStatement(
                "SELECT conname,pg_get_constraintdef(oid) FROM pg_constraint WHERE"
                    + " conrelid=?::regclass ORDER BY conname")) {
          p.setString(1, table);
          try (var r = p.executeQuery()) {
            while (r.next())
              doc.append("- `")
                  .append(r.getString(1))
                  .append("`: ")
                  .append(r.getString(2))
                  .append("\n");
          }
        }
        doc.append("\nÍndices:\n\n");
        try (var p =
            c.prepareStatement(
                "SELECT indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=? ORDER BY"
                    + " indexname")) {
          p.setString(1, table);
          try (var r = p.executeQuery()) {
            while (r.next()) doc.append("- `").append(r.getString(1)).append("`\n");
          }
        }
        doc.append("\n");
      }
      Files.writeString(Path.of("docs/BANCO-DICIONARIO.md"), doc.toString());
      try (var r =
          s.executeQuery(
              "SELECT (SELECT count(*) FROM sale) sales,(SELECT count(*) FROM split_operation)"
                  + " operations,(SELECT count(*) FROM parcel) parcels,(SELECT count(*) FROM"
                  + " ledger_event) events,(SELECT count(*) FROM request_intent) intents,(SELECT"
                  + " count(*) FROM cash_entry) cash_entries")) {
        r.next();
        System.out.printf(
            "sales=%d operations=%d parcels=%d events=%d intents=%d cash_entries=%d%n",
            r.getLong(1), r.getLong(2), r.getLong(3), r.getLong(4), r.getLong(5), r.getLong(6));
      }
    }
  }
}

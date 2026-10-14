package br.com.avanade.split.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.responses.*;
import io.swagger.v3.oas.models.security.*;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.utils.SpringDocAnnotationsUtils;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI contract() {
    var api =
        new OpenAPI()
            .info(
                new Info()
                    .title("Split demonstrativo")
                    .version("1.0.0")
                    .description(
                        "Centavos BRL. Pagamentos simulados. Projeção/tendências pendentes; ver"
                            + " docs/API.md."));
    var components =
        new Components()
            .addSecuritySchemes(
                "bearerSession",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .description("Token opaco revogável recebido no login"));
    return api.components(components);
  }

  @Bean
  OpenApiCustomizer responses() {
    return api -> {
      for (Class<?> type :
          new Class<?>[] {
            ApiSchemas.Session.class,
            ApiSchemas.SalePage.class,
            ApiSchemas.OperationPage.class,
            ApiSchemas.ExpensePage.class,
            ApiSchemas.EventPage.class,
            ApiSchemas.Category.class,
            ApiSchemas.Simulation.class,
            ApiSchemas.Analysis.class,
            br.com.avanade.split.shared.ApiErrors.Error.class
          })
        SpringDocAnnotationsUtils.extractSchema(
            api.getComponents(), type, null, null, api.getSpecVersion());
      // OpenAPI 3.0 ignores nullable siblings on $ref. Represent the no-split case explicitly.
      var nullOnly = new Schema<>().type("object").nullable(true);
      nullOnly.addEnumItemObject(null);
      api.getComponents()
          .getSchemas()
          .get("SaleResponse")
          .getProperties()
          .put(
              "operation",
              new ComposedSchema().addOneOfItem(ref("OperationResponse")).addOneOfItem(nullOnly));
      api.getPaths()
          .forEach(
              (path, item) ->
                  item.readOperationsMap()
                      .forEach(
                          (method, operation) -> {
                            if (!path.startsWith("/api/v1/")) return;
                            boolean post = method == PathItem.HttpMethod.POST;
                            boolean login = path.endsWith("/auth/login");
                            if (!login)
                              operation.addSecurityItem(
                                  new SecurityRequirement().addList("bearerSession"));
                            String schema;
                            if (login) schema = "Session";
                            else if (path.endsWith("/auth/logout")) {
                              operation.setResponses(
                                  new ApiResponses()
                                      .addApiResponse(
                                          "204", new ApiResponse().description("Sessão revogada")));
                              return;
                            } else if (path.endsWith("/cash-flow") || path.endsWith("/dashboard"))
                              schema = "CashFlow";
                            else if (path.endsWith("/ai/cash-analysis")) schema = "Analysis";
                            else if (path.endsWith("/simulate")) schema = "Simulation";
                            else if (path.endsWith("/ledger")) schema = "EventPage";
                            else if (path.endsWith("/expense-categories")) schema = "Category";
                            else if (path.contains("/requests/")) schema = null;
                            else if (path.contains("/split-operations"))
                              schema =
                                  path.endsWith("/split-operations")
                                      ? "OperationPage"
                                      : "OperationResponse";
                            else if (path.contains("/expenses"))
                              schema =
                                  path.endsWith("/expenses") && !post
                                      ? "ExpensePage"
                                      : "ExpenseResponse";
                            else
                              schema =
                                  path.endsWith("/sales") && !post ? "SalePage" : "SaleResponse";
                            Schema<?> body =
                                schema == null
                                    ? new ComposedSchema()
                                        .addOneOfItem(ref("SaleResponse"))
                                        .addOneOfItem(ref("ExpenseResponse"))
                                        .addOneOfItem(ref("OperationResponse"))
                                    : ref(schema);
                            if (path.endsWith("/expense-categories"))
                              body = new ArraySchema().items(body);
                            var responses =
                                new ApiResponses()
                                    .addApiResponse(
                                        "200", response("Sucesso / repetição idempotente", body));
                            if (post && (path.endsWith("/sales") || path.endsWith("/expenses")))
                              responses.addApiResponse("201", response("Criado", body));
                            for (String status :
                                new String[] {
                                  "400", "401", "403", "404", "409", "413", "422", "429", "500"
                                })
                              responses.addApiResponse(
                                  status,
                                  response("Erro; consultar code e correlationId", ref("Error")));
                            operation.setResponses(responses);
                          }));
    };
  }

  private static Schema<?> ref(String name) {
    return new Schema<>().$ref("#/components/schemas/" + name);
  }

  private static ApiResponse response(String description, Schema<?> schema) {
    return new ApiResponse()
        .description(description)
        .content(new Content().addMediaType("application/json", new MediaType().schema(schema)));
  }
}

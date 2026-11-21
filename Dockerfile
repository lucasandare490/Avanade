# Imagem única do Planner Comercial (Thayná Batista da Silva): o site em React é
# montado primeiro e entregue pela própria API em Java, no mesmo endereço.
FROM node:22-alpine AS site
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
# Os testes de tipo leem exemplos do contrato da API.
COPY backend/docs/examples/ /app/backend/docs/examples/
# Sem VITE_API_URL: o site chama a API no próprio endereço.
ENV VITE_MODO_DADOS=api VITE_API_URL=""
RUN npm run build

FROM eclipse-temurin:21-jdk AS api
WORKDIR /app
COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline
COPY backend/src src
COPY --from=site /app/frontend/dist src/main/resources/static
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && useradd --system --uid 10001 app
COPY --from=api /app/target/split-backend-0.1.0-SNAPSHOT.jar app.jar
COPY backend/docker/iniciar.sh /app/iniciar.sh
RUN chmod 0555 /app/iniciar.sh
ENV SERVER_ADDRESS=0.0.0.0
USER 10001
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=40s CMD curl -fsS http://127.0.0.1:8080/actuator/health/readiness || exit 1
ENTRYPOINT ["/app/iniciar.sh"]

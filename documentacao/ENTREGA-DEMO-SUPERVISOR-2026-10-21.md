# Entrega para demonstração ao supervisor

## Objetivo da apresentação

Demonstrar o Planner Comercial funcionando no navegador, com cadastro/login,
controle por perfil, vendas, despesas, caixa, relatórios e simulação de split.
O aplicativo Android/POS e a maquininha não fazem parte desta demonstração.

## Arquitetura apresentada

`Navegador → API Java Spring Boot → PostgreSQL Supabase`

O frontend não acessa o banco diretamente. A autenticação, sessões, permissões
por loja e regras financeiras permanecem na API Java. O Supabase é usado como
PostgreSQL gerenciado; não é necessário instalar SDK Supabase no navegador ou no
Android.

## Roteiro rápido

1. Abrir o endereço do frontend.
2. Escolher o acesso autenticado, não a prévia demonstrativa.
3. Criar uma conta e um estabelecimento vazio, ou usar uma conta de demonstração.
4. Mostrar o dashboard e a identificação do estabelecimento.
5. Registrar uma venda simulada e mostrar o split bruto/tributo/taxa/líquido.
6. Registrar uma despesa e abrir o fluxo de caixa.
7. Abrir relatórios e simulação de split.
8. Encerrar a sessão e entrar novamente para demonstrar autenticação.

## Execução local de contingência

### Backend com Supabase

O arquivo privado `backend/.env.supabase` já está configurado localmente. Nunca
copiar esse arquivo para o GitHub ou para a documentação.

```bash
cd backend
MAVEN_OPTS='-Xmx192m' ./mvnw -DskipTests package
bash scripts/run-supabase.sh
```

Em outro terminal:

```bash
npm --prefix frontend ci
npm run dev
```

Abrir `http://127.0.0.1:5173`.

### Demonstração sem rede

Se o acesso ao Supabase estiver indisponível, executar o modo demonstrativo do
frontend para mostrar a navegação e os cálculos sintéticos. Esse modo não prova
persistência, autenticação real ou isolamento entre lojas.

## Publicação planejada

- Render Free: API Java usando `render.yaml` e `backend/Dockerfile`.
- Vercel: frontend Vite usando `vercel.json`.
- Supabase: banco PostgreSQL já provisionado e migrations Flyway na versão 5.

O Render Free pode dormir após 15 minutos sem acesso; o primeiro carregamento
depois disso pode levar aproximadamente um minuto. Isso é aceitável para a
demonstração, mas deve ser informado caso o supervisor abra o endereço após um
período parado.

## Limites que devem ser comunicados

- Pagamentos, tributos e taxas são demonstrativos; não há movimentação real.
- A maquininha/POS Android ainda não foi homologada para esta entrega.
- O acesso público depende de HTTPS, CORS e secrets configurados na plataforma.
- A demonstração não representa aceite de produção, carga ou conformidade fiscal.

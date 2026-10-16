# Como executar e apresentar o Planner Comercial

Use a pasta `C:\Avanade-main`. O frontend fica em `frontend`; agora também existe um atalho `npm run dev` na pasta principal.

## Abrir no computador

No VS Code, abra dois terminais. Não feche os terminais durante a apresentação.

**Terminal 1 — backend e banco local:**

```powershell
cd C:\Avanade-main
.\scripts\iniciar-backend-local.ps1 -Jdk "C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot"
```

Aguarde a mensagem de inicialização da API. O launcher inicia ou reutiliza o PostgreSQL local, aplica migrations e preserva os registros existentes. O caminho do JDK acima é o instalado neste computador; em outra máquina, ajuste-o.

**Terminal 2 — frontend:**

```powershell
cd C:\Avanade-main
npm run dev
```

Abra http://127.0.0.1:5173. Se aparecer porta ocupada, confira a aplicação já aberta antes de iniciar outra instância. A API usa a porta 8080.

Na primeira instalação em outro computador, execute `npm ci --prefix frontend` antes de iniciar. São necessários Node/npm e JDK 21. Não é necessário instalar PostgreSQL separadamente para usar este launcher local; o projeto utiliza sua distribuição de desenvolvimento.

## Entrar

Conta demonstrativa de gestão: `gerente1@demo.local`.

A senha está no arquivo privado `backend/.local/demo-password`. Abra-o somente fora do compartilhamento de tela e copie a senha para o login. Não publique esse arquivo e não altere seu conteúdo para tentar trocar a senha de uma conta já criada.

Há também `financeiro1@demo.local` e `operador1@demo.local`, com permissões diferentes. As contas da outra loja usam sufixo 2. O seed não redefine senhas existentes.

## Sequência sugerida para a apresentação

1. Mostrar o dashboard e explicar a composição de bruto, tributos, taxas e líquido.
2. Registrar uma venda de R$ 150,00 e abrir o detalhe com pagamento, parcelas e eventos.
3. Consultar a venda no histórico.
4. Registrar uma despesa paga e conferir a alteração no caixa.
5. Mostrar a simulação sem criação de venda.
6. Abrir análise e escolher um período que contenha os registros demonstrados. Mostrar comparação histórica e eventual ausência de base anterior.
7. Explicar as próximas etapas: homologação Android/HTTPS, eventual escolha de IA externa (opcional) e aceite da equipe.

Os registros são persistidos no banco, mas pagamento, tributos e roteamento são SIMULADOS. O texto explicativo vem de MockAIProvider, sem modelo externo. Não apresentar a demonstração como recolhimento fiscal real ou IA externa já conectada.

## Android

O APK debug fica em `android-pos/app/build/outputs/apk/debug/app-debug.apk`. A demonstração local continua disponível. A opção “Conectar ao servidor HTTPS” exige endereço alcançável pelo aparelho e certificado válido; não use 127.0.0.1 do computador como se fosse o endereço do telefone. Enquanto o ambiente HTTPS não existir, apresente o fluxo integrado pelo navegador do computador.

## Decisões ainda abertas

A equipe informou que ainda não existe endereço público HTTPS e ainda não escolheu provedor/modelo de IA. Isso não impede a apresentação local web. A escolha da IA deve considerar qualidade em português, uso de fatos financeiros autorizados, custo e latência medidos em exemplos do projeto e tratamento dos dados. Não há modelo contratado ou chave configurada neste pacote.

## Quando a porta já estiver em uso

O launcher verifica se a API demonstrativa do Planner já está ativa. Se estiver, informa o endereço e encerra o comando sem iniciar uma segunda API. O serviço existente continua funcionando. Se a porta pertencer a outro serviço ou a identificação falhar, o comando para com uma mensagem; não encerra processos automaticamente. Para carregar alterações Java, encerre primeiro a API no terminal de origem e depois execute o launcher novamente.

## Apresentar falha e retomada sem alterar pagamentos normais

Para acrescentar os casos persistentes, encerre a API no próprio terminal e inicie com `-PopularCenario`, conforme o [guia do cenário completo](backend/docs/CENARIO-DE-APRESENTACAO.md). Entre como gerente da loja 1 e filtre 01 a 15/10/2026. Mostre o histórico, abra a operação com falha parcial, confira a parcela já confirmada e use a retomada disponível. Depois consulte o detalhe e o caixa. A retomada deve preservar as parcelas anteriores; repetir a carga não desfaz uma retomada já realizada. Os pagamentos recusados e pendentes devem ser consultados como vendas, sem afirmar que existe split concluído para eles.

Para demonstrar o conjunto inicial novamente, use uma base descartável separada. Não apague o banco pessoal nem registros anteriores para preparar a apresentação.

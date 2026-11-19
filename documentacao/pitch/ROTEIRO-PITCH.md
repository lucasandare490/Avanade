# Roteiro do pitch em vídeo — Planner Comercial

Squad 19 · Grow Up 2026.2 · Avanade
Roteiro: Thayná Batista da Silva

**Duração:** entre 4 minutos e 4 minutos e 40 segundos, falando devagar e com as pausas (são 383 palavras: cerca de 3 minutos e 50 segundos de fala lenta, mais 17 pausas e o tempo das telas). Fica abaixo do limite de 5 minutos.
**Formato:** a tela da solução aparece em dois aparelhos, um ao lado do outro: **à esquerda, a maquininha de cartão (Smart POS)** e **à direita, o celular**. A pessoa que apresenta aparece num canto do vídeo, falando.

---

## Como ler este roteiro

- Cada bloco tem o **tempo**, o que aparece **na maquininha**, o que aparece **no celular** e a **fala**.
- Cada linha da fala é uma frase curta. Respire no fim de cada linha.
- **( pausa )** significa parar por um segundo inteiro. Conte "um" mentalmente.
- **Negrito** marca a palavra que merece mais ênfase. Fale essa palavra um pouco mais devagar.
- Não precisa decorar. Leia algumas vezes em voz alta, como se estivesse explicando para uma amiga que tem um comércio, e depois fale com as suas palavras.
- Velocidade: mais devagar do que parece natural. Se estiver terminando antes de 4 minutos, está rápido demais.

---

## Antes de gravar

**Use a demonstração.** O site publicado (https://avanade-frontend-xi.vercel.app/) é a versão real, com login e banco de dados, e não mostra a maquininha. Para gravar, rode a demonstração no computador. Ela tem dados fictícios, não pede senha e não movimenta dinheiro de verdade. Precisa de Git e Node.js 20 ou mais novo:

```bash
git clone https://github.com/lucasandare490/Avanade.git && cd Avanade/frontend && npm ci && VITE_MODO_DADOS=demo npm run dev
```

No Windows (PowerShell), depois de clonar: `cd Avanade\frontend; npm.cmd ci; $env:VITE_MODO_DADOS='demo'; npm.cmd run dev`

Abra http://127.0.0.1:5173 e clique em **Explorar demonstração**.

**Monte os dois aparelhos lado a lado:**

1. Abra http://127.0.0.1:5173 em **duas janelas** do navegador (Chrome ou Edge), as duas no modo demonstração.
2. **Maquininha (janela da esquerda):** entre no menu **Smart POS · protótipo**. Deixe a janela estreita e alta, mais ou menos 400 × 720 pixels, para parecer uma maquininha.
3. **Celular (janela da direita):** aperte **F12**, clique no ícone de celular (modo dispositivo) e escolha um celular, por exemplo o iPhone 12 Pro (390 × 844). Feche a área de código e deixe só a tela do celular.
4. Grave a tela inteira com as duas janelas lado a lado (OBS Studio, Xbox Game Bar no Windows ou a gravação do Canva).
5. Se quiser, coloque uma moldura de maquininha e de celular na edição (Canva ou CapCut têm molduras prontas).
6. Grave a pessoa falando separado, com o celular na horizontal e luz de frente. Na edição, coloque a pessoa num círculo ou retângulo no canto inferior.

**Dica:** grave a voz primeiro e a navegação depois, acompanhando o áudio. Fica mais fácil acertar o tempo de cada tela.

**Deixe pronto antes de gravar:**

- Celular no **tema claro** e em **português**, na tela inicial (Dashboard).
- Maquininha na tela **Acesse o Smart POS**.

---

## Bloco 1 — Abertura (0:00 a 0:30)

| Maquininha | Celular |
|---|---|
| Tela **Acesse o Smart POS**. Toque em **Iniciar demonstração**. | Tela de entrada do Planner Comercial. Toque em **Explorar demonstração**. |

**Texto na tela (opcional):** *Planner Comercial · Squad 19 · Avanade*

**Fala:**

> Oi. Eu sou **[seu nome]**, da Squad 19.
> E este é o **Planner Comercial**.
> ( pausa )
> Imagine a dona Maria.
> Ela tem um mercadinho no bairro.
> Vende bem... todo dia.
> ( pausa )
> Mas no fim do mês, o dinheiro **não fecha**.

---

## Bloco 2 — O problema (0:30 a 1:25)

| Maquininha | Celular |
|---|---|
| Tela inicial do Smart POS. Toque em **Nova venda**. Deixe o valor de R$ 150,00 na tela. | Fica parado no Dashboard. |

**Texto na tela (opcional):** *Reforma Tributária · split payment · descapitalização*

**Fala:**

> Com a Reforma Tributária, chega o **split payment**.
> Na hora em que o cliente paga...
> a parte do imposto **já sai**. Automaticamente.
> ( pausa )
> Parece bom, não é?
> Mas tem um detalhe.
> ( pausa )
> Hoje, o dinheiro do imposto fica no caixa por algumas semanas, até a data de pagar.
> E nesse tempo, ele trabalha.
> Paga o fornecedor. O estoque. O salário.
> ( pausa )
> Com o split payment, esse dinheiro **não entra mais**.
> O comerciante perde capital de giro... de uma vez.
> ( pausa )
> Isso tem nome: **descapitalização**.
> E é esse o problema que o Planner Comercial resolve.

---

## Bloco 3 — A venda na maquininha (1:25 a 2:10)

| Maquininha | Celular |
|---|---|
| Toque em **Cobrar R$ 150,00** → tela **Processando** → **Continuar demonstração** → tela **Venda simulada** com as **Parcelas roteadas**. Deixe essa tela parada. | Quando a maquininha mostrar as parcelas, mostre no celular o card **Valor líquido** do Dashboard. |

**Fala:**

> Olha a venda acontecendo na maquininha.
> Cento e cinquenta reais.
> ( pausa )
> O Planner mostra para onde foi cada parte.
> Quinze reais de imposto.
> Três da taxa da maquininha.
> E **cento e trinta e dois**, que de fato entram no caixa.
> ( pausa )
> No celular, a Maria vê esse mesmo número.
> Não o que ela vendeu.
> O que ela **tem**.

---

## Bloco 4 — Caixa e projeção (2:10 a 2:50)

| Maquininha | Celular |
|---|---|
| Volte para o início e toque em **Caixa** → **Ver projeção**. | Abra o menu (☰) → **Fluxo de Caixa**. Role devagar até a lista de movimentações. |

**Fala:**

> O Planner junta as vendas e as despesas.
> Mostra o caixa da semana.
> E projeta os próximos dias.
> ( pausa )
> Se o dinheiro vai faltar, ele avisa **antes**.
> E aí dá tempo de se organizar.

---

## Bloco 5 — Capital de giro dentro do app (2:50 a 3:55)

| Maquininha | Celular |
|---|---|
| Fica parada na **Projeção de caixa**. | Menu (☰) → **Capital de giro**. Mostre o **Diagnóstico**, depois role até os **Parceiros financeiros**, marque a autorização, simule um valor (por exemplo R$ 1.000,00 em 6 parcelas) e mostre a **comparação das ofertas** e a tabela **antes e depois do caixa**. |

**Texto na tela (opcional):** *Parceiros simulados nesta versão*

**Fala:**

> E se, mesmo assim, faltar?
> Aqui está o nosso diferencial.
> ( pausa )
> O Planner calcula quanto imposto saiu do caixa...
> e quanto vai faltar nos próximos trinta dias.
> ( pausa )
> E mostra ofertas de crédito de bancos e fintechs parceiras.
> Ali mesmo, no app.
> **Sem precisar ir ao banco.**
> ( pausa )
> Ele compara as ofertas pelo custo total.
> E não deixa contratar uma parcela que o caixa não aguenta.
> ( pausa )
> Antes de contratar, a Maria vê como o caixa fica, semana a semana.
> Depois, pode pagar antes, com desconto nos juros.
> Ou desistir em até sete dias.

---

## Bloco 6 — Simples para qualquer pessoa (3:55 a 4:20)

| Maquininha | Celular |
|---|---|
| Fica parada. | No Dashboard, toque no **i** ao lado de **Total bruto** e deixe a explicação aparecer. Depois, no menu, troque para o **tema escuro** e para o **inglês** por dois segundos, e volte para o português. |

**Fala:**

> E tudo isso de um jeito simples.
> Cada número tem um **"i"** que explica o que ele quer dizer.
> ( pausa )
> Funciona em português, inglês e espanhol.
> No tema claro ou escuro.
> No celular, no computador... e na maquininha.

---

## Bloco 7 — Fechamento (4:20 a 4:40)

| Maquininha | Celular |
|---|---|
| Volte para a tela inicial do Smart POS. | Volte para o Dashboard. |

**Texto na tela (opcional):** *Planner Comercial · avanade-frontend-xi.vercel.app · Squad 19 · Avanade*

**Fala:**

> O split payment vai mudar o caixa de milhões de pequenos negócios.
> ( pausa )
> O Planner Comercial ajuda o comerciante a enxergar o dinheiro de verdade...
> se antecipar...
> e continuar vendendo com tranquilidade.
> ( pausa )
> Nós somos a Squad 19, com a Avanade.
> **Obrigado.**

---

## Conferência rápida antes de publicar

- [ ] O vídeo tem até 5 minutos.
- [ ] Dá para ler os números das telas (gravar em 1080p ajuda).
- [ ] Aparece em algum momento que os dados e os parceiros são simulados.
- [ ] Nenhum dado pessoal aparece na tela (use só a demonstração, nunca uma conta real).
- [ ] Publicado no YouTube como **Não listado**.
- [ ] Link colado no README, na seção "Pitch em vídeo" (o espaço já está pronto nas três línguas).

---

## Fala corrida (para ler direto ou usar em teleprompter)

Oi. Eu sou [seu nome], da Squad 19. E este é o Planner Comercial.

Imagine a dona Maria. Ela tem um mercadinho no bairro. Vende bem, todo dia. Mas no fim do mês, o dinheiro não fecha.

Com a Reforma Tributária, chega o split payment. Na hora em que o cliente paga, a parte do imposto já sai. Automaticamente. Parece bom, não é? Mas tem um detalhe. Hoje, o dinheiro do imposto fica no caixa por algumas semanas, até a data de pagar. E nesse tempo, ele trabalha. Paga o fornecedor. O estoque. O salário. Com o split payment, esse dinheiro não entra mais. O comerciante perde capital de giro de uma vez. Isso tem nome: descapitalização. E é esse o problema que o Planner Comercial resolve.

Olha a venda acontecendo na maquininha. Cento e cinquenta reais. O Planner mostra para onde foi cada parte. Quinze reais de imposto. Três da taxa da maquininha. E cento e trinta e dois, que de fato entram no caixa. No celular, a Maria vê esse mesmo número. Não o que ela vendeu. O que ela tem.

O Planner junta as vendas e as despesas. Mostra o caixa da semana. E projeta os próximos dias. Se o dinheiro vai faltar, ele avisa antes. E aí dá tempo de se organizar.

E se, mesmo assim, faltar? Aqui está o nosso diferencial. O Planner calcula quanto imposto saiu do caixa e quanto vai faltar nos próximos trinta dias. E mostra ofertas de crédito de bancos e fintechs parceiras. Ali mesmo, no app. Sem precisar ir ao banco. Ele compara as ofertas pelo custo total. E não deixa contratar uma parcela que o caixa não aguenta. Antes de contratar, a Maria vê como o caixa fica, semana a semana. Depois, pode pagar antes, com desconto nos juros. Ou desistir em até sete dias.

E tudo isso de um jeito simples. Cada número tem um "i" que explica o que ele quer dizer. Funciona em português, inglês e espanhol. No tema claro ou escuro. No celular, no computador e na maquininha.

O split payment vai mudar o caixa de milhões de pequenos negócios. O Planner Comercial ajuda o comerciante a enxergar o dinheiro de verdade, se antecipar e continuar vendendo com tranquilidade. Nós somos a Squad 19, com a Avanade. Obrigado.

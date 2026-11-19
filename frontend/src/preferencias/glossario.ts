// Explicações dos ícones "i": rótulo (em minúsculas) -> [português, inglês, espanhol].
// Linguagem simples, para o comerciante. Conferido nos testes de navegador
// (e2e/entrega-final.spec.ts): toda informação das telas precisa de explicação aqui.
type E = readonly [string, string, string];

const bruto: E = [
  'Valor total pago pelo cliente, antes de separar imposto e taxa.',
  'Total amount paid by the customer, before tax and fees are separated.',
  'Monto total pagado por el cliente, antes de separar el impuesto y la tasa.',
];
const tributo: E = [
  'Parte da venda separada para o imposto (IBS/CBS) no momento do pagamento. Com o split payment, esse dinheiro não chega ao seu caixa. Aqui o percentual é fictício.',
  'Part of the sale set aside for tax (IBS/CBS) at the moment of payment. With split payment, this money never reaches your cash. The rate here is fictitious.',
  'Parte de la venta separada para el impuesto (IBS/CBS) en el momento del pago. Con el split payment, ese dinero no llega a su caja. Aquí el porcentaje es ficticio.',
];
const taxa: E = [
  'Valor cobrado pela maquininha ou plataforma de pagamento. Não é imposto.',
  'Amount charged by the card machine or payment platform. It is not a tax.',
  'Monto cobrado por la terminal o plataforma de pago. No es un impuesto.',
];
const liquido: E = [
  'O que sobra para o seu negócio depois de separar imposto e taxa. É o dinheiro que entra de fato no caixa.',
  'What is left for your business after tax and fees are separated. It is the money that actually enters your cash.',
  'Lo que queda para su negocio después de separar el impuesto y la tasa. Es el dinero que entra de verdad en la caja.',
];
const status: E = [
  'Situação do registro: concluída (tudo certo), pendente (aguardando confirmação) ou falha parcial (alguma etapa precisa ser retomada).',
  'Record status: completed (all good), pending (waiting for confirmation) or partial failure (a step needs to be resumed).',
  'Situación del registro: concluida (todo bien), pendiente (esperando confirmación) o falla parcial (alguna etapa debe reanudarse).',
];
const data: E = ['Dia em que o registro aconteceu.', 'Day the record happened.', 'Día en que ocurrió el registro.'];
const pagamento: E = ['Forma de pagamento usada pelo cliente: Pix, débito ou crédito.', 'Payment method used by the customer: Pix, debit or credit.', 'Forma de pago usada por el cliente: Pix, débito o crédito.'];
const operacao: E = ['Código da operação de split, para encontrar e conferir cada venda.', 'Split operation code, to find and check each sale.', 'Código de la operación de split, para encontrar y revisar cada venta.'];
const operacoes: E = ['Lista das vendas com a divisão (split) entre imposto, taxa e valor líquido.', 'List of sales with the split between tax, fee and net value.', 'Lista de las ventas con la división (split) entre impuesto, tasa y valor neto.'];
const despesas: E = ['Gastos já pagos pelo negócio, como estoque, energia e aluguel. Eles saem do caixa.', 'Expenses already paid by the business, such as stock, electricity and rent. They leave the cash.', 'Gastos ya pagados por el negocio, como inventario, electricidad y alquiler. Salen de la caja.'];
const entradasLiquidas: E = ['Soma do que entrou no caixa depois do split: vendas menos imposto e taxa.', 'Sum of what entered the cash after the split: sales minus tax and fees.', 'Suma de lo que entró en la caja después del split: ventas menos impuesto y tasa.'];
const saldoInicial: E = ['Dinheiro que havia no caixa no começo do período.', 'Money in the cash at the start of the period.', 'Dinero que había en la caja al comienzo del período.'];
const saldoFinal: E = ['Saldo inicial + entradas líquidas − despesas pagas, no fim do período.', 'Opening balance + net inflows − paid expenses, at the end of the period.', 'Saldo inicial + entradas netas − gastos pagados, al final del período.'];
const descricao: E = ['Texto curto que identifica o gasto ou a venda.', 'Short text that identifies the expense or sale.', 'Texto corto que identifica el gasto o la venta.'];
const categoria: E = ['Grupo do gasto (estoque, serviços, operacional…), para ver para onde vai o dinheiro.', 'Expense group (stock, services, operating…), to see where the money goes.', 'Grupo del gasto (inventario, servicios, operativo…), para ver adónde va el dinero.'];
const valor: E = ['Quantia em reais.', 'Amount in reais.', 'Cantidad en reales.'];
const periodoDe: E = ['Primeiro dia do período consultado.', 'First day of the period being viewed.', 'Primer día del período consultado.'];
const periodoAte: E = ['Último dia do período consultado.', 'Last day of the period being viewed.', 'Último día del período consultado.'];
const busca: E = ['Digite parte do texto ou do código para filtrar a lista.', 'Type part of the text or code to filter the list.', 'Escriba parte del texto o del código para filtrar la lista.'];
const tendencias: E = ['Compara este período com o período anterior de mesmo tamanho. Mostra o que subiu ou caiu, sem prever o futuro.', 'Compares this period with the previous period of the same length. Shows what went up or down, without predicting the future.', 'Compara este período con el período anterior de igual duración. Muestra qué subió o bajó, sin predecir el futuro.'];
const tipo: E = ['Se o movimento é entrada (dinheiro que chega) ou saída (dinheiro que sai).', 'Whether the transaction is an inflow (money coming in) or outflow (money going out).', 'Si el movimiento es entrada (dinero que llega) o salida (dinero que sale).'];

export const glossario: Record<string, E> = {
  // Apresentação: o problema que o Planner resolve.
  'seu negócio. cada valor, mais claro.': [
    'Com o split payment da Reforma Tributária, o imposto sai automaticamente no momento em que a venda é paga. O dinheiro que antes ficava no caixa até a data de recolher o imposto deixa de entrar, e o comerciante perde capital de giro. O Planner Comercial mostra esse impacto e ajuda a planejar o caixa.',
    'With the Tax Reform split payment, the tax is taken automatically the moment a sale is paid. Money that used to stay in the cash until the tax due date no longer comes in, and the merchant loses working capital. Planner Comercial shows this impact and helps plan the cash.',
    'Con el split payment de la Reforma Tributaria, el impuesto sale automáticamente en el momento en que se paga la venta. El dinero que antes quedaba en la caja hasta la fecha de pagar el impuesto deja de entrar, y el comerciante pierde capital de trabajo. Planner Comercial muestra ese impacto y ayuda a planificar la caja.',
  ],
  // Login e conta
  'e-mail': ['E-mail usado para entrar na conta.', 'Email used to sign in to the account.', 'Correo usado para iniciar sesión en la cuenta.'],
  senha: ['Sua senha de acesso. Use o olho para ver o que digitou. Após 5 tentativas erradas seguidas, o acesso fica bloqueado por 15 minutos.', 'Your access password. Use the eye to see what you typed. After 5 wrong attempts in a row, access is locked for 15 minutes.', 'Su contraseña de acceso. Use el ojo para ver lo que escribió. Tras 5 intentos erróneos seguidos, el acceso se bloquea por 15 minutos.'],
  'confirmar senha': ['Digite a mesma senha de novo, para evitar erro de digitação.', 'Type the same password again, to avoid typos.', 'Escriba la misma contraseña de nuevo, para evitar errores.'],
  'nova senha': ['A nova senha precisa ter pelo menos 12 caracteres.', 'The new password must have at least 12 characters.', 'La nueva contraseña debe tener al menos 12 caracteres.'],
  'lembrar de mim': ['Mantém você conectado neste aparelho até a sessão expirar. Não use em computador compartilhado. A senha nunca fica salva.', 'Keeps you signed in on this device until the session expires. Do not use on a shared computer. The password is never saved.', 'Lo mantiene conectado en este dispositivo hasta que la sesión expire. No lo use en una computadora compartida. La contraseña nunca se guarda.'],
  'seu nome': ['Nome da pessoa responsável pela conta.', 'Name of the person responsible for the account.', 'Nombre de la persona responsable de la cuenta.'],
  'nome do estabelecimento': ['Nome do seu negócio, como aparece para a equipe.', 'Your business name, as the team sees it.', 'Nombre de su negocio, como lo ve el equipo.'],
  'nome da loja': ['Nome do seu negócio, como aparece para a equipe.', 'Your business name, as the team sees it.', 'Nombre de su negocio, como lo ve el equipo.'],
  'entrar no planner': ['Entre com o e-mail e a senha da sua conta.', 'Sign in with your account email and password.', 'Inicie sesión con el correo y la contraseña de su cuenta.'],
  'recuperar conta': ['Se esqueceu a senha, informe seu e-mail para receber um link e criar uma nova.', 'If you forgot your password, enter your email to receive a link and create a new one.', 'Si olvidó su contraseña, ingrese su correo para recibir un enlace y crear una nueva.'],
  'criar conta e estabelecimento': ['Cria seu acesso e uma loja nova, ainda sem vendas.', 'Creates your access and a new store, still with no sales.', 'Crea su acceso y una tienda nueva, aún sin ventas.'],
  'criar nova senha': ['Defina a nova senha. O link do e-mail vale por pouco tempo e só uma vez.', 'Set the new password. The email link is valid for a short time and only once.', 'Defina la nueva contraseña. El enlace del correo vale por poco tiempo y una sola vez.'],
  'e-mail fictício': ['Use um e-mail de exemplo. Nesta prévia nada é enviado.', 'Use a sample email. Nothing is sent in this preview.', 'Use un correo de ejemplo. En esta vista previa no se envía nada.'],
  'senha fictícia': ['Use uma senha de exemplo. Nesta prévia nada é guardado.', 'Use a sample password. Nothing is stored in this preview.', 'Use una contraseña de ejemplo. En esta vista previa no se guarda nada.'],
  'nome do estabelecimento fictício': ['Nome de exemplo, só para testar a tela.', 'Sample name, just to try the screen.', 'Nombre de ejemplo, solo para probar la pantalla.'],

  // Painel
  'núcleo de split payment': ['Resumo de como suas vendas são divididas no pagamento: imposto, taxa e o que fica para você.', 'Summary of how your sales are split at payment: tax, fee and what stays with you.', 'Resumen de cómo se dividen sus ventas en el pago: impuesto, tasa y lo que queda para usted.'],
  'total bruto': bruto,
  'valor bruto': bruto,
  'valor bruto (r$)': bruto,
  bruto,
  'tributo separado': tributo,
  tributo,
  tributos: tributo,
  taxas: taxa,
  taxa,
  'valor líquido': liquido,
  líquido: liquido,
  'líquido previsto': ['Valor que deve entrar no caixa quando o split da venda terminar.', 'Amount expected to enter the cash when the sale split finishes.', 'Valor que debe entrar en la caja cuando termine el split de la venta.'],
  'líquido confirmado': ['Valor que já entrou no caixa depois do split concluído.', 'Amount that already entered the cash after the completed split.', 'Valor que ya entró en la caja después del split concluido.'],
  'composição do bruto': ['Mostra quanto de cada venda foi para imposto, para taxa e para você.', 'Shows how much of each sale went to tax, to fees and to you.', 'Muestra cuánto de cada venta fue al impuesto, a la tasa y a usted.'],
  'últimas operações': ['As vendas mais recentes e a situação do split de cada uma.', 'The most recent sales and the split status of each one.', 'Las ventas más recientes y la situación del split de cada una.'],
  'operações recentes': ['As vendas mais recentes e a situação do split de cada uma.', 'The most recent sales and the split status of each one.', 'Las ventas más recientes y la situación del split de cada una.'],
  'planner financeiro': ['Visão do seu caixa: quanto tem hoje e quanto deve ter, já descontando o imposto retido no pagamento.', 'View of your cash: how much you have today and how much you should have, already discounting the tax withheld at payment.', 'Visión de su caja: cuánto tiene hoy y cuánto debería tener, ya descontado el impuesto retenido en el pago.'],
  'saldo atual': ['Dinheiro disponível agora no caixa, considerando só o que já entrou e saiu de verdade.', 'Money available in the cash now, counting only what actually came in and went out.', 'Dinero disponible ahora en la caja, considerando solo lo que realmente entró y salió.'],
  'saldo projetado': ['Estimativa do caixa nos próximos dias, se o ritmo continuar. Ajuda a ver a falta de capital de giro antes de acontecer. Não é garantia.', 'Estimate of the cash over the next days if the pace continues. Helps you see a working capital shortfall before it happens. Not a guarantee.', 'Estimación de la caja en los próximos días si el ritmo continúa. Ayuda a ver la falta de capital de trabajo antes de que ocurra. No es garantía.'],
  'saldo realizado': ['Saldo calculado só com o que já aconteceu: entradas recebidas menos despesas pagas.', 'Balance calculated only from what already happened: inflows received minus expenses paid.', 'Saldo calculado solo con lo que ya ocurrió: entradas recibidas menos gastos pagados.'],
  'entradas líquidas': entradasLiquidas,
  entradas: entradasLiquidas,
  'despesas pagas': despesas,
  'saídas pagas': despesas,
  'vendas líquidas por período': ['Gráfico do valor líquido das vendas em cada intervalo de tempo.', 'Chart of the net sales value in each time period.', 'Gráfico del valor neto de las ventas en cada intervalo de tiempo.'],
  intervalo: ['Faixa de tempo agrupada no gráfico (dia ou semana).', 'Time range grouped in the chart (day or week).', 'Rango de tiempo agrupado en el gráfico (día o semana).'],
  'análise inteligente': ['Explicação em texto simples do que aconteceu no caixa. É feita por regras, sem mexer em valores.', 'Plain-text explanation of what happened in the cash. It is rule-based and does not change values.', 'Explicación en texto simple de lo que pasó en la caja. Se hace por reglas, sin alterar valores.'],
  'ações rápidas': ['Atalhos para as tarefas mais usadas.', 'Shortcuts to the most used tasks.', 'Atajos a las tareas más usadas.'],
  'tendência do saldo': ['Como o saldo deve se comportar nos próximos dias, no ritmo atual.', 'How the balance should behave over the next days, at the current pace.', 'Cómo debería comportarse el saldo en los próximos días, al ritmo actual.'],

  // Operações e vendas
  operações: operacoes,
  operação: operacao,
  'operações de split': operacoes,
  venda: ['Venda registrada no sistema.', 'Sale recorded in the system.', 'Venta registrada en el sistema.'],
  vendas: ['Histórico de vendas, inclusive pendentes e recusadas.', 'Sales history, including pending and declined ones.', 'Historial de ventas, incluidas pendientes y rechazadas.'],
  'últimas vendas': ['As vendas mais recentes registradas.', 'The most recent sales recorded.', 'Las ventas más recientes registradas.'],
  'detalhe da venda': ['Todos os dados de uma venda e do split dela.', 'All data of a sale and its split.', 'Todos los datos de una venta y de su split.'],
  'meio de pagamento': pagamento,
  'meio de pagamento simulado': pagamento,
  'forma de pagamento': pagamento,
  pagamento,
  'ordenar operações': ['Escolha a ordem da lista: mais recentes, mais antigas ou por valor.', 'Choose the list order: newest, oldest or by value.', 'Elija el orden de la lista: más recientes, más antiguas o por valor.'],
  'buscar operação': busca,
  'buscar venda': busca,
  'buscar despesa': busca,
  'buscar descrição': busca,
  status,
  de: periodoDe,
  até: periodoAte,
  data,
  'data e hora': data,
  'destino das parcelas': ['Para onde foi cada parte da venda: imposto, taxa e comerciante.', 'Where each part of the sale went: tax, fee and merchant.', 'Adónde fue cada parte de la venta: impuesto, tasa y comerciante.'],
  'destinos e status': ['Para onde foi cada parte da venda e se já foi confirmada.', 'Where each part of the sale went and whether it was confirmed.', 'Adónde fue cada parte de la venta y si ya se confirmó.'],
  'rastreabilidade da operação': ['Linha do tempo de tudo o que aconteceu com a venda, para conferência.', 'Timeline of everything that happened to the sale, for checking.', 'Línea de tiempo de todo lo que pasó con la venta, para verificación.'],
  'histórico da operação': ['Linha do tempo de tudo o que aconteceu com a venda, para conferência.', 'Timeline of everything that happened to the sale, for checking.', 'Línea de tiempo de todo lo que pasó con la venta, para verificación.'],
  'linha do tempo': ['Etapas da venda em ordem, do pagamento ao split.', 'Sale steps in order, from payment to split.', 'Etapas de la venta en orden, del pago al split.'],
  'dados da operação': ['Informações principais da venda e do split.', 'Main information about the sale and the split.', 'Información principal de la venta y del split.'],
  'parcelas roteadas': ['Partes da venda já enviadas ao destino (imposto, taxa, comerciante).', 'Parts of the sale already sent to their destination (tax, fee, merchant).', 'Partes de la venta ya enviadas a su destino (impuesto, tasa, comerciante).'],
  'parcelas informadas': ['Partes da venda informadas pelo servidor.', 'Parts of the sale reported by the server.', 'Partes de la venta informadas por el servidor.'],
  'retomar parcelas pendentes': ['Conclui só as partes que faltaram, sem cobrar de novo.', 'Completes only the missing parts, without charging again.', 'Concluye solo las partes que faltaron, sin cobrar de nuevo.'],
  'entenda este split': ['Explicação simples de como esta venda foi dividida.', 'Simple explanation of how this sale was split.', 'Explicación simple de cómo se dividió esta venta.'],
  comerciante: liquido,
  split: ['Divisão automática do pagamento: o imposto vai direto para o governo e só o restante chega ao comerciante.', 'Automatic split of the payment: the tax goes straight to the government and only the rest reaches the merchant.', 'División automática del pago: el impuesto va directo al gobierno y solo el resto llega al comerciante.'],

  // Despesas
  despesas,
  'despesas registradas': despesas,
  'últimas despesas': despesas,
  'nova despesa paga': ['Registre um gasto que já foi pago.', 'Record an expense that was already paid.', 'Registre un gasto que ya fue pagado.'],
  'cadastrar despesa': ['Registre um gasto que já foi pago.', 'Record an expense that was already paid.', 'Registre un gasto que ya fue pagado.'],
  'filtrar categoria': categoria,
  'pagamento de': periodoDe,
  'pagamento até': periodoAte,
  descrição: descricao,
  'descrição da despesa': descricao,
  categoria,
  valor,
  'valor (r$)': valor,
  'data do pagamento': ['Dia em que a despesa foi paga.', 'Day the expense was paid.', 'Día en que se pagó el gasto.'],

  // Fluxo de caixa
  'fluxo de caixa': ['Entradas e saídas de dinheiro no período e o saldo resultante.', 'Money in and out during the period and the resulting balance.', 'Entradas y salidas de dinero en el período y el saldo resultante.'],
  'data inicial': periodoDe,
  'data final': periodoAte,
  'saldo inicial': saldoInicial,
  'saldo final': saldoFinal,
  'movimentações realizadas': ['Cada entrada e saída que já aconteceu, em ordem.', 'Each inflow and outflow that already happened, in order.', 'Cada entrada y salida que ya ocurrió, en orden.'],
  movimentação: ['Descrição da entrada ou saída de dinheiro.', 'Description of the money in or out.', 'Descripción de la entrada o salida de dinero.'],
  tipo,
  'caixa por semana': ['Saldo do caixa semana a semana, de segunda a domingo.', 'Cash balance week by week, Monday to Sunday.', 'Saldo de la caja semana a semana, de lunes a domingo.'],
  'projeção de caixa': ['Simule entradas e despesas previstas para ver se vai faltar dinheiro. Não é garantia.', 'Simulate expected inflows and expenses to see if money will run short. Not a guarantee.', 'Simule entradas y gastos previstos para ver si faltará dinero. No es garantía.'],
  'planejar o caixa': ['Simule entradas e despesas previstas para ver se vai faltar dinheiro. Não é garantia.', 'Simulate expected inflows and expenses to see if money will run short. Not a guarantee.', 'Simule entradas y gastos previstos para ver si faltará dinero. No es garantía.'],
  'planejar até': ['Último dia da projeção.', 'Last day of the projection.', 'Último día de la proyección.'],
  'entradas líquidas previstas (r$)': ['Quanto você espera receber, já sem imposto e taxa.', 'How much you expect to receive, already without tax and fees.', 'Cuánto espera recibir, ya sin impuesto ni tasa.'],
  'despesas previstas (r$)': ['Quanto você espera gastar no período.', 'How much you expect to spend in the period.', 'Cuánto espera gastar en el período.'],

  // Análise
  'análise com ia': ['Explicação do período em texto simples. Nesta versão é feita por regras, sem IA externa e sem mexer em valores.', 'Plain-text explanation of the period. In this version it is rule-based, with no external AI and without changing values.', 'Explicación del período en texto simple. En esta versión se hace por reglas, sin IA externa y sin alterar valores.'],
  'análise financeira': ['Explicação do período em texto simples, feita por regras a partir dos seus registros.', 'Plain-text explanation of the period, rule-based from your records.', 'Explicación del período en texto simple, por reglas a partir de sus registros.'],
  'análise de': periodoDe,
  'análise até': periodoAte,
  'tendências do período': tendencias,
  'comparação de tendências': tendencias,
  indicador: ['O número que está sendo comparado.', 'The number being compared.', 'El número que se compara.'],
  anterior: ['Valor no período anterior, de mesmo tamanho.', 'Value in the previous period, of the same length.', 'Valor en el período anterior, de igual duración.'],
  selecionado: ['Valor no período que você escolheu.', 'Value in the period you chose.', 'Valor en el período que eligió.'],
  variação: ['Diferença entre o período escolhido e o anterior.', 'Difference between the chosen period and the previous one.', 'Diferencia entre el período elegido y el anterior.'],
  'vendas brutas concluídas': bruto,
  recomendações: ['Sugestões para cuidar do caixa. Não executam nenhuma ação sozinhas.', 'Suggestions to take care of the cash. They do not take any action on their own.', 'Sugerencias para cuidar la caja. No ejecutan ninguna acción por sí solas.'],

  // Simulação
  'simulação split': ['Teste quanto de uma venda vai para imposto e taxa antes de vender. Nada é registrado.', 'Test how much of a sale goes to tax and fees before selling. Nothing is recorded.', 'Pruebe cuánto de una venta va al impuesto y a la tasa antes de vender. No se registra nada.'],
  'simular composição': ['Informe um valor para ver a divisão entre imposto, taxa e líquido.', 'Enter a value to see the split between tax, fee and net.', 'Ingrese un valor para ver la división entre impuesto, tasa y neto.'],
  'resumo do cenário': ['Totais do exemplo escolhido.', 'Totals for the chosen example.', 'Totales del ejemplo elegido.'],
  'visualizar estado': ['Mostra como a tela fica em cada situação (carregando, vazia, com erro).', 'Shows how the screen looks in each situation (loading, empty, error).', 'Muestra cómo queda la pantalla en cada situación (cargando, vacía, con error).'],
  'como ler o resultado': ['Guia para entender cada número da simulação.', 'Guide to understand each number in the simulation.', 'Guía para entender cada número de la simulación.'],
  'resultado da simulação': ['Divisão calculada para o valor informado.', 'Split calculated for the value entered.', 'División calculada para el valor informado.'],
  'resultado para a entrada informada': ['Divisão calculada para o valor informado.', 'Split calculated for the value entered.', 'División calculada para el valor informado.'],
  'percentual hipotético de tributo (%)': ['Percentual de imposto só para teste. Não é alíquota oficial.', 'Tax percentage for testing only. Not an official rate.', 'Porcentaje de impuesto solo para prueba. No es una alícuota oficial.'],
  'categoria do tributo': ['Tipo de regra de imposto usada no cálculo.', 'Type of tax rule used in the calculation.', 'Tipo de regla de impuesto usada en el cálculo.'],

  // Configurações e ajuda
  'sobre esta demonstração': ['O que esta versão faz e o que é só simulação.', 'What this version does and what is only simulation.', 'Qué hace esta versión y qué es solo simulación.'],
  configurações: ['Dados da sua conta e da loja.', 'Your account and store data.', 'Datos de su cuenta y de la tienda.'],
  'estados da demonstração': ['Permite ver a tela em situações diferentes, para testes.', 'Lets you see the screen in different situations, for testing.', 'Permite ver la pantalla en situaciones diferentes, para pruebas.'],
  'cenário das consultas': ['Escolha a situação simulada das consultas (normal, vazia, com erro).', 'Choose the simulated query situation (normal, empty, error).', 'Elija la situación simulada de las consultas (normal, vacía, con error).'],
  'contexto da sessão': ['Quem está conectado e com qual perfil.', 'Who is signed in and with which profile.', 'Quién está conectado y con qué perfil.'],
  nome: ['Nome da pessoa conectada.', 'Name of the signed-in person.', 'Nombre de la persona conectada.'],
  perfil: ['Papel da pessoa na loja. Define o que ela pode ver e fazer.', 'Role of the person in the store. Defines what they can see and do.', 'Rol de la persona en la tienda. Define lo que puede ver y hacer.'],
  modo: ['Se está usando a demonstração local ou o MVP online.', 'Whether you are using the local demo or the online MVP.', 'Si está usando la demostración local o el MVP en línea.'],
  'referência dos dados': ['Data usada como base para os dados de exemplo.', 'Date used as the basis for the sample data.', 'Fecha usada como base para los datos de ejemplo.'],
  armazenamento: ['Onde os dados ficam guardados.', 'Where the data is stored.', 'Dónde se guardan los datos.'],
  dispositivo: ['Aparelho usado na demonstração.', 'Device used in the demo.', 'Dispositivo usado en la demostración.'],
  'integração e próximos passos': ['O que já funciona com o servidor e o que ainda falta.', 'What already works with the server and what is still missing.', 'Lo que ya funciona con el servidor y lo que aún falta.'],
  'recursos de demonstração': ['Funções disponíveis nesta versão de demonstração.', 'Features available in this demo version.', 'Funciones disponibles en esta versión de demostración.'],
  'recursos e limites do mvp': ['O que o MVP faz e seus limites atuais.', 'What the MVP does and its current limits.', 'Lo que hace el MVP y sus límites actuales.'],
  'créditos e referência': ['Quem fez o projeto e onde está o protótipo de design.', 'Who made the project and where the design prototype is.', 'Quién hizo el proyecto y dónde está el prototipo de diseño.'],
  'ajuda e guia de uso': ['Perguntas frequentes e como usar cada tela.', 'Frequently asked questions and how to use each screen.', 'Preguntas frecuentes y cómo usar cada pantalla.'],
  'dados do estabelecimento': ['Informações da sua loja.', 'Your store information.', 'Información de su tienda.'],
  estabelecimento: ['Sua loja no sistema.', 'Your store in the system.', 'Su tienda en el sistema.'],

  // Capital de giro
  'capital de giro': ['Dinheiro emprestado por um banco ou fintech parceira para cobrir o caixa quando ele fica apertado, por exemplo depois que o imposto passa a sair na hora da venda. No MVP é simulado.', 'Money lent by a partner bank or fintech to cover the cash when it gets tight, for example after the tax starts leaving at the moment of sale. Simulated in the MVP.', 'Dinero prestado por un banco o fintech asociado para cubrir la caja cuando queda ajustada, por ejemplo cuando el impuesto empieza a salir en el momento de la venta. Simulado en el MVP.'],
  'parceiro financeiro': ['Instituição autorizada (banco ou fintech) que analisa, aprova e libera o crédito. O Planner só mostra a oferta.', 'Authorized institution (bank or fintech) that reviews, approves and releases the credit. Planner only shows the offer.', 'Institución autorizada (banco o fintech) que analiza, aprueba y libera el crédito. El Planner solo muestra la oferta.'],
  'compartilhamento de dados': ['Sua autorização para o parceiro ver só totais da loja (vendas líquidas, despesas e número de vendas em 90 dias). Pode ser revogada a qualquer momento.', 'Your authorization for the partner to see only store totals (net sales, expenses and number of sales in 90 days). Can be revoked at any time.', 'Su autorización para que el socio vea solo totales de la tienda (ventas netas, gastos y número de ventas en 90 días). Se puede revocar en cualquier momento.'],
  'autorizo compartilhar esses dados com o parceiro financeiro': ['Marque para permitir que o parceiro use os totais da loja para calcular seu limite. Nenhum dado de clientes é enviado.', 'Check to let the partner use store totals to calculate your limit. No customer data is sent.', 'Marque para permitir que el socio use los totales de la tienda para calcular su límite. No se envían datos de clientes.'],
  'simular capital de giro': ['Escolha valor e parcelas para ver quanto vai pagar antes de decidir. Simular não contrata nada.', 'Choose amount and installments to see how much you will pay before deciding. Simulating does not contract anything.', 'Elija monto y cuotas para ver cuánto pagará antes de decidir. Simular no contrata nada.'],
  'valor do crédito (r$)': ['Quanto você quer receber, entre R$ 500,00 e o limite disponível.', 'How much you want to receive, between R$ 500,00 and the available limit.', 'Cuánto quiere recibir, entre R$ 500,00 y el límite disponible.'],
  'número de parcelas': ['Em quantos meses você vai pagar, de 1 a 12. Mais parcelas deixam cada parcela menor, mas aumentam os juros totais.', 'In how many months you will pay, from 1 to 12. More installments make each one smaller but increase total interest.', 'En cuántos meses pagará, de 1 a 12. Más cuotas hacen cada una menor, pero aumentan los intereses totales.'],
  'limite disponível': ['Valor máximo que o parceiro aceita emprestar agora, calculado a partir das vendas dos últimos 90 dias.', 'Maximum amount the partner accepts to lend now, calculated from the last 90 days of sales.', 'Monto máximo que el socio acepta prestar ahora, calculado a partir de las ventas de los últimos 90 días.'],
  'entradas líquidas em 90 dias': ['Soma do que entrou no caixa depois do split nos últimos 90 dias. É a base usada pelo parceiro.', 'Sum of what entered the cash after the split in the last 90 days. It is the basis used by the partner.', 'Suma de lo que entró en la caja después del split en los últimos 90 días. Es la base usada por el socio.'],
  'valor da parcela': ['Quanto sai do caixa todo mês para pagar o crédito.', 'How much leaves the cash every month to pay the credit.', 'Cuánto sale de la caja cada mes para pagar el crédito.'],
  'total a pagar': ['Soma de todas as parcelas. Compare com o valor recebido para saber o custo do crédito.', 'Sum of all installments. Compare it with the amount received to know the cost of the credit.', 'Suma de todas las cuotas. Compárela con el monto recibido para saber el costo del crédito.'],
  juros: ['Quanto você paga a mais pelo empréstimo: total a pagar menos o valor recebido.', 'How much extra you pay for the loan: total to pay minus the amount received.', 'Cuánto paga de más por el préstamo: total a pagar menos el monto recibido.'],
  'taxa de juros': ['Percentual cobrado por mês sobre o saldo devedor.', 'Percentage charged per month on the outstanding balance.', 'Porcentaje cobrado por mes sobre el saldo deudor.'],
  'cet estimado': ['Custo Efetivo Total: o custo do crédito em um ano, somando juros e encargos. Use para comparar ofertas. Aqui é estimado e não inclui tarifas.', 'Total Effective Cost: the yearly cost of the credit, adding interest and charges. Use it to compare offers. Here it is estimated and does not include fees.', 'Costo Efectivo Total: el costo del crédito en un año, sumando intereses y cargos. Úselo para comparar ofertas. Aquí es estimado y no incluye tarifas.'],
  'primeira parcela': ['Data em que vence o primeiro pagamento, um mês depois da contratação.', 'Date the first payment is due, one month after contracting.', 'Fecha de vencimiento del primer pago, un mes después de la contratación.'],
  'proposta válida até': ['Depois dessa data a proposta vence e é preciso simular de novo.', 'After this date the offer expires and you need to simulate again.', 'Después de esta fecha la propuesta vence y es necesario simular de nuevo.'],
  'li e concordo com o valor total, a taxa de juros e o cet': ['Confirme que conferiu quanto vai pagar no total antes de contratar.', 'Confirm you checked how much you will pay in total before contracting.', 'Confirme que revisó cuánto pagará en total antes de contratar.'],
  'contratos de capital de giro': ['Créditos já contratados e o calendário de parcelas de cada um.', 'Credits already contracted and the installment schedule of each one.', 'Créditos ya contratados y el calendario de cuotas de cada uno.'],
  parcela: ['Número da parcela no contrato.', 'Installment number in the contract.', 'Número de la cuota en el contrato.'],
  vencimento: ['Data limite para pagar a parcela.', 'Deadline to pay the installment.', 'Fecha límite para pagar la cuota.'],
  'situação': ['Se a parcela já foi paga ou ainda vai vencer.', 'Whether the installment was paid or is still upcoming.', 'Si la cuota ya se pagó o aún está por vencer.'],
  'parcelas até a data': ['Parcelas do capital de giro que vencem até o fim do período projetado. Elas saem do caixa.', 'Working capital installments due by the end of the projected period. They leave the cash.', 'Cuotas del capital de trabajo que vencen hasta el final del período proyectado. Salen de la caja.'],

  // Venda (POS) e relatórios
  'nova venda demonstrativa': ['Simula uma venda para ver o split acontecer. Nenhum dinheiro é movimentado.', 'Simulates a sale to watch the split happen. No money is moved.', 'Simula una venta para ver el split. No se mueve dinero.'],
  'nova venda': ['Registra uma venda e mostra a divisão do pagamento.', 'Records a sale and shows the payment split.', 'Registra una venta y muestra la división del pago.'],
  'registrar uma venda': ['Informe o valor e a forma de pagamento da venda.', 'Enter the sale value and payment method.', 'Ingrese el valor y la forma de pago de la venta.'],
  'valor da venda (r$)': ['Valor total cobrado do cliente.', 'Total amount charged to the customer.', 'Monto total cobrado al cliente.'],
  'valor da venda': ['Valor total cobrado do cliente.', 'Total amount charged to the customer.', 'Monto total cobrado al cliente.'],
  'cenário de demonstração': ['Escolha o resultado simulado: sucesso, recusa ou falha parcial.', 'Choose the simulated result: success, decline or partial failure.', 'Elija el resultado simulado: éxito, rechazo o falla parcial.'],
  'venda simulada': ['Venda de teste, sem dinheiro real.', 'Test sale, with no real money.', 'Venta de prueba, sin dinero real.'],
  relatórios: ['Listas de vendas, despesas e impostos por período, com exportação em CSV.', 'Lists of sales, expenses and taxes by period, with CSV export.', 'Listas de ventas, gastos e impuestos por período, con exportación en CSV.'],
  'tipo de relatório': ['Escolha o que listar: vendas, despesas ou impostos.', 'Choose what to list: sales, expenses or taxes.', 'Elija qué listar: ventas, gastos o impuestos.'],
  'composição das vendas concluídas': ['Divisão das vendas concluídas entre imposto, taxa e líquido.', 'Split of completed sales between tax, fee and net.', 'División de las ventas concluidas entre impuesto, tasa y neto.'],
  'valores informados pelo servidor': ['Números calculados e confirmados pelo servidor.', 'Numbers calculated and confirmed by the server.', 'Números calculados y confirmados por el servidor.'],
  'acesse o smart pos': ['Abre a simulação da maquininha de cartão.', 'Opens the card machine simulation.', 'Abre la simulación de la terminal de pago.'],
  'prévia de acesso': ['Prévia das telas de cadastro e login, sem enviar dados.', 'Preview of the sign-up and sign-in screens, without sending data.', 'Vista previa de las pantallas de registro e inicio de sesión, sin enviar datos.'],
};

# Operação da demonstração publicada

Este documento fecha a operação mínima do ambiente publicado:

```text
Vercel → Render → Supabase
```

## Monitoramento público

O workflow `Monitoramento público` roda a cada 30 minutos no GitHub Actions e
verifica:

- readiness da API;
- resposta HTTP do frontend;
- CORS entre frontend e API.

Para executar manualmente:

1. Abra o repositório no GitHub.
2. Vá em **Actions**.
3. Selecione **Monitoramento público**.
4. Clique em **Run workflow**.

O Render Free pode levar até alguns minutos para acordar. O workflow aguarda
até três tentativas da API antes de falhar.

## Backup

O backup deve ser executado fora do repositório, em máquina ou serviço com
armazenamento protegido. Nunca salvar `.env.supabase`, certificado ou senha no
GitHub.

Pré-requisitos:

- `pg_dump` da mesma família do PostgreSQL remoto;
- `.pgpass` com permissão `0600`, ou variáveis PostgreSQL injetadas pelo
  gerenciador de segredos;
- diretório de backup fora do projeto;
- cópia externa criptografada.

Exemplo de execução manual:

```bash
export BACKUP_DIR=/var/backups/planner
export PGHOST=aws-0-us-east-1.pooler.supabase.com
export PGPORT=5432
export PGUSER=split_owner.icbecoadwiqmatmbccup
export PGDATABASE=postgres
export PGPASSFILE=/etc/planner/pgpass
bash scripts/operacao/backup-agendado.sh
```

O arquivo de senha deve conter a linha correspondente ao host, porta, banco,
usuário e senha e ter permissão `0600`. O script cria um dump customizado com
nome UTC, não sobrescreve arquivos e não apaga backups antigos.

## Agendamento recomendado

Depois de validar uma execução manual, configurar no servidor:

```cron
0 3 * * * cd /opt/avanade && BACKUP_DIR=/var/backups/planner PGPASSFILE=/etc/planner/pgpass bash scripts/operacao/backup-agendado.sh >> /var/log/planner-backup.log 2>&1
```

O responsável operacional deve definir retenção, criptografia, cópia externa e
alerta de falha. A primeira execução deve ser acompanhada manualmente.

## Restauração de teste

Nunca restaurar sobre o banco de produção. Criar um banco vazio descartável,
configurar `PGDATABASE` para ele e executar:

```bash
export PGDATABASE=planner_restore_test
bash backend/scripts/restore.sh /var/backups/planner/ARQUIVO.dump
```

O script recusa schemas não vazios e usa uma transação única. Depois da
restauração, validar migrations, login e uma consulta de operações. Registrar a
data, o arquivo restaurado e o resultado do teste.

## Responsabilidades antes de uso compartilhado

- responsável pelas credenciais do Supabase;
- responsável pelo Render e pelos logs;
- responsável pelos backups e restauração;
- periodicidade e retenção aprovadas;
- contato para falhas do monitoramento.

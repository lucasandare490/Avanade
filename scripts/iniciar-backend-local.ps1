param([string]$Jdk, [switch]$PopularCenario)
$ErrorActionPreference = 'Stop'
# Reutiliza a API local reconhecida; não encerra processos nem altera portas.
$tcpTeste = New-Object System.Net.Sockets.TcpClient
$portaOcupada = $false
try {
    $conexao = $tcpTeste.ConnectAsync('127.0.0.1', 8080)
    $portaOcupada = $conexao.Wait(1000) -and $tcpTeste.Connected
} catch { $portaOcupada = $false } finally { $tcpTeste.Dispose() }
if ($portaOcupada) {
    $apiReconhecida = $false
    try {
        $saude = Invoke-RestMethod 'http://127.0.0.1:8080/actuator/health' -TimeoutSec 5
        $contrato = Invoke-RestMethod 'http://127.0.0.1:8080/v3/api-docs' -TimeoutSec 5
        $apiReconhecida = $saude.status -eq 'UP' -and $contrato.info.title -eq 'Split demonstrativo' -and $null -ne $contrato.paths.'/api/v1/sales'
    } catch { $apiReconhecida = $false }
    if ($apiReconhecida) {
        if ($PopularCenario) { throw 'Para carregar o cenário, encerre a API no terminal de origem e repita este comando com -PopularCenario. Nenhum dado foi inserido nesta execução.' }
        Write-Host 'O backend do Planner já está ativo em http://127.0.0.1:8080.'
        Write-Host 'Abra http://127.0.0.1:5173 para usar o frontend. Nenhuma segunda API foi iniciada.'
        Write-Host 'Se alterou código Java, encerre a API anterior no terminal de origem antes de reiniciar.'
        return
    }
    throw 'A porta 8080 está ocupada, mas não foi possível confirmar a API do Planner. Confira o processo antes de iniciar; nenhum processo foi encerrado.'
}
Push-Location (Join-Path $PSScriptRoot '../backend')
try {
    if ($Jdk) { $env:JAVA_HOME = $Jdk }
    if (-not $env:JAVA_HOME) {
        $jdkLocal = Get-ChildItem -LiteralPath 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
        if ($jdkLocal) { $env:JAVA_HOME = $jdkLocal.FullName }
        else { throw 'Informe -Jdk com a pasta do JDK 21 ou configure JAVA_HOME nesta sessão.' }
    }
    $java = Join-Path $env:JAVA_HOME 'bin/java.exe'
    if (-not (Test-Path -LiteralPath $java)) { throw 'JDK não encontrado.' }
    $env:PATH = (Join-Path $env:JAVA_HOME 'bin') + ';' + $env:PATH
    New-Item -ItemType Directory -Force '.local' | Out-Null
    $senha = Join-Path $PWD '.local/demo-password'
    if (-not $env:DEMO_PASSWORD) {
        if (Test-Path -LiteralPath $senha) { $env:DEMO_PASSWORD = [IO.File]::ReadAllText($senha).Trim() }
        else {
            $env:DEMO_PASSWORD = [Guid]::NewGuid().ToString('N')
            [IO.File]::WriteAllText($senha, $env:DEMO_PASSWORD)
        }
    }
    & ./mvnw.cmd -q test-compile dependency:build-classpath '-Dmdep.outputFile=target/local-classpath.txt' '-Dmdep.includeScope=test'
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar a API.' }
    $classpath = 'target/test-classes;target/classes;' + (Get-Content 'target/local-classpath.txt' -Raw).Trim()
    if ($PopularCenario) { & $java -cp $classpath br.com.avanade.split.LocalDemo '--cenario-completo' }
    else { & $java -cp $classpath br.com.avanade.split.LocalDemo }
    if ($LASTEXITCODE -ne 0) { throw 'A API encerrou com erro. Confira os logs acima.' }
} finally { Pop-Location }

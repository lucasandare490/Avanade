plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "br.com.planner.pos"
    compileSdk = 35
    defaultConfig { applicationId = "br.com.planner.pos.demo"; minSdk = 24; targetSdk = 35; versionCode = 1; versionName = "0.1-demo" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    testOptions { unitTests.isIncludeAndroidResources = true }
}

dependencies { testImplementation("junit:junit:4.13.2"); testImplementation("org.robolectric:robolectric:4.14.1"); testImplementation("org.json:json:20240303") }

kotlin { compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) } }

// Inventário das versões realmente resolvidas; não inclui credenciais nem arquivos locais.
tasks.register("inventariarDependencias") {
    doLast {
        val coordinates = configurations.filter { it.isCanBeResolved && (it.name == "debugRuntimeClasspath" || it.name == "debugUnitTestRuntimeClasspath") }
            .flatMap { configuration -> configuration.incoming.resolutionResult.allComponents.mapNotNull {
                it.moduleVersion?.let { m -> "${m.group}:${m.name}:${m.version}" }
            } }.distinct().sorted()
        val output = layout.buildDirectory.file("reports/dependencias-resolvidas.txt").get().asFile
        output.parentFile.mkdirs()
        output.writeText(coordinates.joinToString("\n") + "\n")
    }
}

// Dependência transitiva exclusiva do ambiente de testes Robolectric.
dependencies {
    constraints {
        testImplementation("org.bouncycastle:bcprov-jdk18on:1.85") {
            because("Correções de segurança de ASN.1, restrições de nomes, LDAP e GOST")
        }
    }
}

# Déploiement — Looga App Utilisateur

## 1. Créer la Keystore (une seule fois)

La keystore est la signature officielle de l'app. **Ne jamais la perdre** — sans elle, impossible de mettre à jour l'app sur le Play Store.

```bash
keytool -genkey -v -keystore looga-release.keystore \
  -alias looga -keyalg RSA -keysize 2048 -validity 10000
```

Répondre aux questions :
- Mot de passe keystore → ex: `MotDePasseFort2026!`
- Mot de passe alias → même mot de passe
- Prénom/Nom → `Looga`
- Organisation → `Looga`
- Ville → `Abidjan`
- Pays → `CI`

Déplacer le fichier généré dans `android/app/looga-release.keystore`.

**Ne jamais commiter la keystore dans git.**

---

## 2. Configurer la signature dans Gradle

Dans `android/app/build.gradle`, ajouter avant `android {}` :

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

Créer `android/keystore.properties` (ne pas commiter) :

```properties
storeFile=app/looga-release.keystore
storePassword=MotDePasseFort2026!
keyAlias=looga
keyPassword=MotDePasseFort2026!
```

Ajouter dans `android/.gitignore` :
```
keystore.properties
app/looga-release.keystore
```

---

## 3. Générer le Release APK

```bash
export JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="C:/Users/bogbe/AppData/Local/Android/Sdk"
cd C:/lg/android
./gradlew assembleRelease
```

APK généré dans :
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 4. Publier sur le Play Store

### Prérequis
- Compte Google Play Console → https://play.google.com/console
- Frais d'inscription : 25 USD (une seule fois)
- Package ID configuré dans `app.json` : `ci.looga.app`

### Étapes
1. Créer l'app dans la Play Console
2. Remplir la fiche store (description, captures d'écran, icône)
3. Uploader l'APK (ou AAB — voir ci-dessous) dans une release
4. Soumettre pour review Google (~3 jours)

### AAB recommandé pour le Play Store

Google préfère le format AAB (plus léger que l'APK) :

```bash
./gradlew bundleRelease
```

Fichier généré : `android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. Mettre à jour l'app

À chaque nouvelle version :

1. Incrémenter `versionCode` dans `app.json` (ex: 1 → 2)
2. Mettre à jour `version` si besoin (ex: "1.0.0" → "1.1.0")
3. Relancer `npx expo prebuild` si des dépendances natives ont changé
4. Générer le nouvel APK/AAB
5. Uploader dans la Play Console

---

## Résumé des commandes

| Action | Commande |
|--------|----------|
| Build debug (test) | `./gradlew assembleDebug` |
| Build release APK | `./gradlew assembleRelease` |
| Build release AAB (Play Store) | `./gradlew bundleRelease` |
| Régénérer le dossier android/ | `npx expo prebuild` |

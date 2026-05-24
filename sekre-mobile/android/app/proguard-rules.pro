# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ─────────────────────────────────────────────────────────────────
# React Native core
# ─────────────────────────────────────────────────────────────────
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.internal.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}

-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

# ─────────────────────────────────────────────────────────────────
# Hermes
# ─────────────────────────────────────────────────────────────────
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# ─────────────────────────────────────────────────────────────────
# Fresco (image loader bundled with RN)
# ─────────────────────────────────────────────────────────────────
-keep class com.facebook.imagepipeline.** { *; }

# ─────────────────────────────────────────────────────────────────
# OkHttp / Retrofit (commonly used in RN apps)
# ─────────────────────────────────────────────────────────────────
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# ─────────────────────────────────────────────────────────────────
# Gson / JSON (defensive — keeps reflection-based serialization)
# ─────────────────────────────────────────────────────────────────
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# ─────────────────────────────────────────────────────────────────
# react-native-mmkv (com.mrousavy.mmkv)
# Native module pakai JNI + reflection — tidak ship proguard rules sendiri.
# Tanpa keep rules ini, R8 bisa strip JNI bridge dan crash di release build.
# ─────────────────────────────────────────────────────────────────
-keep class com.mrousavy.mmkv.** { *; }
-keepclassmembers class com.mrousavy.mmkv.** { *; }
-dontwarn com.mrousavy.mmkv.**

# ─────────────────────────────────────────────────────────────────
# react-native-keychain (com.oblador.keychain)
# Pakai Android Keystore API via reflection — strip bisa menyebabkan
# credential storage gagal di release build.
# ─────────────────────────────────────────────────────────────────
-keep class com.oblador.keychain.** { *; }
-keepclassmembers class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# ─────────────────────────────────────────────────────────────────
# react-native-bootsplash (com.zoontek.rnbootsplash)
# Native module untuk splash screen — tidak ship proguard rules sendiri.
# ─────────────────────────────────────────────────────────────────
-keep class com.zoontek.rnbootsplash.** { *; }
-keepclassmembers class com.zoontek.rnbootsplash.** { *; }
-dontwarn com.zoontek.rnbootsplash.**

# ─────────────────────────────────────────────────────────────────
# Sentry React Native (io.sentry.react)
# Sentry SDK (io.sentry.**) ship rules sendiri via AAR.
# Hanya RN bridge layer yang perlu explicit keep.
# ─────────────────────────────────────────────────────────────────
-keep class io.sentry.react.** { *; }
-keepclassmembers class io.sentry.react.** { *; }
-dontwarn io.sentry.react.**

# ─────────────────────────────────────────────────────────────────
# react-native-reanimated (com.swmansion.reanimated)
# Reanimated pakai worklet runtime + JNI bridge yang sensitif terhadap
# obfuscation. Tanpa keep rules ini, animasi bisa crash di release build.
# ─────────────────────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keepclassmembers class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# ─────────────────────────────────────────────────────────────────
# react-native-gesture-handler (com.swmansion.gesturehandler)
# GestureHandler pakai reflection untuk event routing.
# ─────────────────────────────────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }
-keepclassmembers class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# ─────────────────────────────────────────────────────────────────
# react-native-screens (com.swmansion.rnscreens)
# RN Screens pakai Fragment + ViewManager yang bisa di-strip.
# ─────────────────────────────────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }
-keepclassmembers class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ─────────────────────────────────────────────────────────────────
# react-native-vector-icons (com.oblador.vectoricons)
# Pakai font loading via reflection.
# ─────────────────────────────────────────────────────────────────
-keep class com.oblador.vectoricons.** { *; }
-keepclassmembers class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# ─────────────────────────────────────────────────────────────────
# @shopify/flash-list
# Pure JS + C++ layer — tidak ada Java/Kotlin native module.
# Tidak butuh explicit keep rules.
# ─────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────
# react-native-config (com.lugg.RNCConfig)
# Pakai BuildConfig reflection untuk env vars.
# ─────────────────────────────────────────────────────────────────
-keep class com.lugg.RNCConfig.** { *; }
-keepclassmembers class com.lugg.RNCConfig.** { *; }
-dontwarn com.lugg.RNCConfig.**

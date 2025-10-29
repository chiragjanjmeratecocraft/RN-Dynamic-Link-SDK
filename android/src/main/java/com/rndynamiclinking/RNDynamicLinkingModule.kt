package com.rndynamiclinking

import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNDynamicLinkingModule.NAME)
class RNDynamicLinkingModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var referrerClient: InstallReferrerClient? = null
    private var hasFetched = false
    private var pendingPromise: Promise? = null

    override fun getName(): String = NAME

    @ReactMethod
    fun getReferralCode(promise: Promise) {
        // Block duplicate calls
        if (hasFetched || referrerClient != null) {
            pendingPromise = promise
            return
        }

        hasFetched = true
        pendingPromise = promise
        val context = reactApplicationContext

        referrerClient = InstallReferrerClient.newBuilder(context).build()
        referrerClient?.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val raw = referrerClient?.installReferrer?.installReferrer.orEmpty().trim()

                            // BLOCK organic / default values
                            if (isOrganicReferrer(raw)) {
                                // Do nothing — no resolve
                            } else if (raw.isNotBlank()) {
                                // Only resolve with REAL codes
                                pendingPromise?.resolve(raw)
                            }
                            // Else: no code → do nothing
                        } catch (e: Exception) {
                            // Silent
                        } finally {
                            cleanup()
                        }
                    }
                    else -> {
                        cleanup()
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {
                cleanup()
            }
        })
    }

    private fun cleanup() {
        referrerClient?.endConnection()
        referrerClient = null
        pendingPromise = null
    }

    // BLOCK organic & default referrer strings
    private fun isOrganicReferrer(referrer: String): Boolean {
        return referrer.isBlank() ||
                referrer.contains("utm_source=google-play") ||
                referrer.contains("utm_medium=organic") ||
                referrer.contains("com.android.browser") ||
                referrer.contains("com.android.vending") ||
                referrer.startsWith("utm_") // any UTM param
    }

    companion object {
        const val NAME = "RNDynamicLinking"
    }
}
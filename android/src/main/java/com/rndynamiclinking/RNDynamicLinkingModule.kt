package com.rndynamiclinking

import android.util.Log
import com.android.installreferrer.api.InstallReferrerClient
import com.android.installreferrer.api.InstallReferrerStateListener
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = RNDynamicLinkingModule.NAME)
class RNDynamicLinkingModule(reactContext: ReactApplicationContext) :
    NativeRNDynamicLinkingSpec(reactContext) {

    private var referrerClient: InstallReferrerClient? = null

    override fun getName(): String = NAME

    override fun getInstallReferrer(promise: Promise) {
        val context = reactApplicationContext

        referrerClient = InstallReferrerClient.newBuilder(context).build()
        referrerClient?.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val response = referrerClient?.installReferrer
                            val rawReferrer = response?.installReferrer ?: ""

                            // Parse utm_campaign
                            val utmCampaign = rawReferrer
                                .split("&")
                                .find { it.startsWith("utm_campaign=") }
                                ?.substringAfter("=")

                            // Return structured object to JS
                            val result = Arguments.createMap().apply {
                                putString("raw", rawReferrer)
                                putString("utmCampaign", utmCampaign)
                            }

                            promise.resolve(result)
                            referrerClient?.endConnection()
                        } catch (e: Exception) {
                            promise.reject("REFERRER_ERROR", e)
                        }
                    }
                    else -> {
                        promise.reject("REFERRER_UNAVAILABLE", "Response code: $responseCode")
                        referrerClient?.endConnection()
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {
                // Optional: retry logic
            }
        })
    }

    companion object {
        const val NAME = "RNDynamicLinking"
        private const val TAG = "RNDynamicLinking"
    }
}
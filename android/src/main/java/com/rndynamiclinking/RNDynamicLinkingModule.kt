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

    override fun getName(): String = NAME

    @ReactMethod
    fun getReferralCode(promise: Promise) {
        // Prevent duplicate calls
        if (hasFetched) {
            promise.resolve(null)
            return
        }

        hasFetched = true
        val context = reactApplicationContext

        referrerClient = InstallReferrerClient.newBuilder(context).build()
        referrerClient?.startConnection(object : InstallReferrerStateListener {
            override fun onInstallReferrerSetupFinished(responseCode: Int) {
                when (responseCode) {
                    InstallReferrerClient.InstallReferrerResponse.OK -> {
                        try {
                            val raw = referrerClient?.installReferrer?.installReferrer.orEmpty()
                            val code = if (raw.isNotBlank()) raw else null
                            promise.resolve(code)
                        } catch (e: Exception) {
                            promise.resolve(null)
                        } finally {
                            referrerClient?.endConnection()
                            referrerClient = null
                        }
                    }
                    else -> {
                        promise.resolve(null)
                        referrerClient?.endConnection()
                    }
                }
            }

            override fun onInstallReferrerServiceDisconnected() {}
        })
    }

    companion object {
        const val NAME = "RNDynamicLinking"
        private const val TAG = "RNDynamicLinking"
    }
}
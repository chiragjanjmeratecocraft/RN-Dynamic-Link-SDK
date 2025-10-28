package com.rndynamiclinking

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.util.HashMap

class RNDynamicLinkingPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == RNDynamicLinkingModule.NAME) RNDynamicLinkingModule(reactContext) else null

    override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
        mapOf(
            RNDynamicLinkingModule.NAME to ReactModuleInfo(
                RNDynamicLinkingModule.NAME,
                RNDynamicLinkingModule.NAME,
                false, false, false, true // isTurboModule = true
            )
        )
    }
}

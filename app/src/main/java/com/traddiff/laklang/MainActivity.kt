package com.traddiff.laklang

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.traddiff.laklang.ui.navigation.LakLangNavigation
import com.traddiff.laklang.ui.theme.LakLangTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LakLangTheme {
                LakLangNavigation()
            }
        }
    }
}

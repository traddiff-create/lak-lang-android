package com.traddiff.laklang

import android.app.Application
import com.traddiff.laklang.data.DatabaseHelper
import com.traddiff.laklang.data.LakLangDatabase

class LakLangApp : Application() {

    lateinit var database: LakLangDatabase
        private set

    override fun onCreate() {
        super.onCreate()
        database = DatabaseHelper.createDatabase(this)
    }
}

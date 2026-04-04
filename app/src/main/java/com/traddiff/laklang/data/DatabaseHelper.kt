package com.traddiff.laklang.data

import android.content.Context
import androidx.room.Room

object DatabaseHelper {

    private const val DB_NAME = "laklang.db"

    fun createDatabase(context: Context): LakLangDatabase {
        return Room.databaseBuilder(context, LakLangDatabase::class.java, DB_NAME)
            .createFromAsset(DB_NAME)
            .fallbackToDestructiveMigration()
            .build()
    }
}

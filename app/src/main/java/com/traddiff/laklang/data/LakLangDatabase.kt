package com.traddiff.laklang.data

import androidx.room.Database
import androidx.room.RoomDatabase
import com.traddiff.laklang.data.dao.*
import com.traddiff.laklang.data.entity.*

@Database(
    entities = [
        VocabularyItem::class,
        Story::class,
        GraphEdge::class,
        Value::class,
        Person::class,
        CulturalModule::class,
        PronunciationGuide::class,
        DialogueExample::class,
        Bookmark::class,
    ],
    version = 2,
    exportSchema = false,
)
abstract class LakLangDatabase : RoomDatabase() {
    abstract fun vocabularyDao(): VocabularyDao
    abstract fun storyDao(): StoryDao
    abstract fun graphDao(): GraphDao
    abstract fun learnDao(): LearnDao
    abstract fun bookmarkDao(): BookmarkDao
    abstract fun searchDao(): SearchDao
}

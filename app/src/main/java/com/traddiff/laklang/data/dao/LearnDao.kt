package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Query
import com.traddiff.laklang.data.entity.CulturalModule
import com.traddiff.laklang.data.entity.DialogueExample
import com.traddiff.laklang.data.entity.PronunciationGuide
import kotlinx.coroutines.flow.Flow

@Dao
interface LearnDao {

    @Query("""
        SELECT * FROM pronunciation_guides
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY type, symbol ASC
    """)
    fun getPronunciationGuides(): Flow<List<PronunciationGuide>>

    @Query("""
        SELECT * FROM cultural_modules
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY title ASC
    """)
    fun getCulturalModules(): Flow<List<CulturalModule>>

    @Query("SELECT * FROM cultural_modules WHERE id = :id")
    suspend fun getCulturalModuleById(id: String): CulturalModule?

    @Query("""
        SELECT * FROM dialogue_examples
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY title ASC
    """)
    fun getDialogues(): Flow<List<DialogueExample>>
}

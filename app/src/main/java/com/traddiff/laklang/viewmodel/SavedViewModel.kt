package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.Bookmark
import com.traddiff.laklang.data.entity.VocabularyItem
import com.traddiff.laklang.data.entity.Story
import com.traddiff.laklang.data.entity.CulturalModule
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SavedState(
    val bookmarkedWords: List<Pair<Bookmark, VocabularyItem?>> = emptyList(),
    val bookmarkedStories: List<Pair<Bookmark, Story?>> = emptyList(),
    val bookmarkedModules: List<Pair<Bookmark, CulturalModule?>> = emptyList(),
)

class SavedViewModel(application: Application) : AndroidViewModel(application) {

    private val db = (application as LakLangApp).database
    private val bookmarkDao = db.bookmarkDao()
    private val vocabDao = db.vocabularyDao()
    private val storyDao = db.storyDao()
    private val learnDao = db.learnDao()

    private val _state = MutableStateFlow(SavedState())
    val state: StateFlow<SavedState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            bookmarkDao.getAll().collect { bookmarks ->
                val words = bookmarks.filter { it.itemType == "word" }.map { bm ->
                    bm to vocabDao.getById(bm.itemId)
                }
                val stories = bookmarks.filter { it.itemType == "story" }.map { bm ->
                    bm to storyDao.getById(bm.itemId)
                }
                val modules = bookmarks.filter { it.itemType == "cultural_module" }.map { bm ->
                    bm to learnDao.getCulturalModuleById(bm.itemId)
                }
                _state.value = SavedState(
                    bookmarkedWords = words,
                    bookmarkedStories = stories,
                    bookmarkedModules = modules,
                )
            }
        }
    }
}

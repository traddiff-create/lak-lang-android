package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class WordDetailState(
    val word: VocabularyItem? = null,
    val relatedWords: List<VocabularyItem> = emptyList(),
    val connectedStories: List<Story> = emptyList(),
    val connectedValues: List<Value> = emptyList(),
    val pronunciationBreakdown: List<PronunciationGuide> = emptyList(),
    val isBookmarked: Boolean = false,
)

class WordDetailViewModel(application: Application) : AndroidViewModel(application) {

    private val db = (application as LakLangApp).database
    private val vocabDao = db.vocabularyDao()
    private val graphDao = db.graphDao()
    private val learnDao = db.learnDao()
    private val bookmarkDao = db.bookmarkDao()

    private val _state = MutableStateFlow(WordDetailState())
    val state: StateFlow<WordDetailState> = _state.asStateFlow()

    fun loadWord(wordId: String) {
        viewModelScope.launch {
            val word = vocabDao.getById(wordId) ?: return@launch
            val related = graphDao.getRelatedWordsByCategory(wordId)
            val stories = graphDao.getConnectedStories(wordId)
            val values = graphDao.getConnectedValues(wordId)

            // Build pronunciation breakdown from the word's characters
            val allGuides = learnDao.getPronunciationGuides().first()
            val breakdown = buildPronunciationBreakdown(word.lakota, allGuides)

            _state.value = WordDetailState(
                word = word,
                relatedWords = related,
                connectedStories = stories,
                connectedValues = values,
                pronunciationBreakdown = breakdown,
            )
        }

        // Observe bookmark state
        viewModelScope.launch {
            bookmarkDao.isBookmarked(wordId, "word").collect { bookmarked ->
                _state.update { it.copy(isBookmarked = bookmarked) }
            }
        }
    }

    fun toggleBookmark() {
        val word = _state.value.word ?: return
        viewModelScope.launch {
            if (_state.value.isBookmarked) {
                bookmarkDao.delete(word.id, "word")
            } else {
                bookmarkDao.insert(Bookmark(itemId = word.id, itemType = "word"))
            }
        }
    }

    private fun buildPronunciationBreakdown(
        lakota: String,
        guides: List<PronunciationGuide>,
    ): List<PronunciationGuide> {
        // Match multi-character sequences first (čh, pȟ, etc.), then single chars
        val sorted = guides.sortedByDescending { it.symbol.length }
        val result = mutableListOf<PronunciationGuide>()
        var i = 0
        val lower = lakota.lowercase()

        while (i < lower.length) {
            val matched = sorted.firstOrNull { guide ->
                lower.startsWith(guide.symbol.lowercase(), i)
            }
            if (matched != null) {
                result.add(matched)
                i += matched.symbol.length
            } else {
                i++
            }
        }
        return result.distinctBy { it.symbol }
    }
}

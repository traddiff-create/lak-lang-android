package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.VocabularyItem
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class ExploreViewModel(application: Application) : AndroidViewModel(application) {

    private val vocabDao = (application as LakLangApp).database.vocabularyDao()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    val categories: StateFlow<List<String>> = vocabDao.getCategories()
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    @OptIn(ExperimentalCoroutinesApi::class)
    val words: StateFlow<List<VocabularyItem>> = _selectedCategory
        .flatMapLatest { category ->
            if (category != null) vocabDao.getByCategory(category)
            else vocabDao.getAllApproved()
        }
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    private val _wordOfTheDay = MutableStateFlow<VocabularyItem?>(null)
    val wordOfTheDay: StateFlow<VocabularyItem?> = _wordOfTheDay.asStateFlow()

    private val _totalWords = MutableStateFlow(0)
    val totalWords: StateFlow<Int> = _totalWords.asStateFlow()

    init {
        viewModelScope.launch {
            _wordOfTheDay.value = vocabDao.getRandomWord()
            _totalWords.value = vocabDao.getApprovedCount()
        }
    }

    fun selectCategory(category: String?) {
        _selectedCategory.value = category
    }
}

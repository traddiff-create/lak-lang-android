package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.SearchResult
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class SpotlightState(
    val query: String = "",
    val results: Map<String, List<SearchResult>> = emptyMap(),
    val isSearching: Boolean = false,
    val totalResults: Int = 0,
)

class SpotlightViewModel(application: Application) : AndroidViewModel(application) {

    private val searchDao = (application as LakLangApp).database.searchDao()

    private val _state = MutableStateFlow(SpotlightState())
    val state: StateFlow<SpotlightState> = _state.asStateFlow()

    private var searchJob: Job? = null

    fun updateQuery(query: String) {
        _state.value = _state.value.copy(query = query)

        searchJob?.cancel()

        if (query.isBlank()) {
            _state.value = _state.value.copy(results = emptyMap(), isSearching = false, totalResults = 0)
            return
        }

        searchJob = viewModelScope.launch {
            delay(300) // Debounce
            _state.value = _state.value.copy(isSearching = true)

            // Fire all 6 queries in parallel
            val words = async { searchDao.searchWords(query) }
            val stories = async { searchDao.searchStories(query) }
            val culture = async { searchDao.searchCulture(query) }
            val values = async { searchDao.searchValues(query) }
            val persons = async { searchDao.searchPersons(query) }
            val dialogues = async { searchDao.searchDialogues(query) }

            val grouped = linkedMapOf<String, List<SearchResult>>()

            words.await().takeIf { it.isNotEmpty() }?.let { grouped["Words"] = it }
            stories.await().takeIf { it.isNotEmpty() }?.let { grouped["Stories"] = it }
            culture.await().takeIf { it.isNotEmpty() }?.let { grouped["Culture"] = it }
            values.await().takeIf { it.isNotEmpty() }?.let { grouped["Values"] = it }
            persons.await().takeIf { it.isNotEmpty() }?.let { grouped["People"] = it }
            dialogues.await().takeIf { it.isNotEmpty() }?.let { grouped["Dialogues"] = it }

            val total = grouped.values.sumOf { it.size }

            _state.value = _state.value.copy(
                results = grouped,
                isSearching = false,
                totalResults = total,
            )
        }
    }

    fun clear() {
        searchJob?.cancel()
        _state.value = SpotlightState()
    }
}

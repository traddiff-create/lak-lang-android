package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class StoryDetailState(
    val story: Story? = null,
    val connectedValues: List<Value> = emptyList(),
    val connectedPersons: List<Person> = emptyList(),
)

class StoriesViewModel(application: Application) : AndroidViewModel(application) {

    private val db = (application as LakLangApp).database
    private val storyDao = db.storyDao()
    private val graphDao = db.graphDao()

    val stories: StateFlow<List<Story>> = storyDao.getAllApproved()
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    private val _storyDetail = MutableStateFlow(StoryDetailState())
    val storyDetail: StateFlow<StoryDetailState> = _storyDetail.asStateFlow()

    fun loadStoryDetail(storyId: String) {
        viewModelScope.launch {
            val story = storyDao.getById(storyId) ?: return@launch
            val values = graphDao.getConnectedValues(storyId)
            val persons = graphDao.getConnectedPersons(storyId)
            _storyDetail.value = StoryDetailState(
                story = story,
                connectedValues = values,
                connectedPersons = persons,
            )
        }
    }
}

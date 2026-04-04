package com.traddiff.laklang.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.GraphEdge
import com.traddiff.laklang.ui.cosmos.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CosmosState(
    val nodes: List<CosmosNode> = emptyList(),
    val edges: List<GraphEdge> = emptyList(),
    val loading: Boolean = true,
    val activeDirection: String? = null,
    val selectedNode: CosmosNode? = null,
    val connectedNodes: List<CosmosNode> = emptyList(),
)

class CosmosViewModel(application: Application) : AndroidViewModel(application) {

    private val db = (application as LakLangApp).database
    private val vocabDao = db.vocabularyDao()
    private val storyDao = db.storyDao()
    private val graphDao = db.graphDao()

    private val _state = MutableStateFlow(CosmosState())
    val state: StateFlow<CosmosState> = _state.asStateFlow()

    private var allNodes = emptyList<CosmosNode>()

    init {
        loadAllNodes()
    }

    private fun loadAllNodes() {
        viewModelScope.launch {
            val nodes = mutableListOf<CosmosNode>()

            // Words
            val words = vocabDao.getAllApprovedList()
            words.forEachIndexed { i, w ->
                val dir = directionForType("word")
                nodes.add(CosmosNode(w.id, "word", w.lakota, w.english, dir, computeOrbit(i, words.size, dir, false)))
            }

            // Stories
            val stories = storyDao.getAllApprovedList()
            stories.forEachIndexed { i, s ->
                val dir = directionForType("story")
                nodes.add(CosmosNode(s.id, "story", s.titleLakota ?: s.titleEnglish, s.titleEnglish, dir, computeOrbit(i, stories.size, dir, false)))
            }

            // Values
            val values = graphDao.getAllValues()
            values.forEachIndexed { i, v ->
                val dir = directionForType("value")
                nodes.add(CosmosNode(v.id, "value", v.lakota ?: v.english, v.english, dir, computeOrbit(i, values.size, dir, false)))
            }

            // Persons
            val persons = graphDao.getAllPersons()
            persons.forEachIndexed { i, p ->
                val dir = directionForType("person")
                nodes.add(CosmosNode(p.id, "person", p.lakotaName ?: p.englishName, p.englishName, dir, computeOrbit(i, persons.size, dir, false)))
            }

            val edges = graphDao.getAllEdges()

            allNodes = nodes
            _state.value = CosmosState(
                nodes = nodes,
                edges = edges,
                loading = false,
            )
        }
    }

    fun selectDirection(directionKey: String?) {
        val active = if (_state.value.activeDirection == directionKey) null else directionKey
        val visible = if (active != null) {
            allNodes.filter { it.direction.key == active }.mapIndexed { i, node ->
                node.copy(orbit = computeOrbit(i, allNodes.count { it.direction.key == active }, node.direction, true))
            }
        } else allNodes

        _state.value = _state.value.copy(activeDirection = active, nodes = visible, selectedNode = null)
    }

    fun selectNode(node: CosmosNode?) {
        if (node == null) {
            _state.value = _state.value.copy(selectedNode = null, connectedNodes = emptyList())
            return
        }
        // Find connected nodes via edges
        val connected = _state.value.edges
            .filter { it.sourceNodeId == node.id || it.targetNodeId == node.id }
            .mapNotNull { edge ->
                val otherId = if (edge.sourceNodeId == node.id) edge.targetNodeId else edge.sourceNodeId
                allNodes.find { it.id == otherId }
            }

        _state.value = _state.value.copy(selectedNode = node, connectedNodes = connected)
    }
}

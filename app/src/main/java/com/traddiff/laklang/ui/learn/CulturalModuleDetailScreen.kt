package com.traddiff.laklang.ui.learn

import android.app.Application
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.CulturalModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CulturalModuleDetailViewModel(application: Application) : AndroidViewModel(application) {
    private val learnDao = (application as LakLangApp).database.learnDao()

    private val _module = MutableStateFlow<CulturalModule?>(null)
    val module: StateFlow<CulturalModule?> = _module.asStateFlow()

    fun load(moduleId: String) {
        viewModelScope.launch {
            _module.value = learnDao.getCulturalModuleById(moduleId)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CulturalModuleDetailScreen(
    moduleId: String,
    onBack: () -> Unit,
    viewModel: CulturalModuleDetailViewModel = viewModel(),
) {
    val module by viewModel.module.collectAsState()

    LaunchedEffect(moduleId) {
        viewModel.load(moduleId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(module?.title ?: "") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        module?.let { mod ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
            ) {
                Text(
                    text = mod.title,
                    style = MaterialTheme.typography.headlineMedium,
                )
                mod.category?.let { cat ->
                    SuggestionChip(
                        onClick = {},
                        label = { Text(cat.replaceFirstChar { it.uppercase() }) },
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                // Render markdown as plain text for now
                Text(
                    text = mod.body,
                    style = MaterialTheme.typography.bodyLarge,
                    lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.4,
                )
            }
        }
    }
}

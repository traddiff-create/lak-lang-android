# Testing — LakLang Android

## Test Strategy

### Unit Tests (Room DAOs)

Test queries against an in-memory Room database seeded with known data.

```kotlin
@RunWith(AndroidJUnit4::class)
class VocabularyDaoTest {
    private lateinit var db: LakLangDatabase
    private lateinit var dao: VocabularyDao

    @Before
    fun setup() {
        db = Room.inMemoryDatabaseBuilder(context, LakLangDatabase::class.java).build()
        dao = db.vocabularyDao()
    }

    @Test
    fun searchReturnsMatchingWords() = runTest {
        // Insert test data, then verify search results
    }
}
```

### Key Test Cases

| Test | What to verify |
|------|---------------|
| `VocabularyDao.search("hello")` | Returns "Háu" |
| `VocabularyDao.getByCategory("sacred")` | Returns hočhóka, wakȟáŋ |
| `GraphDao.getConnectedStories(wordId)` | Returns linked stories via graph_edges |
| `GraphDao.getRelatedWordsByCategory(wordId)` | Returns same-category words |
| `BookmarkDao.insert` + `isBookmarked` | Bookmark persists and queries correctly |
| `SearchDao` (all 6 methods) | Universal search returns grouped results |
| Access control filtering | No draft/restricted content appears |

### Emulator Testing Checklist

- [ ] App launches without crash
- [ ] Word of the Day appears on Explore tab
- [ ] Category chips scroll and filter correctly
- [ ] Search "hocoka" → shows hočhóka with cultural context
- [ ] Word detail shows related words, connected stories, pronunciation
- [ ] Spotlight 🔍 opens from every tab
- [ ] Spotlight search returns results across all content types
- [ ] Tap search result → navigates to correct detail screen
- [ ] Stories tab loads 63 stories
- [ ] Story detail shows connected values and persons
- [ ] Learn tab: pronunciation, culture, dialogues all render
- [ ] Bookmark a word → appears in Saved tab
- [ ] Remove bookmark → disappears from Saved tab
- [ ] Orthography renders: ą, š, ž, č, ȟ, ġ, ŋ, ʼ
- [ ] Dark mode displays correctly
- [ ] Back navigation works from all detail screens
- [ ] Cosmos tab loads starfield with 7 direction labels
- [ ] Cosmos: pinch-to-zoom and pan work
- [ ] Cosmos: tap direction → immersive page with description + content
- [ ] Cosmos: tap node → overlay with Lakota/English + connections
- [ ] Cosmos: direction page → tap story → StoryDetailScreen
- [ ] Cosmos: back from direction page → returns to canvas
- [ ] Cosmos: seasonal direction glows brighter (spring = East)

## Running Tests

```bash
# Unit tests
./gradlew :app:testDebugUnitTest

# Instrumented tests (requires emulator)
./gradlew :app:connectedDebugAndroidTest
```

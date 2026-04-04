package com.traddiff.laklang.ui.cosmos

data class DirectionInfo(
    val key: String,
    val lakota: String,
    val english: String,
    val description: String,
    val contentLabel: String,
)

val DIRECTION_INFO = mapOf(
    "west" to DirectionInfo(
        key = "west",
        lakota = "Wiyohpeyata",
        english = "West",
        description = "Place of the Wakȟíŋyaŋ, the Thunder Beings. " +
            "Where the sun goes to rest and darkness brings introspection. " +
            "The West holds stories — the narratives that carry wisdom through generations. " +
            "To look West is to look inward.",
        contentLabel = "Stories",
    ),
    "north" to DirectionInfo(
        key = "north",
        lakota = "Waziyata",
        english = "North",
        description = "Place of Waziya, the White Giant. " +
            "Where cold winds bring clarity and endurance. " +
            "The North holds wisdom — the values and teachings passed down by elders. " +
            "To face North is to seek truth through hardship.",
        contentLabel = "Values & Wisdom",
    ),
    "east" to DirectionInfo(
        key = "east",
        lakota = "Wihinanpata",
        english = "East",
        description = "Place of the rising sun and new beginnings. " +
            "Where light first enters and knowledge awakens. " +
            "The East holds words — the vocabulary that opens the doorway to understanding. " +
            "To face East is to greet each day with a learner's mind.",
        contentLabel = "Vocabulary",
    ),
    "south" to DirectionInfo(
        key = "south",
        lakota = "Itokaga",
        english = "South",
        description = "Place of warmth, growth, and community. " +
            "Where life flourishes and relationships deepen. " +
            "The South holds people and conversation — the bonds that sustain a nation. " +
            "To face South is to turn toward others.",
        contentLabel = "People & Dialogues",
    ),
    "sky" to DirectionInfo(
        key = "sky",
        lakota = "Wankantanhan",
        english = "Sky — Above",
        description = "The realm above, home of Wakȟáŋ Tȟáŋka and the spirit world. " +
            "Where prayers rise and vision seekers look. " +
            "The Sky holds the sacred — ceremonies, songs, and the connection between earth and spirit. " +
            "To look up is to remember what is greater than ourselves.",
        contentLabel = "Sacred & Ceremony",
    ),
    "earth" to DirectionInfo(
        key = "earth",
        lakota = "Maka",
        english = "Earth — Below",
        description = "Uŋčí Makȟá, Grandmother Earth. " +
            "The land that feeds, shelters, and teaches. " +
            "The Earth holds places, animals, and the natural world — everything rooted below. " +
            "To look down is to honor what sustains us.",
        contentLabel = "Nature & Places",
    ),
    "center" to DirectionInfo(
        key = "center",
        lakota = "Cante",
        english = "Center — Heart",
        description = "Where all directions meet. " +
            "The heart of the learner, the hočhóka of the self. " +
            "The Center holds your journey — what you have saved, studied, and carry with you. " +
            "To stand in the center is to be present.",
        contentLabel = "Your Journey",
    ),
)

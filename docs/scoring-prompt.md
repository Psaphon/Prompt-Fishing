# Fishing App — Scoring & Fish Selection System v3

## System Overview

The scoring and fish selection system operates as a **layered funnel**. Each layer narrows the pool of possible fish, resulting in a specific catch. Two parallel processes feed the funnel:

1. **Scoring** (4 dimensions, 1-5 each) — determines habitat, size, rarity, and targeting accuracy
2. **Topic Detection** (7 categories) — determines the final species from the narrowed pool

```
USER PROMPT
    │
    ├──→ [Scoring Call] ──→ Depth → Habitat Zone
    │                       Specificity → Size Class
    │                       Creativity → Rarity Tier
    │                       Clarity → Modifier (adjusts above three)
    │
    ├──→ [Topic Detection] ──→ Topic Category
    │
    └──→ [Fish Selection Algorithm]
              │
              ├── Filter by Habitat
              ├── Filter by Size
              ├── Filter by Rarity
              ├── Filter by Topic
              └── Random select from remaining candidates
                        │
                        ▼
                   YOUR CATCH
```

---

## Part 1: The Scoring System

### Four Dimensions

| Dimension | Score | Role in Funnel | Game Metaphor |
|-----------|-------|---------------|---------------|
| **Depth** | 1-5 | Selects HABITAT ZONE | How deep/remote you're willing to travel to fish |
| **Specificity** | 1-5 | Selects SIZE CLASS | Precision of your bait determines size of catch |
| **Creativity** | 1-5 | Selects RARITY TIER | Creative bait attracts exotic, rare species |
| **Clarity** | 1-5 | MODIFIES the above three | How steady your hand is on the rod — low clarity degrades your other scores toward the median |

### Clarity as Score Modifier

Clarity does not introduce its own selection layer. It **validates** the other three scores. Think of it as "how well you executed on your intent."

**Modifier Formula:**

```
effectiveScore = baseScore - (degradation × (3 - clarity) / 4)

Where:
- baseScore = the raw score (1-5) for depth, specificity, or creativity
- clarity = the clarity score (1-5)
- degradation = how far the base score is from median (3)

At Clarity 5: no change (scores hold at full strength)
At Clarity 4: minimal drift (scores reduced ~12% toward median)
At Clarity 3: no change (neutral — scores hold as-is)
At Clarity 2: moderate drift (scores pulled ~25% toward median)
At Clarity 1: significant drift (scores pulled ~50% toward median)
```

**Examples:**
| Raw Creativity | Clarity | Effective Creativity | What Happens |
|---------------|---------|---------------------|--------------|
| 5 | 5 | 5.0 | Full exotic — you nailed it |
| 5 | 3 | 5.0 | Neutral — scores hold |
| 5 | 1 | 4.0 | Pulled toward median — still above average, but lost your peak |
| 3 | 1 | 3.0 | No change — median scores aren't degraded |
| 1 | 1 | 1.0 | No change — can't go below the floor |
| 5 | 2 | 4.5 | Slight pull — noticeable but not devastating |

**Design intent:** Clarity is moderate-strength. A muddled prompt with great creativity still catches something decent — just not the best thing your creativity would have earned. Players learning new prompting styles (naturally lower clarity) aren't harshly punished, but experienced prompters who are both creative AND clear are rewarded with the most precise targeting.

### Depth Is Not Good or Bad

Critical design note: **Depth is directional, not qualitative.** A Depth score of 1 isn't "worse" than a Depth score of 5. It just takes you to a different place. A beautifully crafted simple question (Depth 1, Clarity 5, Creativity 4) catches a rare, exotic Pond fish — that's a great catch. A poorly written complex question (Depth 5, Clarity 1, Creativity 2) catches a generic Deep Ocean fish — technically deep, but not impressive.

The "quality" of a catch comes from the interplay of Creativity (rarity), Specificity (size), and Clarity (accuracy) — not from Depth alone.

---

## Part 2: Habitat Zones

### 5 Core Habitats + 2 Special Habitats

| Effective Depth | Habitat | Character | Real-World Feel |
|----------------|---------|-----------|-----------------|
| 1 | **Pond** | Calm, local, familiar | Backyard pond, garden pool, park lake |
| 2 | **River & Lake** | Freshwater, varied, regional | Mountain-fed rivers, bass lakes, wide streams |
| 3 | **Coastal Waters** | Where worlds meet | Estuaries, mangroves, tidal flats, harbors |
| 4 | **Reef & Open Sea** | Tropical, colorful, alive | Coral reefs, tropical shores, sport fishing waters |
| 5 | **Deep Ocean** | Remote, mysterious, extreme | Abyssal plains, deep trenches, midnight zone |

### Special Habitats (Unlocked by Score Profile Combinations)

| Habitat | Unlock Condition | Character |
|---------|-----------------|-----------|
| **Mountain Stream** | Effective Depth ≥ 4, Creativity ≤ 2, Clarity ≥ 4 | Remote but precise. Deep thought, clear execution, no frills. Alpine streams, glacial melt pools. |
| **Volcanic Vent / Arctic** | Effective Depth = 5, Effective Creativity ≥ 4 | Deep AND weird. The most extreme environments on Earth. Hydrothermal vents, under-ice seas. |

Special habitats give completionists specific score profiles to aim for. They're discoverable — not explained upfront — which creates organic "how did you catch THAT?" social moments.

---

## Part 3: Size Classes

| Effective Specificity | Size Class | Description |
|----------------------|------------|-------------|
| 1 | **Tiny** | Bait-sized. Fits in your palm. |
| 2 | **Small** | One-hander. Respectable but modest. |
| 3 | **Medium** | Solid catch. Good eating. |
| 4 | **Large** | Two-hander. Impressive. Photo-worthy. |
| 5 | **Trophy** | Mount it on the wall. Once-in-a-lifetime size. |

Size operates within a species' natural range. A "Trophy Goldfish" is a big goldfish (~12 inches), not a tuna-sized goldfish. Each species has a size range and the Specificity score determines where in that range your catch falls.

---

## Part 4: Rarity Tiers

| Effective Creativity | Rarity | Color | Visual Treatment |
|---------------------|--------|-------|-----------------|
| 1 | **Common** | Gray | Plain card, no effects |
| 2 | **Uncommon** | Green | Subtle border glow |
| 3 | **Rare** | Blue | Shimmer effect on card |
| 4 | **Epic** | Purple | Animated border, particle sparkle |
| 5 | **Legendary** | Gold | Full glow, animated background, special sound |
| Special: composite ≥ 18 | **Mythic** | Prismatic | Rainbow shimmer, unique animation, extremely rare |

**Mythic override:** Regardless of individual dimension scores, if the composite score (sum of all four raw scores before clarity modification) is 18 or higher, the catch is elevated to Mythic rarity. This is the trophy-hunter's peak — it requires excellence across all dimensions simultaneously.

---

## Part 5: Topic Detection

### 7 Topic Categories

| Topic | Description | Thematic Fish Character |
|-------|-------------|------------------------|
| **Casual** | Everyday questions, small talk, simple asks | Common, familiar, friendly species — the fish everyone knows |
| **Creative** | Writing, art, storytelling, imagination | Colorful, unusual, visually striking species |
| **Technical** | Coding, math, engineering, systems | Precise, efficient, mechanical-looking species |
| **Research** | Analysis, deep knowledge, investigation | Large, serious, pelagic species — the workhorses of the ocean |
| **Philosophical** | Abstract, ethical, existential questions | Ancient, mysterious, deep-dwelling species |
| **Playful** | Humor, games, fun, lighthearted | Quirky, funny-looking, charismatic species |
| **Practical** | How-to, advice, planning, life stuff | Reliable, versatile, "good eating" species |

Topic detection is done in the same scoring call. The LLM identifies which category best fits the prompt.

---

## Part 6: Complete Fish Database

### Pond (Depth 1) — 12 Species

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Goldfish | *Carassius auratus* | Tiny–Small | Casual, Playful | The first fish most people ever meet. Cheerful, familiar, surprisingly hardy. |
| Koi | *Cyprinus rubrofuscus* | Small–Large | Creative, Philosophical | Living art. Bred for beauty over centuries, each one unique. |
| Bluegill | *Lepomis macrochirus* | Tiny–Medium | Casual, Practical | The reliable panfish. Every kid's first real catch. |
| Common Carp | *Cyprinus carpio* | Medium–Trophy | Practical, Research | Underestimated and overprepared. Thrives anywhere. |
| Channel Catfish | *Ictalurus punctatus* | Small–Large | Practical, Casual | Bottom-feeder with a big appetite. Prefers to work the night shift. |
| Guppy | *Poecilia reticulata* | Tiny | Casual, Playful | Tiny, colorful, endlessly reproducing. The starter fish of the hobby world. |
| Mosquitofish | *Gambusia affinis* | Tiny | Technical, Practical | Tiny but purposeful. Deployed worldwide as biological pest control. |
| Bullfrog | *Lithobates catesbeianus* | Small | Playful, Casual | Not a fish. Doesn't care. Showed up anyway. |
| Crawdad | *Procambarus clarkii* | Tiny–Small | Playful, Practical | Little freshwater lobster with big attitude. Pinches back. |
| Betta | *Betta splendens* | Tiny | Creative, Philosophical | Solitary and stunning. Flares at its own reflection. |
| Axolotl | *Ambystoma mexicanum* | Small | Creative, Research | The smiling salamander that never grows up. Can regenerate its own brain. |
| Snapping Turtle | *Chelydra serpentina* | Medium–Large | Philosophical, Playful | Ancient, patient, and absolutely will bite. A living fossil with opinions. |

### River & Lake (Depth 2) — 14 Species

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Largemouth Bass | *Micropterus salmoides* | Small–Large | Casual, Practical | The king of freshwater sport fishing. Explosive strikes, big ego. |
| Rainbow Trout | *Oncorhynchus mykiss* | Small–Large | Casual, Creative | A flash of color in cold, clear water. The postcard fish. |
| Walleye | *Sander vitreus* | Medium–Large | Practical, Research | Glassy-eyed predator of the northern lakes. Prized at the dinner table. |
| Northern Pike | *Esox lucius* | Medium–Trophy | Technical, Research | The freshwater torpedo. All teeth and ambition. |
| Yellow Perch | *Perca flavescens* | Tiny–Medium | Casual, Practical | Striped, scrappy, and delicious. The everyman's fish. |
| Smallmouth Bass | *Micropterus dolomieu* | Small–Large | Technical, Practical | Fights harder than its largemouth cousin. Pound for pound, a champion. |
| Lake Sturgeon | *Acipenser fulvescens* | Large–Trophy | Philosophical, Research | A dinosaur that never left. Can live over 100 years. |
| Longnose Gar | *Lepisosteus osseus* | Medium–Large | Research, Philosophical | Armored in ganoid scales. Unchanged for 100 million years. |
| Crappie | *Pomoxis spp.* | Tiny–Medium | Casual, Playful | Great name, better taste. Schooling fish that rewards patience. |
| Muskellunge | *Esox masquinongy* | Large–Trophy | Technical, Research | "The fish of 10,000 casts." Legendary among freshwater anglers. |
| Paddlefish | *Polyodon spathula* | Large–Trophy | Philosophical, Creative | Filter-feeding fossil with a paddle for a face. Gentle giant of muddy rivers. |
| Brook Trout | *Salvelinus fontinalis* | Tiny–Medium | Creative, Casual | Jewel of cold streams. Painted by nature with impossible colors. |
| Bowfin | *Amia calva* | Medium–Large | Research, Technical | The last of its order. A living fossil that breathes air. |
| Freshwater Drum | *Aplodinotus grunniens* | Medium–Large | Playful, Practical | Makes a drumming sound with its swim bladder. The musician of the river. |

### Coastal Waters (Depth 3) — 12 Species

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Red Drum | *Sciaenops ocellatus* | Medium–Trophy | Practical, Casual | Bronze powerhouse of the shallows. Also called redfish. A Southern staple. |
| Flounder | *Paralichthys spp.* | Small–Large | Technical, Practical | Both eyes on one side. Lies flat and waits. Master of camouflage and patience. |
| Snook | *Centropomus undecimalis* | Medium–Large | Creative, Casual | Sleek, silver, and explosive. The ghost of the mangroves. |
| Tarpon | *Megalops atlanticus* | Large–Trophy | Research, Creative | The Silver King. Leaps six feet out of the water. Been around since the dinosaurs. |
| Bonefish | *Albula vulpes* | Small–Medium | Technical, Practical | The "gray ghost" of the flats. Fly fishing's ultimate challenge. |
| Sheepshead | *Archosargus probatocephalus* | Small–Medium | Playful, Casual | Has human-looking teeth. Seriously. Google it. |
| Mangrove Snapper | *Lutjanus griseus* | Small–Medium | Practical, Casual | Smart, cautious, and delicious. The survivor of the estuary. |
| Blue Crab | *Callinectes sapidus* | Tiny–Small | Playful, Practical | Feisty, beautiful, and the foundation of a hundred regional cuisines. |
| Horseshoe Crab | *Limulus polyphemus* | Small–Medium | Philosophical, Research | Not a crab. 450 million years old. Its blue blood saves human lives. |
| Stingray | *Dasyatis americana* | Medium–Large | Creative, Philosophical | Graceful underwater flier. Gentle unless you step on it. |
| Spotted Seatrout | *Cynoscion nebulosus* | Small–Large | Casual, Practical | Speckled beauty of the grass flats. Reliable, tasty, and fun to catch. |
| Remora | *Echeneidae family* | Small–Medium | Playful, Philosophical | The ultimate hitchhiker. Suctions onto sharks and rides for free. Living proof that laziness is a survival strategy. |

### Reef & Open Sea (Depth 4) — 14 Species

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Clownfish | *Amphiprion ocellaris* | Tiny | Playful, Creative | Lives rent-free inside a venomous anemone. Famous for getting lost. |
| Parrotfish | *Scaridae family* | Small–Medium | Creative, Playful | Eats coral, poops sand. Literally creates tropical beaches. |
| Lionfish | *Pterois volitans* | Small–Medium | Technical, Creative | Stunning and invasive. Beautiful problem-causer. |
| Mahi-Mahi | *Coryphaena hippurus* | Medium–Large | Creative, Casual | The most photogenic fish in the sea. Changes color as it dies. |
| Bluefin Tuna | *Thunnus thynnus* | Large–Trophy | Research, Technical | Open-ocean torpedo. Warm-blooded, insanely fast. Sells for millions at auction. |
| Blue Marlin | *Makaira nigricans* | Large–Trophy | Research, Creative | The old man's fish. The pinnacle of sport fishing. |
| Sailfish | *Istiophorus platypterus* | Large–Trophy | Creative, Technical | Fastest fish in the ocean. 68 mph. That dorsal fin is pure drama. |
| Seahorse | *Hippocampus spp.* | Tiny | Creative, Philosophical | Males get pregnant. Terrible swimmers. Absolutely iconic. |
| Pufferfish | *Tetraodontidae family* | Tiny–Small | Playful, Creative | Inflates when scared. Contains enough toxin to kill 30 humans. Adorable. |
| Triggerfish | *Balistidae family* | Small–Medium | Technical, Playful | Built like a tank with a locking dorsal spine. Aggressive and smart. |
| Moray Eel | *Muraenidae family* | Medium–Large | Technical, Philosophical | Has a second set of jaws inside its throat. Yes, like the Alien. |
| Grouper | *Epinephelus spp.* | Medium–Trophy | Practical, Research | Massive, patient, and dominant. The bouncer of the reef. |
| Wahoo | *Acanthocybium solandri* | Medium–Large | Technical, Practical | Sleek, fast, and razor-toothed. The speedster of deep trolling. |
| Ocean Sunfish | *Mola mola* | Large–Trophy | Playful, Philosophical | The world's heaviest bony fish. Looks like God forgot to finish drawing it. Eats jellyfish and vibes. |

### Deep Ocean (Depth 5) — 11 Species

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Anglerfish | *Lophiiformes order* | Small–Medium | Technical, Creative | Dangles a bioluminescent lure in total darkness. The original catfisher. |
| Blobfish | *Psychrolutes marcidus* | Small | Playful, Casual | Looks normal at depth. Looks sad at the surface. Unfairly famous. |
| Giant Oarfish | *Regalecus glesne* | Trophy | Creative, Philosophical | The sea serpent of legend. Up to 36 feet long. Almost never seen alive. |
| Gulper Eel | *Eurypharynx pelecanoides* | Medium | Creative, Technical | Mouth bigger than its body. The deep sea's most impractical design. |
| Viperfish | *Chauliodus sloani* | Small | Technical, Research | Needle fangs and a photophore belly. Pure nightmare fuel. |
| Coelacanth | *Latimeria chalumnae* | Large–Trophy | Philosophical, Research | Thought extinct for 65 million years. Found alive in 1938. The Lazarus fish. 📸 *Catch & release — this species is protected.* |
| Giant Squid | *Architeuthis dux* | Trophy | Philosophical, Creative | Not technically a fish. Eyes the size of dinner plates. Fights sperm whales. |
| Lanternfish | *Myctophidae family* | Tiny | Technical, Research | The most abundant vertebrate on Earth. Bioluminescent. Nobody talks about them. |
| Barreleye | *Macropinna microstoma* | Small | Creative, Research | Has a transparent head. You can see its brain. Looks straight up through its own skull. |
| Hagfish | *Myxini class* | Small–Medium | Practical, Technical | Jawless, boneless, produces buckets of slime. Unlovable but essential. |
| Frilled Shark | *Chlamydoselachus anguineus* | Medium–Large | Philosophical, Research | 300 trident-shaped teeth. Living fossil from 80 million years ago. The deep's own dragon. |

### Mountain Stream (Special Habitat) — 5 Species

*Unlock: Effective Depth ≥ 4, Creativity ≤ 2, Clarity ≥ 4*
*Character: Remote, precise, no-nonsense. You climbed the mountain with the right gear.*

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Golden Trout | *Oncorhynchus aguabonita* | Small–Medium | Practical, Research | California's state freshwater fish. Lives only above 6,800 feet. Worth the hike. |
| Arctic Grayling | *Thymallus arcticus* | Small–Medium | Research, Technical | That enormous dorsal fin. Jewel of the far north. |
| Dolly Varden | *Salvelinus malma* | Small–Large | Casual, Practical | Named after a Charles Dickens character. Spotted beauty of glacier-fed streams. |
| Bull Trout | *Salvelinus confluentus* | Medium–Large | Technical, Research | Needs the coldest, cleanest water. A living indicator of ecosystem health. |
| Cutthroat Trout | *Oncorhynchus clarkii* | Small–Medium | Practical, Casual | Named for the red slash under its jaw. Lewis and Clark's fish. |

### Volcanic Vent / Arctic (Special Habitat) — 5 Species

*Unlock: Effective Depth = 5, Effective Creativity ≥ 4*
*Character: The extremes. Where life shouldn't exist but does anyway.*

| Species | Scientific Name | Size Range | Topics | Description |
|---------|----------------|------------|--------|-------------|
| Antarctic Icefish | *Channichthyidae family* | Small–Medium | Research, Technical | Has no hemoglobin. Clear blood. Survives by being coldblooded to the extreme. |
| Pompeii Worm | *Alvinella pompejana* | Tiny | Technical, Research | Lives at 176°F on hydrothermal vents. Most heat-tolerant animal on Earth. Not a fish. Doesn't care. |
| Snailfish | *Pseudoliparis swirei* | Small | Research, Philosophical | Lives 8,000 meters deep in the Mariana Trench. Deepest fish ever recorded. |
| Antarctic Toothfish | *Dissostichus mawsoni* | Large–Trophy | Practical, Research | Sold as "Chilean Sea Bass." Lives under Antarctic ice. Antifreeze in its blood. |
| Yeti Crab | *Kiwa hirsuta* | Small | Creative, Playful | Hairy claws, blind, farms bacteria on its own arms. Discovered in 2005. Not a fish. Incredible anyway. |

### Trash Catches — 5 Items

| Item | Trigger | Flavor Text |
|------|---------|-------------|
| Old Boot | Empty/blank prompt | "You cast nothing and caught nothing. Well, almost nothing." |
| Soggy Newspaper | Single word or gibberish | "Yesterday's news. Literally." |
| Tin Can | Abusive/jailbreak attempt | "The ocean doesn't reward bad behavior. Neither do we." |
| Seaweed Clump | Under 3 words, no real thought | "At least it's organic." |
| Driftwood | Repeated exact same prompt | "You've been here before. Try something new." |

---

## Part 7: The Scoring Prompt (v3)

```
You are the scoring engine for a fishing game where prompt quality determines what fish you catch. Evaluate the user's prompt — do NOT respond to it.

Score on four dimensions (1-5 each):

DEPTH (1-5): How much genuine thought or complexity does this prompt contain?
1: Trivial, surface-level (one-word, basic fact)
2: Simple but shows some thought
3: Requires meaningful reasoning or knowledge
4: Multi-layered, explores nuance or tradeoffs
5: Deeply complex, connects multiple domains or ideas

SPECIFICITY (1-5): How precise and detailed is the request?
1: No details at all ("help" / "tell me something")
2: Has a topic but no constraints
3: Reasonably specific, includes some useful detail
4: Precise with clear constraints, audience, or format requirements
5: Highly specific with multiple well-defined parameters

CREATIVITY (1-5): How novel, surprising, or inventive is this prompt?
1: Completely generic or formulaic
2: Standard question, nothing unexpected
3: Interesting angle or unexpected framing
4: Notably creative approach or unusual combination
5: Genuinely inventive, surprising, or delightful

CLARITY (1-5): How clear and unambiguous is the intent?
1: Confusing, contradictory, or incoherent
2: Understandable but ambiguous in key ways
3: Clear enough to answer, minor ambiguities
4: Well-articulated with clear intent
5: Crystal clear — no room for misinterpretation

TOPIC: Identify the primary topic category:
- casual (everyday questions, small talk, simple asks)
- creative (writing, art, storytelling, imagination)
- technical (coding, math, engineering, systems)
- research (analysis, deep knowledge, investigation)
- philosophical (abstract, ethical, existential)
- playful (humor, games, fun, lighthearted)
- practical (how-to, advice, planning, life tasks)

CALIBRATION:
- "What's the capital of France?" → D:1, S:3, C:1, CL:5 = 10
- "hi" → D:1, S:1, C:1, CL:2 = 5
- Average casual prompt should score 7-10
- 17+ is genuinely impressive — expert-level prompting
- 20 is nearly impossible — perfection across all four dimensions
- Single-word, empty, abusive, or gibberish = all 1s (total: 4)
- Do NOT reward length alone. A concise, brilliant prompt can score 5s.
- Do NOT penalize simplicity. A simple clear question earns high clarity.

Respond with ONLY this JSON:
{"depth":<1-5>,"specificity":<1-5>,"creativity":<1-5>,"clarity":<1-5>,"total":<4-20>,"topic":"<category>"}
```

---

## Part 8: Fish Selection Algorithm (Pseudocode)

```javascript
function catchFish(scores, fishDatabase) {
  
  // === STEP 1: Apply Clarity Modifier ===
  function applyClarity(baseScore, clarity) {
    if (clarity >= 3) return baseScore; // neutral or better, no degradation
    const distFromMedian = baseScore - 3;
    const degradeFactor = (3 - clarity) / 4; // 0.25 for clarity=2, 0.50 for clarity=1
    return Math.round(baseScore - (distFromMedian * degradeFactor));
  }
  
  const effDepth = applyClarity(scores.depth, scores.clarity);
  const effSpecificity = applyClarity(scores.specificity, scores.clarity);
  const effCreativity = applyClarity(scores.creativity, scores.clarity);
  
  // === STEP 2: Determine Habitat ===
  let habitat;
  
  // Check for special habitats first
  if (effDepth >= 4 && effCreativity <= 2 && scores.clarity >= 4) {
    habitat = "mountain_stream";
  } else if (effDepth === 5 && effCreativity >= 4) {
    habitat = "volcanic_arctic";
  } else {
    // Core habitats
    const habitatMap = { 1: "pond", 2: "river_lake", 3: "coastal", 4: "reef_open_sea", 5: "deep_ocean" };
    habitat = habitatMap[clamp(effDepth, 1, 5)];
  }
  
  // === STEP 3: Determine Size Class ===
  const sizeMap = { 1: "tiny", 2: "small", 3: "medium", 4: "large", 5: "trophy" };
  const sizeClass = sizeMap[clamp(effSpecificity, 1, 5)];
  
  // === STEP 4: Determine Rarity ===
  let rarity;
  if (scores.total >= 18) {
    rarity = "mythic"; // Override: near-perfect composite
  } else {
    const rarityMap = { 1: "common", 2: "uncommon", 3: "rare", 4: "epic", 5: "legendary" };
    rarity = rarityMap[clamp(effCreativity, 1, 5)];
  }
  
  // === STEP 5: Check for Trash ===
  if (scores.total <= 4) {
    return selectTrash(scores);
  }
  
  // === STEP 6: Filter Fish Database ===
  let candidates = fishDatabase.filter(fish => {
    const matchesHabitat = fish.habitats.includes(habitat);
    const matchesSize = fish.sizeRange.includes(sizeClass);
    const matchesTopic = fish.topics.includes(scores.topic);
    return matchesHabitat && matchesSize && matchesTopic;
  });
  
  // === STEP 7: Fallback Widening ===
  // If no candidates match all three, relax topic first, then size
  if (candidates.length === 0) {
    candidates = fishDatabase.filter(fish =>
      fish.habitats.includes(habitat) && fish.sizeRange.includes(sizeClass)
    );
  }
  if (candidates.length === 0) {
    candidates = fishDatabase.filter(fish =>
      fish.habitats.includes(habitat)
    );
  }
  
  // === STEP 8: Select Fish ===
  const fish = randomChoice(candidates);
  
  // === STEP 9: Determine Specific Size ===
  // Within the species' natural range, specificity determines where you land
  const sizePercentile = (effSpecificity - 1) / 4; // 0.0 to 1.0
  const weight = fish.minWeight + (fish.maxWeight - fish.minWeight) * sizePercentile;
  
  // === STEP 10: Select Flavor Text ===
  const flavorText = randomChoice(fish.flavorTexts);
  
  return {
    species: fish.species,
    scientificName: fish.scientificName,
    habitat: habitat,
    rarity: rarity,
    sizeClass: sizeClass,
    weight: Math.round(weight * 10) / 10,
    topic: scores.topic,
    scores: scores,
    flavorText: flavorText,
    description: fish.description
  };
}
```

---

## Part 9: Summary Statistics

| Category | Count |
|----------|-------|
| Core Habitats | 5 |
| Special Habitats | 2 |
| **Total Habitats** | **7** |
| Size Classes | 4 (Tiny, Small, Medium, Large, Trophy = 5 but grouped to 4 for selection) |
| Rarity Tiers | 6 (Common through Mythic) |
| Topic Categories | 7 |
| Trash Items | 5 |
| **Pond species** | **12** |
| **River & Lake species** | **14** |
| **Coastal species** | **12** |
| **Reef & Open Sea species** | **14** |
| **Deep Ocean species** | **11** |
| **Mountain Stream species** | **5** |
| **Volcanic/Arctic species** | **5** |
| **Total real species** | **73** |
| **Total collectibles (fish + trash)** | **78** |

### Catch & Release Species

Some species in the database are protected in the real world. These are marked with a 📸 icon and trigger a special "Catch & Release" animation and card treatment:

- **Coelacanth** — CITES protected, critically endangered
- **Giant Squid** — Not technically protected, but uncatchable in reality
- **Horseshoe Crab** — Protected in several jurisdictions

Catch & Release species still count toward your collection, but the card says "Photographed & Released" instead of "Caught." The flavor text acknowledges their protected status. This is both educational and gives these species a special prestige — they're the rarest catches AND the most ethically meaningful ones.

---

## Part 10: What Players Learn About Fish

Every fish has a real scientific name and a description rooted in actual biology. Players will naturally absorb facts like:
- Coelacanths were thought extinct for 65 million years
- Horseshoe crab blood is blue and saves human lives
- Lanternfish are the most abundant vertebrate on Earth
- Parrotfish poop creates tropical beaches
- Antarctic Icefish have clear blood with no hemoglobin

The collection becomes a weird, wonderful encyclopedia of aquatic life. People will share the descriptions as much as the catches.

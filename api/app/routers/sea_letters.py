"""GET /api/sea-letters — Daily narrative letters for each sea day of the Pacific Crossing."""

from fastapi import APIRouter, Request

from app.core.auth import get_email

router = APIRouter()

# 11 sea days. Written in Dani's voice: warm, literary, concierge-grade.
# Each anchored to the actual day's geography and evening reservation.
SEA_LETTERS: dict[str, dict] = {
    "2026-04-24": {
        "date": "2026-04-24",
        "day_label": "Day 2 — First Morning at Sea",
        "location": "East China Sea, heading NE",
        "letter": (
            "John & Susan —\n\n"
            "Tokyo is already behind you, though the city's lights probably still feel close. "
            "This morning Silver Nova is running northeast through the East China Sea, the water shifting "
            "from harbor gray to deep Pacific blue. The ship finds her rhythm at sea in a way she never "
            "quite manages in port — and so, after a few days of temples and transit, might you.\n\n"
            "Let the deck claim you today. The Pacific crossing ahead is eleven days without interruption, "
            "which is rarer than it sounds. There will be nothing on the horizon because you don't need "
            "anything there. The ship's spa, the pool deck, the library — all yours.\n\n"
            "This evening: The Grill at 18:30. Open-flame cooking, proper cuts, the best casual "
            "dinner on the ship. You're on the waitlist — check with the restaurant this morning and "
            "they'll likely have you confirmed by noon. Go early if they offer a sunset seat."
        ),
    },
    "2026-04-27": {
        "date": "2026-04-27",
        "day_label": "Day 5 — Mid Pacific",
        "location": "North Pacific, nearing Date Line",
        "letter": (
            "John & Susan —\n\n"
            "You're approaching the International Date Line — the invisible seam in the ocean where "
            "the calendar folds. The ship will cross it quietly, perhaps while you sleep. The officers "
            "will note it in the log. You may feel nothing at all, which is exactly right.\n\n"
            "The Pacific at mid-crossing has a quality of spaciousness that's difficult to describe "
            "to anyone who hasn't been on it. The air is clean in a way that cities aren't. The "
            "noise floor drops. The clocks become suggestions.\n\n"
            "Tonight: Kaiseki at 18:30 — your $160 reservation. This is the finest dedicated Japanese "
            "dining experience on the ship, and given that you've just come from a week in Japan, "
            "you'll have the context to appreciate it properly. Let the evening be slow. Order the full "
            "progression if they offer it."
        ),
    },
    "2026-04-28": {
        "date": "2026-04-28",
        "day_label": "Day 6 — Date Line Crossing",
        "location": "International Date Line region",
        "letter": (
            "John & Susan —\n\n"
            "You are at the far edge of the world today — or the near edge, depending on how you "
            "count. The Date Line crossing is one of those invisible geographic ceremonies that "
            "nonetheless marks something real: you are halfway between the place you started and "
            "the place you're going, with only ocean in every direction.\n\n"
            "Silversea sometimes marks the crossing with a small ceremony on the pool deck. "
            "If they do, go. These rituals feel minor and are often remembered.\n\n"
            "Tonight is the S.A.L.T. Chef's Table — your $360 reservation at 18:30. "
            "This is the most intimate dining experience on the ship: a single long table, "
            "one seating, immersive. It's built around the ingredients and culinary traditions of "
            "the voyage's region. Given where you are in the Pacific, expect something unexpected. "
            "Dress well. This is the evening of the crossing."
        ),
    },
    "2026-04-29": {
        "date": "2026-04-29",
        "day_label": "Day 7 — East of the Date Line",
        "location": "North Pacific, east of Date Line",
        "letter": (
            "John & Susan —\n\n"
            "Yesterday you crossed the date line. Today the Pacific looks exactly the same — "
            "which is a lesson worth sitting with. The ocean doesn't mark its own divisions. "
            "The water doesn't know which hemisphere's clocks you're setting.\n\n"
            "You're running northeast now toward Alaska, still days away. The sky at this "
            "latitude runs large and sometimes theatrical — watch for lenticular cloud formations "
            "in the mornings, which appear when marine air hits cold upper atmosphere. They look "
            "like stacked lenses. They have nothing to do with anything except being beautiful.\n\n"
            "La Terrazza at 18:30 tonight — the ship's Italian restaurant with the floor-to-ceiling "
            "stern windows. On a calm evening, the wake stretches behind you like a road. "
            "This is the one to book a window table for. Ask when you arrive."
        ),
    },
    "2026-04-30": {
        "date": "2026-04-30",
        "day_label": "Day 8 — Turning North",
        "location": "North Pacific, curving toward Alaska",
        "letter": (
            "John & Susan —\n\n"
            "The route is arcing north now, following the great circle track toward Alaska. "
            "The air temperature has dropped a few degrees from the warmth off Japan — "
            "nothing dramatic, just the planet reminding you of latitude. You may want a layer "
            "on the veranda in the mornings.\n\n"
            "Seven days remain in the voyage. The Pacific crossing is more than half done, "
            "and ahead of you are Sitka, Juneau, Wrangell, Ketchikan, and Victoria — each "
            "a different coast, a different light. Alaska in May is something specific: "
            "still cold, still raw, the green coming in hard.\n\n"
            "The Grill at 18:30. Second time on this crossing — it earns repeats. "
            "Order whatever they're featuring from the wood fire. "
            "It will be different from the last time."
        ),
    },
    "2026-05-01": {
        "date": "2026-05-01",
        "day_label": "Day 9 — Gulf of Alaska Approach",
        "location": "Subpolar North Pacific",
        "letter": (
            "John & Susan —\n\n"
            "May Day. You're entering subpolar waters — the temperature differential between "
            "the Alaskan coast and the Pacific basin drives the weather here, and you may begin "
            "to see the deck conditions shift. The ocean runs darker at this latitude, "
            "a deep charcoal blue rather than tropical. Watch for seabirds — Laysan albatrosses "
            "sometimes follow ships this far north, the most effortless fliers on earth.\n\n"
            "In four days: Sitka. The first land since Miyako six days ago. There's an excursion "
            "booked — the Culinary Adventure at 10:30. Think about what you want to eat "
            "and drink in Alaska. Think about the fish.\n\n"
            "La Dame tonight at 18:30 — your $200 reservation. French, white tablecloths, "
            "the most formally elegant evening on the ship. Let it be formal. "
            "The Pacific won't ask anything of you until tomorrow."
        ),
    },
    "2026-05-02": {
        "date": "2026-05-02",
        "day_label": "Day 10 — Deep Pacific",
        "location": "Gulf of Alaska waters",
        "letter": (
            "John & Susan —\n\n"
            "The Gulf of Alaska begins where the Pacific basin deepens and the continental shelf "
            "drops away. The water here is extraordinarily productive — cold, nutrient-rich, "
            "and full of movement. If visibility allows, watch the bow wake for dolphin. "
            "Pacific white-sided dolphins travel in large pods and will sometimes ride a ship's "
            "pressure wave for an hour.\n\n"
            "Three days until Sitka. The rhythm of the ship has probably become natural by now — "
            "when the announcements happen, when the galley smells change before a meal, "
            "which deck is quietest at which hour. This is the knowledge you earn at sea "
            "and can't fake anywhere else.\n\n"
            "Silver Note at 18:30 — the jazz bar and lounge venue. Different register than "
            "the dining rooms: easier, live music, a long list of things poured over ice. "
            "Stay through the first set at minimum."
        ),
    },
    "2026-05-03": {
        "date": "2026-05-03",
        "day_label": "Day 11 — Nearing Alaska",
        "location": "Gulf of Alaska, approaching Sitka",
        "letter": (
            "John & Susan —\n\n"
            "Tomorrow: Sitka. After ten days of open ocean, land will be visible again, "
            "and it will arrive specifically as the coast of Southeast Alaska — which is not "
            "subtle. The Inside Passage coastline is vertical and rain-forested and dramatic "
            "in a way that Japan and the mid-Pacific are not. A different kind of beauty.\n\n"
            "Today is the last full sea day before Alaska, and the last one on the open Pacific. "
            "Worth marking, if quietly. The veranda at dusk. The fact that you've crossed "
            "an ocean. Most people don't.\n\n"
            "The Grill at 18:30. Third time. By now you know what you want. "
            "Order it and tip the staff who've learned your name."
        ),
    },
    "2026-05-04": {
        "date": "2026-05-04",
        "day_label": "Day 12 — Eve of Sitka",
        "location": "Gulf of Alaska, pre-landfall",
        "letter": (
            "John & Susan —\n\n"
            "By evening you may sight the coast. Southeast Alaska arrives first as mountains — "
            "the St. Elias range if the clouds allow, white peaks at a distance that seems "
            "impossible until you realize the range has summits over 18,000 feet. "
            "North America's continental edge, right at the ship's bow.\n\n"
            "Tomorrow's Sitka excursion runs at 10:30 — the Culinary Adventure, three hours. "
            "The town is small and specific: Russian Orthodox cathedral, Southeast Alaska's "
            "arts scene, fish that came out of the water this morning. "
            "Eat what they offer. Bring layers.\n\n"
            "La Terrazza at 18:30 — the last dinner before Alaska ports shift the rhythm "
            "to 19:30 arrivals. Tonight: the stern windows, the wake, the end of the open Pacific. "
            "Pour something celebratory. You crossed it."
        ),
    },
    "2026-05-09": {
        "date": "2026-05-09",
        "day_label": "Day 30 — Inside Passage",
        "location": "Inside Passage, British Columbia",
        "letter": (
            "John & Susan —\n\n"
            "The Inside Passage. This is one of the world's great waterways — a sheltered channel "
            "running between the British Columbia coast and its barrier islands, protected from the "
            "open Pacific but still ocean. The water here is dark green, glacially cold, "
            "the shoreline so close you can hear it. Eagles are common. Humpbacks are not uncommon.\n\n"
            "Yesterday was Ketchikan. Tomorrow is Victoria, and then Seattle, and then home. "
            "The voyage is almost complete. Thirty days of it. Most people in the world will never "
            "spend thirty consecutive days this way, and you built this for yourselves — "
            "every flight, every hotel, every reservation. That's worth sitting with.\n\n"
            "The Grill at 18:30 — your last sea day dinner. The last dinner before Victoria. "
            "Order something you haven't tried. Leave nothing unasked for. "
            "The ship has two more days to give you whatever you want from her. Ask."
        ),
    },
}


@router.get("")
async def get_sea_letters(request: Request):
    get_email(request)
    return {"letters": list(SEA_LETTERS.values())}


@router.get("/{date}")
async def get_sea_letter(date: str, request: Request):
    get_email(request)
    letter = SEA_LETTERS.get(date)
    if not letter:
        return {"letter": None}
    return {"letter": letter}

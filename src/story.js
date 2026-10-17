/*
 * FOR MINNI, FROM ANNAYYA — THE COMPLETE STORY
 * Preserving every single precious memory in its own dedicated cinematic scene.
 *
 * Birthday: December 14
 * Recipient: Blessy (Minni)
 * Sender: Jagadeesh (Annayya)
 */

window.STORY = {
  meta: {
    recipient: "Blessy",
    nickname: "Minni",
    sender: "Jagadeesh",
    senderRole: "Annayya",
    birthday: "December 14",
    title: "For Minni, From Annayya ❤️"
  },

  music: "music/as_it_was_instrumental.mp3",

  ui: {
    back: "← Back",
    next: "Next →",
    continue: "Continue →",
    turnPage: "Turn the page →",
    replay: "Replay our story ↺",
    photosAgain: "← View the photos",
  },

  /* -------------------------------------------------------------
     SCENE 0: THE BIRTHDAY PROLOGUE
     ------------------------------------------------------------- */
  wish: {
    theme: "midnight",
    bg: "midnight",
    fx: "gold",
    date: "December 14",
    heading: "Happy Birthday, Blessy.",
    revealText: "To my favourite human, my Minni.",
    button: "There's something I made for you ✨",
    pauseMs: 1200,
  },

  /* -------------------------------------------------------------
     SCENE 1: THE INVITATION
     ------------------------------------------------------------- */
  invite: {
    theme: "invitation",
    bg: "invitation",
    fx: "dust",
    lines: [
      "Some memories deserve more than a place in our minds.",
      "Want to take a little journey with me?"
    ],
    button: "Let's go, Annayaaa ❤️",
  },

  /* -------------------------------------------------------------
     PHASE ONE — THE GOLDEN DAYS
     ------------------------------------------------------------- */

  // Scene 2: The Unexpected Beginning
  beginning: {
    theme: "beginning",
    bg: "beginning",
    fx: "dust",
    eyebrow: "Phase I — The Golden Days",
    chapter: "The Unexpected Beginning",
    lines: [
      "We were a senior and a junior who had barely spoken for an entire year.",
      "Then, one random conversation made everything feel different.",
      "It felt strangely familiar — as if we had known each other for years.",
      "Somewhere along the way, ‘senior and junior’ became the least interesting thing about us."
    ],
    photos: [
      {
        src: "photos/photo-08.jpg",
        caption: "Where it all started — the unexpected conversation"
      }
    ],
    button: "Turn the page →",
  },

  // Scene 3: The Unstoppable Duo
  unstoppable: {
    theme: "beginning",
    bg: "beginning",
    fx: "dust",
    eyebrow: "Phase I — The Golden Days",
    chapter: "The Unstoppable Duo",
    lines: [
      "Within days, our real rhythm kicked in.",
      "Teasing each other non-stop, roasting people, and laughing until our stomachs hurt.",
      "Even our busmates knew that whenever we were together, the energy was pure chaos and genuine joy."
    ],
    quote: "We were simply unstoppable together.",
    photos: [
      {
        src: "photos/photo-04.jpg",
        caption: "College mornings & bus ride laughter"
      }
    ],
    video: {
      src: "video/bus.mp4",
      webm: "video/bus.webm",
      poster: "video/bus-poster.jpg",
      label: "Our daily bus rides — unstoppable duo"
    },
    button: "Next memory →",
  },

  // Scene 4: “Annayaaa…”
  annayaaa: {
    theme: "beginning",
    bg: "beginning",
    fx: "dust",
    eyebrow: "Phase I — The Golden Days",
    chapter: "“Annayaaa…”",
    highlightWord: "“Annayaaa…”",
    lines: [
      "Somehow, even one little word from you in that cute voice of yours could make being your brother feel like the most beautiful thing in the world.",
      "No fancy words could ever replace that spontaneous little moment."
    ],
    quote: "You didn't just call me brother. You made me feel like one.",
    photos: [
      {
        src: "photos/photo-02.jpg",
        caption: "That unmistakable laugh and genuine warmth"
      }
    ],
    button: "Continue →",
  },

  // Scene 5: The Shoulder
  shoulder: {
    theme: "beginning",
    bg: "beginning",
    fx: "dust",
    eyebrow: "Phase I — The Golden Days",
    chapter: "The Shoulder",
    lead: "Do you remember those moments when you got tired and rested your head on my shoulder?",
    lines: [
      "I don't know if you realised it, but those little moments meant so much to me.",
      "They made me feel that you were completely comfortable around me — that you trusted me enough to simply rest and let your guard down."
    ],
    quote: "A quiet feeling of trust, comfort, and belonging.",
    photos: [
      {
        src: "photos/photo-07.jpg",
        caption: "A quiet moment of complete comfort and trust"
      }
    ],
    pauseMs: 1800,
    button: "Turn the page →",
  },

  // Scene 6: Traditional Day
  traditional: {
    theme: "beginning",
    bg: "beginning",
    fx: "dust",
    eyebrow: "Phase I — The Golden Days",
    chapter: "Traditional Day",
    lead: "Among all the memories we made, there's one little moment I could never forget…",
    highlight: "That traditional day. That biryani. And feeding you with my own hands.",
    lines: [
      "Maybe it was just one ordinary moment to anyone else.",
      "But it's one of those memories I will always carry with me."
    ],
    photos: [
      {
        src: "photos/photo-11.jpg",
        caption: "Traditional day — feeding you biryani"
      },
      {
        src: "photos/photo-09.jpg",
        caption: "Cherished celebrations on campus"
      }
    ],
    button: "There's another chapter →",
  },

  /* -------------------------------------------------------------
     PHASE TWO — THE DARK DAYS
     ------------------------------------------------------------- */
  // Scene 7: The Dark Days
  dark: {
    theme: "distance",
    bg: "distance",
    fx: "mist",
    eyebrow: "Phase II — The Dark Days",
    chapter: "When Things Changed",
    lines: [
      "Then life became difficult, and the closeness we once knew grew quieter.",
      "I missed you. I didn't understand everything you were going through, but I wished you didn't have to face so much alone.",
      "Some chapters are quieter than others. They still belong to the story."
    ],
    closing: "Even then, this was never the end of our story.",
    pauseMs: 2500, // gentle silence before button illuminates
    button: "See what happened next →",
  },

  /* -------------------------------------------------------------
     PHASE THREE — FINDING EACH OTHER AGAIN
     ------------------------------------------------------------- */
  // Scene 8: Finding Each Other Again (The 2-Hour Call)
  reunion: {
    theme: "reunion",
    bg: "reunion",
    fx: "rise",
    eyebrow: "Phase III — Finding Each Other Again",
    chapter: "And Then, You Called.",
    lead: "Then, one day, you called.",
    pauseLine: "Two hours later, I realised how much I had missed talking to my sister.",
    lines: [
      "Slowly, we found our way back to each other.",
      "And today, being someone you trust enough to share your world with means more to me than I can ever explain."
    ],
    thought: [
      "Maybe the best part wasn't going back to how things were.",
      "Maybe it was discovering that we still had more memories to make."
    ],
    photos: [
      {
        src: "photos/photo-05.jpg",
        caption: "The phone call that bridged the silence"
      },
      {
        src: "photos/photo-06.jpg",
        caption: "Finding our way back, stronger and closer"
      }
    ],
    pauseMs: 2000,
    button: "My silent promise to you…",
  },

  // Scene 9: The Silent Promise
  promise: {
    theme: "reunion",
    bg: "reunion",
    fx: "rise",
    eyebrow: "A Promise From Annayya",
    chapter: "The Silent Promise",
    lead: "I know there were times when my own words or behaviour hurt you. I'm sorry for those moments.",
    body: "I cannot promise that life will never make you cry.\n\nBut I promise to keep becoming a better Annayya — someone who listens, understands, stands beside you, and never knowingly becomes the reason for your tears.",
    closing: "You will always have a brother who is learning how to love you better.",
    button: "One last surprise for Minni… ✨",
  },

  /* -------------------------------------------------------------
     THE GRAND PHOTO REVEAL
     ------------------------------------------------------------- */
  // Scene 10: The Photo Album
  gallery: {
    theme: "gallery",
    bg: "gallery",
    fx: "gold",
    title: "Our Photographs",
    subtitle: "Every frame holds a piece of our story.",
    groups: [
      {
        id: "all",
        label: "Highlights",
        photos: [
          { src: "photos/photo-13.jpg", title: "Favourite Memory", sub: "Brightest smiles", hero: true },
          { src: "photos/photo-06.jpg", title: "Reunion Smiles", sub: "Finding our way back" },
          { src: "photos/photo-04.jpg", title: "The Bus Duo", sub: "Unstoppable together" },
          { src: "photos/photo-11.jpg", title: "Traditional Day", sub: "Hand-fed biryani" },
          { src: "photos/photo-02.jpg", title: "Annayaaa!", sub: "Endless laughter" },
          { src: "photos/photo-15.jpg", title: "Side by Side", sub: "Stronger together" }
        ]
      },
      {
        id: "phase1",
        label: "Phase I: The Golden Days",
        photos: [
          { src: "photos/photo-04.jpg", title: "Bus Rides", sub: "Morning energy & laughs", hero: true },
          { src: "photos/photo-08.jpg", title: "First Conversation", sub: "Where it started" },
          { src: "photos/photo-02.jpg", title: "Playful Teasing", sub: "Natural sibling bond" },
          { src: "photos/photo-07.jpg", title: "Resting Shoulder", sub: "Comfortable silences" },
          { src: "photos/photo-11.jpg", title: "Traditional Feast", sub: "Biryani moment" },
          { src: "photos/photo-09.jpg", title: "Campus Memories", sub: "Carefree college days" }
        ]
      },
      {
        id: "phase3",
        label: "Phase III: Stronger Together",
        pages: [
          [
            { src: "photos/photo-13.jpg", title: "Celebration", sub: "Golden hour warmth", hero: true },
            { src: "photos/photo-05.jpg", title: "The 2-Hour Call", sub: "Two hours of pure joy" },
            { src: "photos/photo-06.jpg", title: "Real Happiness", sub: "Smiles that matter" },
            { src: "photos/photo-14.jpg", title: "New Adventures", sub: "Making more memories" },
            { src: "photos/photo-15.jpg", title: "Brother & Sister", sub: "Unbreakable bond" }
          ],
          [
            { src: "photos/photo-01.jpg", title: "Cherished Moment", sub: "Always here for you", hero: true },
            { src: "photos/photo-10.jpg", title: "Warmth & Smiles", sub: "Every single time" },
            { src: "photos/photo-12.jpg", title: "Special Day", sub: "Pure warmth and fun" },
            { src: "photos/photo-03.jpg", title: "Unforgettable", sub: "Laughter never forgotten" }
          ]
        ],
        photos: [
          { src: "photos/photo-13.jpg", title: "Celebration", sub: "Golden hour warmth", hero: true },
          { src: "photos/photo-05.jpg", title: "The 2-Hour Call", sub: "Two hours of pure joy" },
          { src: "photos/photo-06.jpg", title: "Real Happiness", sub: "Smiles that matter" },
          { src: "photos/photo-14.jpg", title: "New Adventures", sub: "Making more memories" },
          { src: "photos/photo-15.jpg", title: "Brother & Sister", sub: "Unbreakable bond" },
          { src: "photos/photo-01.jpg", title: "Cherished Moment", sub: "Always here for you" },
          { src: "photos/photo-10.jpg", title: "Warmth & Smiles", sub: "Every single time" },
          { src: "photos/photo-12.jpg", title: "Special Day", sub: "Pure warmth and fun" },
          { src: "photos/photo-03.jpg", title: "Unforgettable", sub: "Laughter never forgotten" }
        ]
      }
    ],
    button: "Read the note →"
  },

  /* -------------------------------------------------------------
     FINAL BIRTHDAY REVEAL
     ------------------------------------------------------------- */
  // Scene 11: The Final Birthday Greeting
  finale: {
    theme: "finale",
    bg: "midnight",
    fx: "burst",
    heading: "Happy Birthday, Minni ❤️",
    lines: [
      "We've had our golden days, our difficult days, and our way back to each other.",
      "I'm grateful for every beautiful memory still waiting for us.",
      "With love,\nYour Annayya,\nJagadeesh."
    ],
    tagline: "Three phases. One sister. More memories to come.",
    signature: "— Jagadeesh ❤️",
    backdropPhoto: "photos/photo-13.jpg",
    replayButton: "Replay our story ↺",
    photosButton: "← View the photos",
  }
};

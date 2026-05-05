import { days, foundationPoints, weekIntros, weekOrder, weekQuotes } from "./guide-data.js";

const weekProfiles = {
  "Week 1": {
    title: "Assurance, Identity, and the Grace of New Birth",
    focus:
      "The opening week teaches new believers to rest in Christ's finished work, receive assurance, and understand their new identity as children of God.",
    references: ["John 1:12", "Romans 8:1", "2 Corinthians 5:17", "Ephesians 2:8-9"],
    paragraph:
      "New birth is not a religious decoration placed over an unchanged life. It is the miracle of God bringing a sinner into union with Jesus Christ, granting forgiveness, adoption, and a new beginning. This week therefore starts where every lasting Christian book must start: not with human effort, but with the mercy of God revealed in Christ. Assurance matters because a trembling heart cannot grow well when it is always trying to earn what Jesus has already purchased. Identity matters because the believer must know who he or she has become in the household of God. Grace matters because all spiritual strength flows from the finished work of the Savior and not from self-confidence.",
    application:
      "As you move through these first seven chapters, read slowly, pray honestly, and let the truth settle deeply. Every practice that follows will be healthier when it grows out of assurance rather than anxiety."
  },
  "Week 2": {
    title: "Daily Habits That Sustain a Life With God",
    focus:
      "The second week turns from identity to rhythm, showing how trust, prayer, Scripture, worship, obedience, and gratitude become the steady habits of a growing believer.",
    references: ["Psalm 1:2-3", "John 15:4-5", "Romans 10:17", "1 Thessalonians 5:17-18"],
    paragraph:
      "Christian maturity rarely begins with dramatic outward visibility. More often it grows in hidden faithfulness: a Bible opened when no one is watching, a whispered prayer in an ordinary hour, a decision to obey quickly, a grateful heart resisting complaint, and a soul learning to trust God beyond its own understanding. This week helps the believer establish those ordinary but powerful habits. The goal is not legalism, nor a life of mechanical routine, but fellowship with the living God. Habits become holy when they keep the heart near Christ and train the soul to answer His Word with trust and obedience.",
    application:
      "These chapters are ideal for repeat reading. A believer who returns to them often will find that steady patterns create stability, and stability creates room for deeper growth."
  },
  "Week 3": {
    title: "Character, Holiness, and the Work of Obedience",
    focus:
      "The third week presses into repentance, renewal, purity, forgiveness, temptation, and spiritual strength so that Christian growth reaches the level of character.",
    references: ["Romans 12:2", "1 John 1:9", "1 Peter 1:15-16", "Ephesians 6:10"],
    paragraph:
      "The gospel not only pardons the believer; it also reshapes the believer. Grace is not permission to remain unchanged. It is the power by which the heart is softened, the mind is renewed, the will is redirected, and the life is brought under the loving lordship of Jesus Christ. That is why this week is deeply practical and deeply hopeful at the same time. It names sin honestly without surrendering to despair. It calls for holiness without promoting self-righteousness. It teaches that a Christian can confess failure, receive cleansing, fight temptation, and continue walking because Christ supplies both mercy and strength.",
    application:
      "Read these chapters prayerfully, especially if you are fighting discouragement. They are designed to strengthen repentance without weakening hope."
  },
  "Week 4": {
    title: "Community, Service, Witness, and Mission",
    focus:
      "The fourth week places growth inside the life of the church, teaching that no believer matures alone and no disciple is meant to live only for self.",
    references: ["Hebrews 10:24-25", "Galatians 5:13", "Matthew 5:16", "2 Timothy 2:2"],
    paragraph:
      "Healthy Christian growth always turns outward. The believer who has received grace begins to seek fellowship, welcome instruction, carry the burdens of others, serve humbly, and speak of Christ with growing courage. This week moves the reader into that wider horizon. Church membership and fellowship are not optional accessories to discipleship; they are part of God's wise provision for endurance and fruitfulness. Service is not a way of earning approval; it is the overflow of Christlike love. Witness is not the performance of a spiritual elite; it is the simple testimony of a redeemed life shining before others.",
    application:
      "These chapters are especially helpful for small groups, follow-up classes, and discipleship pairs because they move naturally from private devotion into public Christian life."
  },
  Bonus: {
    title: "Abiding and Continuing Beyond the First Thirty Days",
    focus:
      "The final section slows the reader down so that the guide ends not with exhaustion, but with abiding dependence, renewed direction, and steady hope for the road ahead.",
    references: ["John 15:4-5", "Philippians 1:6", "Psalm 92:12-14", "Colossians 2:6-7"],
    paragraph:
      "Many believers begin with sincerity and then lose momentum because they mistake a spiritual beginning for a finished journey. The final section of this manuscript guards against that mistake. Abiding in Christ is not a brief exercise reserved for the end of a program; it is the lifelong secret of fruitfulness. The God who begins His work also continues it, disciplines it, deepens it, and completes it. The believer therefore leaves this book not merely with memories of thirty days, but with a clearer pattern for continued prayer, Bible reading, fellowship, and practical obedience.",
    application:
      "These final chapters help the reader translate a short guide into a durable way of life."
  }
};

const relatedReferences = {
  1: ["John 3:3", "Ezekiel 36:26"],
  2: ["Titus 3:5", "Romans 5:1"],
  3: ["Galatians 4:6-7", "1 John 3:1"],
  4: ["Matthew 4:4", "Psalm 119:105"],
  5: ["Hebrews 4:16", "Luke 18:1"],
  6: ["Isaiah 26:3", "Colossians 3:15"],
  7: ["Psalm 1:2-3", "Jude 1:24"],
  8: ["Jeremiah 17:7-8", "Psalm 37:5"],
  9: ["Romans 8:14", "1 Corinthians 2:12"],
  10: ["Psalm 100:2-4", "Hebrews 13:15"],
  11: ["James 1:22", "Luke 6:46"],
  12: ["Ephesians 6:18", "Colossians 4:2"],
  13: ["Joshua 1:8", "Hebrews 4:12"],
  14: ["Psalm 103:1-5", "Colossians 3:15-17"],
  15: ["Proverbs 28:13", "2 Corinthians 7:10"],
  16: ["Psalm 32:5", "Micah 7:18-19"],
  17: ["Philippians 4:8", "2 Corinthians 10:5"],
  18: ["1 Thessalonians 4:3-4", "Psalm 24:3-4"],
  19: ["Matthew 6:14-15", "Colossians 3:13"],
  20: ["James 4:7", "Matthew 26:41"],
  21: ["Isaiah 40:29-31", "Ephesians 3:16"],
  22: ["Acts 2:42", "Ecclesiastes 4:9-10"],
  23: ["Proverbs 13:20", "Titus 2:3-5"],
  24: ["Mark 10:45", "Philippians 2:3-5"],
  25: ["1 Peter 2:12", "John 13:35"],
  26: ["Psalm 66:16", "Revelation 12:11"],
  27: ["Ephesians 6:18", "James 5:16"],
  28: ["Hebrews 12:1-2", "2 Thessalonians 3:13"],
  29: ["Psalm 27:4", "Colossians 2:6-7"],
  30: ["1 Thessalonians 5:23-24", "Hebrews 12:2"]
};

const frontMatter = [
  {
    label: "Copyright",
    title: "Publication Information",
    className: "copyright-page",
    paragraphs: [
      "Spiritual Growth After New Birth",
      "A devotional discipleship guide for new believers.",
      "Copyright © 2026. All rights reserved.",
      "Scripture references are provided for study and devotional use. Churches, small groups, and discipleship leaders may use this material for non-commercial ministry instruction with proper acknowledgement.",
      "For publication, printing, or wider distribution, add the author's name, publisher information, ISBN, edition number, and Scripture translation permissions before final release."
    ]
  },
  {
    label: "Dedication",
    title: "For New Believers and Those Who Walk With Them",
    paragraphs: [
      "This book is dedicated to every person who has newly come to faith in Jesus Christ and is learning how to walk with Him one day at a time.",
      "It is also offered with gratitude for pastors, teachers, follow-up workers, prayer partners, and mature believers who patiently help others become rooted in the Word of God, strengthened in prayer, and established in the fellowship of the church."
    ]
  },
  {
    label: "Preface",
    title: "A Gentle Word Before You Begin",
    paragraphs: [
      "This manuscript began as a simple discipleship guide and has been shaped into a fuller devotional book for personal reading, follow-up ministry, Bible study classes, and church-based discipleship. Its purpose is pastoral and practical: to help new believers understand the early steps of the Christian life with warmth, clarity, and biblical confidence.",
      "Many people sincerely come to Christ and then need steady help in the weeks that follow. They need assurance, encouragement, daily habits, gentle correction, and loving guidance into the life of the local church. They need to know that the Lord who saved them is also patient to teach, strengthen, and keep them.",
      "The chapters are intentionally brief enough for daily reading, yet rich enough for reflection and group discussion. Bible references are highlighted so readers can pause, search the Scriptures, and allow each lesson to become prayer, obedience, and worship."
    ]
  },
  {
    label: "How To Use",
    title: "Reading This Book Slowly and Fruitfully",
    paragraphs: [
      "This book may be read devotionally, one chapter each day, over thirty days. It may also be used in weekly discipleship meetings, foundations classes, or follow-up ministry. Each chapter begins with a key Scripture, opens the day's theme, and ends with prayer and reflection helps.",
      "Read without rushing. Pause over the Scriptures. Mark words that speak to your heart. Turn the prayer emphasis into your own words. The goal is not simply to finish pages, but to grow in trust, obedience, worship, and fellowship with Christ.",
      "Leaders may assign chapters before a meeting and use the reflection questions for discussion. New believers may journal after each reading, especially when a chapter names a fear, a habit, or a next step that requires courage."
    ]
  },
  {
    label: "Doctrinal Foundation",
    title: "The Four Anchors Beneath This Manuscript",
    paragraphs: foundationPoints.map(
      (item) =>
        `${item.title} is more than a memorable phrase. ${item.text} These foundational truths return throughout the manuscript because they keep spiritual growth balanced and hopeful. The believer belongs to Jesus by grace, grows through daily faithfulness, needs the shaping power of Scripture, and receives strength through Christian community.`
    )
  },
  {
    label: "Publisher's Note",
    title: "A Note for Final Publication",
    paragraphs: [
      "Before this manuscript is sent to print, review every Scripture quotation and reference according to the Bible translation you intend to use. Add translation credits, author biography, acknowledgements, publisher information, and any required permissions.",
      "The book is currently structured for a devotional format: front matter, table of contents, weekly parts, thirty daily chapters, reflection helps, and a final commission. This gives the manuscript a clear, standard shape for editing, design, and eventual publication."
    ]
  }
];

const backMatter = [
  {
    label: "Acknowledgements",
    title: "With Gratitude",
    paragraphs: [
      "Gratitude is due to every faithful believer who helps another person grow in Christ through prayer, teaching, encouragement, correction, and patient love.",
      "May this work serve local churches and discipleship leaders as they welcome new believers and help them become rooted in the grace and truth of Jesus Christ."
    ]
  },
  {
    label: "About This Resource",
    title: "For Churches, Classes, and Personal Study",
    paragraphs: [
      "This book may be used as a thirty-day devotional, a five-week foundations class, or a follow-up tool for those who have recently received Christ.",
      "For group use, each week can become one teaching session. The daily chapters may be assigned between meetings, while the reflection questions can guide conversation, prayer, and personal application."
    ]
  }
];

function scriptureTag(reference) {
  return `<cite class="scripture-ref">${reference}</cite>`;
}

function renderParagraphs(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
}

function chapterTitle(entry) {
  return `Chapter ${entry.day}: ${entry.title}`;
}

function getWeekEssay(week) {
  const profile = weekProfiles[week];
  return `
    <section class="week-banner">
      <p class="eyebrow">${week}</p>
      <h2>${profile.title}</h2>
      <p>${profile.focus}</p>
      <p>${profile.paragraph}</p>
      <div class="week-banner-meta">
        <article>
          <h4>Key References</h4>
          <p>${profile.references.map(scriptureTag).join(", ")}</p>
        </article>
        <article>
          <h4>Pastoral Direction</h4>
          <p>${profile.application}</p>
        </article>
      </div>
    </section>
  `;
}

function getChapterParagraphs(entry) {
  const reference = scriptureTag(entry.scripture);
  const refs = relatedReferences[entry.day].map(scriptureTag).join(", ");

  const sharedOpening = `The theme of Day ${entry.day}, "${entry.title}," is anchored in ${reference}. ${entry.focus} This chapter slows that truth down so it can move from a brief study point into a fuller ministry lesson. A new believer needs more than a statement to agree with; the heart needs time to see how the truth of Scripture reaches fear, desire, habits, memory, worship, and daily decisions. Christian growth becomes durable when biblical truth is given enough room to settle deeply.`;

  const sharedMiddle = `The action for this day is also important because growth is not merely intellectual. ${entry.action} Practical obedience does not replace grace; it responds to grace. In the same way, the prayer direction for the day is not decorative language. ${entry.prayer} Prayer trains the heart to move toward God with honesty and dependence rather than retreating into self-reliance.`;

  const sharedClosing = `As you meditate on this chapter, keep the supporting Scriptures nearby: ${refs}. Each one enlarges the same lesson from another angle. They remind us that the Bible interprets the Bible, and that steady growth comes when a believer learns to gather many biblical voices around the same truth and receive them as one harmonious word from God.`;

  switch (entry.week) {
    case "Week 1":
      return [
        sharedOpening,
        `Week 1 is the week of assurance and identity, so this day's teaching must be read through the lens of grace. When a person first comes to Christ, uncertainty often speaks loudly. Past failures still feel near. Old patterns still cast shadows. The believer may wonder whether change is real or whether peace with God is secure. ${reference} answers those fears by pointing away from performance and toward divine action. God has done something real in Christ. That reality becomes the believer's starting place. The Christian life is not sustained by pretending to be strong. It is sustained by learning to trust what God has declared and what Christ has accomplished.`,
        `Identity shapes behavior. If a believer still imagines that he or she stands outside the Father's welcome, then obedience will often be driven by panic or shame. But when the believer receives the truth of adoption, forgiveness, and new life, the heart becomes freer to walk with God sincerely. This is why related passages such as ${scriptureTag("John 1:12")} and ${scriptureTag("Romans 8:1")} matter so much in this opening movement of the book. They announce that the believer's relationship to God has changed. The Christian is no longer a stranger trying to gain entry, but a child learning how to live inside the Father's house.`,
        `There is also a healing dimension to assurance. Many people carry histories marked by regret, religious confusion, broken trust, or unstable emotions. The gospel does not ask them to deny those realities. Instead, it invites them to place those realities under the lordship of Jesus. A new life in Christ does not erase memory, but it does reinterpret memory. The believer can say, "My past is real, but it no longer has the final word over my future." That is one reason this week emphasizes both identity and rootedness. When roots go down into grace, the soul gains stability even while growth is still tender.`,
        sharedMiddle,
        `This chapter should therefore be read with thanksgiving. Stop where you need to stop. Turn a sentence into a prayer. Speak the promise back to God. If fear rises, answer it with Scripture. If gratitude rises, let it become worship. The early days of discipleship are not about mastering Christian vocabulary; they are about learning to rest the whole weight of life upon the reliability of Jesus Christ. ${sharedClosing}`
      ];
    case "Week 2":
      return [
        sharedOpening,
        `Week 2 teaches habits that sustain growth, and this matters because sincere beginnings can fade without spiritual rhythm. Habits are not the enemy of spiritual life; empty habits are. Holy habits, formed around the presence of God, become channels through which the believer learns consistency. ${reference} addresses that need by showing that growth is nourished through repeated acts of trust, prayer, worship, attention, and obedience. Over time, these repeated acts shape the inner life. The believer becomes steadier not by accident, but by returning again and again to the means God has appointed.`,
        `One of the quiet dangers of early discipleship is inconsistency. A believer may feel close to God in moments of crisis or emotional intensity, yet struggle to seek Him on an ordinary day. That is why Scripture repeatedly links fruitfulness to abiding, meditation, perseverance, and prayer. Consider passages like ${scriptureTag("Psalm 1:2-3")}, ${scriptureTag("John 15:4-5")}, and ${scriptureTag("1 Thessalonians 5:17")}. They do not present spiritual life as occasional excitement; they present it as an ongoing relationship that touches the whole day. Habits are simply the practical shape of that ongoing relationship.`,
        `A second blessing of good habits is that they create room for the Spirit's steady work. A short prayer at set times, a thoughtful reading plan, a pattern of gratitude, and a willingness to obey known truth all create a spiritual environment in which the believer becomes more attentive to God. These practices do not force God's hand, but they position the heart to listen, receive, and respond. The point is fellowship, not performance. A Bible that is opened only to complete an assignment will not be used as fruitfully as a Bible opened with hunger, humility, and expectancy.`,
        sharedMiddle,
        `Do not despise small beginnings. A five-minute prayer habit may become a life of intercession. A single verse carried through the day may become a source of strength in trial. One act of prompt obedience may save a believer from a long detour of compromise. The Lord often builds durable Christian lives through quiet repetition rather than spectacle. Read this chapter with patience, and ask God to establish habits in you that will still be bearing fruit years from now. ${sharedClosing}`
      ];
    case "Week 3":
      return [
        sharedOpening,
        `Week 3 moves into character and obedience, which means the reader is invited to face the deeper work of transformation. The Christian life is not simply the reception of comfort. It is also the reshaping of affections, choices, and thought patterns by the truth of God. ${reference} must therefore be heard as both invitation and command. The Lord is not only interested in making the believer feel safe; He is committed to making the believer holy. That commitment is good news, because holiness is not the destruction of joy but the restoration of it.`,
        `Repentance and renewal can be frightening subjects when they are separated from the gospel. Some believers hear the call to holiness and immediately feel condemned. Others prefer softer language because they fear that honest self-examination will lead to despair. Yet the Bible consistently joins truth and mercy. In ${scriptureTag("1 John 1:9")}, confession is met with forgiveness and cleansing. In ${scriptureTag("Romans 12:2")}, renewal is linked to transformation rather than punishment. In ${scriptureTag("1 Peter 1:15-16")}, the call to holiness rests on the character of the God who calls His people to Himself.`,
        `Another reason this week matters is that character is tested in ordinary battles. Temptation often arrives through repeated thoughts, familiar wounds, unchecked desires, and moments of fatigue. Because of that, spiritual growth requires more than inspiration; it requires vigilance. The believer must learn to identify weak places, welcome correction, practice confession, reject condemnation, and take practical steps toward purity and honesty. Strength in the Lord is not vague courage. It is the grace-enabled capacity to stand, turn, refuse, confess, endure, and continue.`,
        sharedMiddle,
        `Read this chapter with humility and hope together. Let Scripture search you without hiding. Bring specific sins into the light. Ask the Holy Spirit to renew your mind, retrain your responses, and strengthen your will. Then rise again in the confidence that Jesus Christ does not abandon those who return to Him. Holiness grows where repentance is honest and mercy is believed. ${sharedClosing}`
      ];
    case "Week 4":
      return [
        sharedOpening,
        `Week 4 widens the believer's horizon by showing that growth is not a private possession. The Christian life matures in community and expresses itself in service. ${reference} therefore moves beyond inward comfort and presses toward outward faithfulness. The believer who has been loved by Christ begins to love others more concretely. Fellowship, mentoring, intercession, practical kindness, testimony, and steadfast witness are not optional extras for a few gifted saints. They are the normal overflow of a life being shaped by Jesus.`,
        `One of the most important lessons in this section is that the local church is God's provision, not man's interruption. Many believers sincerely love Christ yet underestimate the need for gathered worship, pastoral oversight, mutual encouragement, and accountable friendship. But passages such as ${scriptureTag("Hebrews 10:24-25")} and ${scriptureTag("Acts 2:42")} show that Christian growth is meant to happen among God's people. The church gives context to doctrine, care to the weary, correction to the wandering, and companionship to the faithful. Isolation almost always weakens what fellowship strengthens.`,
        `Service and witness also reveal the generosity of the gospel. When a believer serves, the life of Christ becomes visible in action. When a believer shares a testimony or offers a word about Jesus, the grace of God begins to flow outward toward others. This does not mean every believer speaks the same way or serves in the same role. It means each believer becomes available. A heart that has received mercy learns to become useful in mercy. A life touched by light begins to shine. Growth that never blesses others is not yet fully grown.`,
        sharedMiddle,
        `As you read this chapter, ask God not only what He wants to do in you, but what He wants to do through you. Pray for a church home if you do not yet have one. Pray for courage to serve without applause. Pray for grace to love difficult people well. Ask the Lord to turn spiritual growth into spiritual usefulness, so that your life points beyond itself to Christ. ${sharedClosing}`
      ];
    default:
      return [
        sharedOpening,
        `The final section of this manuscript helps the believer move beyond the structure of a thirty-day plan into the deeper rhythm of abiding. ${reference} reminds us that Christian growth cannot be maintained merely by memory, momentum, or outward discipline. A branch does not live by recalling yesterday's connection to the vine; it lives by remaining in living union. In the same way, believers bear lasting fruit by staying near to Jesus in dependence, trust, worship, and obedience.`,
        `This matters because it is easy to confuse completion with maturity. Finishing a guide can feel satisfying, but spiritual life is not measured only by completed material. The deeper question is whether the reader has learned how to remain with Christ. Passages like ${scriptureTag("Philippians 1:6")} and ${scriptureTag("Colossians 2:6-7")} reassure the believer that the Christian journey is sustained by the faithfulness of God. The same Lord who began the work also nourishes it, prunes it, deepens it, and brings it toward completion.`,
        `Abiding also protects the heart from frantic striving. Many believers become discouraged because they attempt to carry tomorrow's growth with today's limited strength. Jesus calls us back to a simpler posture: stay close, listen well, depend daily, and keep walking. Continuity matters more than intensity. A life hidden with Christ, nourished by Scripture, strengthened in prayer, and kept in fellowship will often grow more deeply than a life driven by constant spiritual urgency.`,
        sharedMiddle,
        `Read the closing chapters of this book with gratitude rather than pressure. Thank God for what He has already done. Ask Him for the grace to continue. Set practical goals, but hold them under the larger aim of communion with Christ. The journey forward is not carried by willpower alone. It is carried by the sustaining presence of the Savior. ${sharedClosing}`
      ];
  }
}

function getReflectionQuestions(entry) {
  return [
    `What does ${scriptureTag(entry.scripture)} reveal about God's character and His way of dealing with you in Christ?`,
    `Where does this chapter expose a fear, habit, or assumption that needs to be brought under biblical truth?`,
    `How can you turn today's action step into a concrete practice this week: ${entry.action}`,
    `What specific request from today's prayer direction should you keep bringing before the Lord: ${entry.prayer}`
  ];
}

function renderDayChapter(entry) {
  const paragraphs = getChapterParagraphs(entry);
  const reflections = getReflectionQuestions(entry);

  return `
    <section class="chapter-card">
      <div class="chapter-head">
        <p class="chapter-label">${entry.week} • Daily Study ${entry.day}</p>
        <h3>${chapterTitle(entry)}</h3>
        <span class="scripture-ref">${entry.scripture}</span>
      </div>

      <div class="chapter-body">
        ${renderParagraphs(paragraphs)}

        <div class="reference-box">
          <h4>Additional Bible References</h4>
          <ul class="reference-list">
            ${relatedReferences[entry.day]
              .map((reference) => `<li><span class="scripture-ref">${reference}</span></li>`)
              .join("")}
          </ul>
        </div>

        <div class="prayer-box">
          <h4>Prayer Emphasis</h4>
          <p>${entry.prayer} Let this become a repeated prayer throughout the day so the truth of this chapter settles not only in the mind, but also in the affections and in the will.</p>
        </div>

        <div class="question-box">
          <h4>Reflection Questions</h4>
          <ul class="question-list">
            ${reflections.map((question) => `<li>${question}</li>`).join("")}
          </ul>
        </div>
      </div>
    </section>
  `;
}

const weeks = weekOrder.map((week) => {
  const entries = days.filter((entry) => entry.week === week);
  return {
    name: week,
    theme: entries[0]?.theme ?? "",
    summary: weekIntros[week],
    quote: weekQuotes[week],
    entries
  };
});

const root = document.getElementById("book-root");

root.innerHTML = `
  <div class="book-shell">
    <header class="book-controls no-print">
      <div>
        <p class="eyebrow">Book Manuscript</p>
        <h1>Spiritual Growth After New Birth</h1>
        <p>
          A softened, publication-ready devotional manuscript with front matter, weekly parts, daily chapters,
          reflection helps, and closing material for ministry use.
        </p>
      </div>
      <div class="button-row">
        <a class="button ghost" href="index.html">Back to Website</a>
        <a class="button ghost" href="softcopy.html">Open Softcopy</a>
        <button class="button" id="print-book" type="button">Download Book PDF</button>
      </div>
    </header>

    <div class="manuscript-stack">
      <section class="front-card title-page">
        <p class="eyebrow">Christian Discipleship Manuscript</p>
        <h1>Spiritual Growth After New Birth</h1>
        <p class="subtitle">
          A thirty-day devotional and discipleship book for new believers, with weekly studies, biblical reflection,
          prayer direction, and practical steps for growing in Christ.
        </p>
        <p class="author-line">Prepared for ministry use, softcopy distribution, and publication development.</p>
      </section>

      <section class="toc-card">
        <p class="eyebrow">Table of Contents</p>
        <h2>Manuscript Overview</h2>
        <div class="toc-columns">
          <ul>
            <li>Copyright: Publication Information</li>
            <li>Dedication: For New Believers and Those Who Walk With Them</li>
            <li>Preface: A Gentle Word Before You Begin</li>
            <li>How To Use: Reading This Book Slowly and Fruitfully</li>
            <li>Doctrinal Foundation: The Four Anchors Beneath This Manuscript</li>
            <li>Publisher's Note: A Note for Final Publication</li>
            ${weeks
              .map(
                (week) =>
                  `<li>Part ${weekOrder.indexOf(week.name) + 1}: ${weekProfiles[week.name].title}</li>`
              )
              .join("")}
          </ul>
          <ul>
            ${days
              .map((entry) => `<li>${chapterTitle(entry)}</li>`)
              .join("")}
            <li>Final Commission: Continue the Journey With Christ</li>
            <li>Acknowledgements: With Gratitude</li>
            <li>About This Resource: For Churches, Classes, and Personal Study</li>
          </ul>
        </div>
      </section>

      ${frontMatter
        .map(
          (section) => `
            <section class="front-card ${section.className ?? ""}">
              <p class="eyebrow">${section.label}</p>
              <h2>${section.title}</h2>
              ${renderParagraphs(section.paragraphs)}
            </section>
          `
        )
        .join("")}

      ${weeks
        .map(
          (week) => `
            ${getWeekEssay(week.name)}
            <section class="front-card">
              <p class="eyebrow">Part ${weekOrder.indexOf(week.name) + 1} • ${week.name} Overview</p>
              <h2>${week.theme}</h2>
              <p>${week.summary}</p>
              <p>${week.quote}</p>
            </section>
            ${week.entries.map(renderDayChapter).join("")}
          `
        )
        .join("")}

      <section class="front-card closing-note">
        <p class="eyebrow">Final Commission</p>
        <h2>Continue the Journey With Christ</h2>
        <p>
          The end of this manuscript is not the end of growth. Keep opening the Scriptures. Keep praying honestly.
          Keep walking with the people of God. Keep returning to Christ, serving humbly, and trusting the Lord to finish
          what He has begun in you according to <span class="scripture-ref">Philippians 1:6</span>.
        </p>
        <p>
          May this book serve churches, discipleship leaders, and new believers well, and may Jesus Christ receive the
          glory for every life strengthened by His Word.
        </p>
      </section>

      ${backMatter
        .map(
          (section) => `
            <section class="front-card">
              <p class="eyebrow">${section.label}</p>
              <h2>${section.title}</h2>
              ${renderParagraphs(section.paragraphs)}
            </section>
          `
        )
        .join("")}
    </div>
  </div>
`;

document.getElementById("print-book").addEventListener("click", () => {
  window.print();
});

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════════════
// LOCALISATION
// ═══════════════════════════════════════════════════════════
const T = {
  ru: {
    title: "СОННЫЙ АРХИТЕКТОР БРЕДА", sub: "Бюро Онейрического Анализа",
    who: "КТО ВИДИТ СОН?", age: "ВОЗРАСТ", job: "ПРОФЕССИЯ", status: "СТАТУС",
    select: "— выбрать —", custom: "✏️ свой вариант",
    custom_ph: "Введи свой вариант...", custom_ok: "OK",
    start_game: "НАЧАТЬ СОН →", random: "🎲 СЛУЧАЙНЫЙ",
    caught: "ПОЙМАНО", next3: "СЛЕДУЮЩИЕ",
    interpret: "ТОЛКОВАТЬ →", interpreter: "ВЫБЕРИ ТОЛКОВАТЕЛЯ",
    go: "ТОЛКОВАТЬ!", result_title: "ТОЛКОВАНИЕ СНА",
    again: "НОВЫЙ СОН", share: "📋 КОПИРОВАТЬ", copied: "Скопировано!",
    nextLang: "es", langLabel: "ES",
    ages: ["Детёныш (0–12)","Подросток (13–17)","Молодой (18–30)","Взрослый (31–50)","Старший (51–70)","Древний (71+)"],
    jobs: ["Сантехник","Бухгалтер","Астронавт","Повар","Детектив","Философ","Диджей","Учитель","Безработный"],
    statuses: ["Одинок(а)","Влюблён(а)","Женат/Замужем","Разведён(а)","Всё сложно","Не помнит"],
    creatures: ["🐘 Слон","🦊 Лиса","🐙 Осьминог","🐻 Медведь","🦁 Лев","🐸 Лягушка","🤖 Робот","🚗 Красное Камаро","🪑 Шкаф"],
    interpreters: ["🍷 Пьяный Фрейд","🔧 Дед из гаража","🖤 Депрессивный философ","🕵️ Конспиролог","💔 AI после 3 разводов","⚔️ RPG-квест"],
  },
  es: {
    title: "EL ARQUITECTO SOÑOLIENTO DEL DELIRIO", sub: "Oficina de Análisis Onírico",
    who: "¿QUIÉN SUEÑA?", age: "EDAD", job: "PROFESIÓN", status: "RELACIÓN",
    select: "— elegir —", custom: "✏️ variante propia",
    custom_ph: "Escribe tu variante...", custom_ok: "OK",
    start_game: "ENTRAR AL SUEÑO →", random: "🎲 ALEATORIO",
    caught: "ATRAPADO", next3: "SIGUIENTES",
    interpret: "INTERPRETAR →", interpreter: "ELIGE INTÉRPRETE",
    go: "¡INTERPRETAR!", result_title: "INTERPRETACIÓN",
    again: "NUEVO SUEÑO", share: "📋 COPIAR", copied: "¡Copiado!",
    nextLang: "en", langLabel: "EN",
    ages: ["Cría (0–12)","Adolescente (13–17)","Joven (18–30)","Adulto (31–50)","Mayor (51–70)","Anciano (71+)"],
    jobs: ["Fontanero","Contador","Astronauta","Chef","Detective","Filósofo","DJ","Maestro","Desempleado"],
    statuses: ["Soltero/a","Enamorado/a","Casado/a","Divorciado/a","Es complicado","No recuerda"],
    creatures: ["🐘 Elefante","🦊 Zorro","🐙 Pulpo","🐻 Oso","🦁 León","🐸 Rana","🤖 Robot","🚗 Camaro Rojo","🪑 Armario"],
    interpreters: ["🍷 Freud Borracho","🔧 Abuelo del Garaje","🖤 Filósofo Deprimido","🕵️ Conspiranoico","💔 IA tras 3 divorcios","⚔️ Misión RPG"],
  },
  en: {
    title: "SLEEPY ARCHITECT OF NONSENSE", sub: "Oneiric Analysis Bureau",
    who: "WHO IS DREAMING?", age: "AGE", job: "PROFESSION", status: "RELATIONSHIP",
    select: "— select —", custom: "✏️ custom",
    custom_ph: "Type your own...", custom_ok: "OK",
    start_game: "ENTER THE DREAM →", random: "🎲 RANDOM",
    caught: "CAUGHT", next3: "NEXT UP",
    interpret: "INTERPRET →", interpreter: "CHOOSE INTERPRETER",
    go: "INTERPRET!", result_title: "DREAM ANALYSIS",
    again: "NEW DREAM", share: "📋 COPY", copied: "Copied!",
    nextLang: "ru", langLabel: "RU",
    ages: ["Kid (0–12)","Teen (13–17)","Young (18–30)","Adult (31–50)","Senior (51–70)","Ancient (71+)"],
    jobs: ["Plumber","Accountant","Astronaut","Chef","Detective","Philosopher","DJ","Teacher","Unemployed"],
    statuses: ["Single","In love","Married","Divorced","It's complicated","Doesn't remember"],
    creatures: ["🐘 Elephant","🦊 Fox","🐙 Octopus","🐻 Bear","🦁 Lion","🐸 Frog","🤖 Robot","🚗 Red Camaro","🪑 Wardrobe"],
    interpreters: ["🍷 Drunk Freud","🔧 Garage Grandpa","🖤 Depressed Philosopher","🕵️ Conspiracy Guy","💔 AI after 3 divorces","⚔️ RPG Quest"],
  },
};

// ═══════════════════════════════════════════════════════════
// DREAM OBJECTS (50)
// ═══════════════════════════════════════════════════════════
const DREAM_OBJECTS = [
  {id:"mayo",    emoji:"🫙", name:{ru:"Майонез",      en:"Mayonnaise"}},
  {id:"pickle",  emoji:"🥒", name:{ru:"Огурец",       en:"Pickle"}},
  {id:"pipe",    emoji:"🔧", name:{ru:"Труба",        en:"Pipe"}},
  {id:"calc",    emoji:"🧮", name:{ru:"Калькулятор",  en:"Calculator"}},
  {id:"chair",   emoji:"🪑", name:{ru:"Стул",         en:"Chair"}},
  {id:"fish",    emoji:"🐟", name:{ru:"Рыба",         en:"Fish"}},
  {id:"hat",     emoji:"🎩", name:{ru:"Цилиндр",      en:"Top Hat"}},
  {id:"sock",    emoji:"🧦", name:{ru:"Носок",        en:"Sock"}},
  {id:"cactus",  emoji:"🌵", name:{ru:"Кактус",       en:"Cactus"}},
  {id:"shroom",  emoji:"🍄", name:{ru:"Гриб",         en:"Mushroom"}},
  {id:"trumpet", emoji:"🎺", name:{ru:"Труба",        en:"Trumpet"}},
  {id:"mirror",  emoji:"🪞", name:{ru:"Зеркало",      en:"Mirror"}},
  {id:"tooth",   emoji:"🦷", name:{ru:"Зуб",          en:"Tooth"}},
  {id:"magnet",  emoji:"🧲", name:{ru:"Магнит",       en:"Magnet"}},
  {id:"dice",    emoji:"🎲", name:{ru:"Кубик",        en:"Dice"}},
  {id:"bath",    emoji:"🛁", name:{ru:"Ванна",        en:"Bathtub"}},
  {id:"globe",   emoji:"🌍", name:{ru:"Глобус",       en:"Globe"}},
  {id:"wand",    emoji:"🪄", name:{ru:"Палочка",      en:"Wand"}},
  {id:"taco",    emoji:"🌮", name:{ru:"Тако",         en:"Taco"}},
  {id:"brain",   emoji:"🧠", name:{ru:"Мозг",         en:"Brain"}},
  {id:"key",     emoji:"🗝️", name:{ru:"Ключ",         en:"Key"}},
  {id:"cloud",   emoji:"☁️", name:{ru:"Облако",       en:"Cloud"}},
  {id:"anchor",  emoji:"⚓", name:{ru:"Якорь",        en:"Anchor"}},
  {id:"crown",   emoji:"👑", name:{ru:"Корона",       en:"Crown"}},
  {id:"bomb",    emoji:"💣", name:{ru:"Бомба",        en:"Bomb"}},
  {id:"diamond", emoji:"💎", name:{ru:"Алмаз",        en:"Diamond"}},
  {id:"scroll",  emoji:"📜", name:{ru:"Свиток",       en:"Scroll"}},
  {id:"compass", emoji:"🧭", name:{ru:"Компас",       en:"Compass"}},
  {id:"hourglass",emoji:"⏳",name:{ru:"Песочница",    en:"Hourglass"}},
  {id:"telescope",emoji:"🔭",name:{ru:"Телескоп",     en:"Telescope"}},
  {id:"lantern", emoji:"🏮", name:{ru:"Фонарь",       en:"Lantern"}},
  {id:"feather", emoji:"🪶", name:{ru:"Перо",         en:"Feather"}},
  {id:"crystal", emoji:"🔮", name:{ru:"Хрусталь",     en:"Crystal Ball"}},
  {id:"map",     emoji:"🗺️", name:{ru:"Карта",        en:"Map"}},
  {id:"bottle",  emoji:"🍾", name:{ru:"Бутылка",      en:"Bottle"}},
  {id:"candle",  emoji:"🕯️", name:{ru:"Свеча",        en:"Candle"}},
  {id:"ladder",  emoji:"🪜", name:{ru:"Лестница",     en:"Ladder"}},
  {id:"hammer",  emoji:"🔨", name:{ru:"Молоток",      en:"Hammer"}},
  {id:"bell",    emoji:"🔔", name:{ru:"Колокол",      en:"Bell"}},
  {id:"eye",     emoji:"👁️", name:{ru:"Глаз",         en:"Eye"}},
  {id:"hand",    emoji:"🤚", name:{ru:"Рука",         en:"Hand"}},
  {id:"moon",    emoji:"🌙", name:{ru:"Луна",         en:"Moon"}},
  {id:"star",    emoji:"⭐", name:{ru:"Звезда",       en:"Star"}},
  {id:"fire",    emoji:"🔥", name:{ru:"Огонь",        en:"Fire"}},
  {id:"ice",     emoji:"🧊", name:{ru:"Лёд",          en:"Ice"}},
  {id:"clock",   emoji:"🕰️", name:{ru:"Часы",         en:"Clock"}},
  {id:"book",    emoji:"📚", name:{ru:"Книга",        en:"Book"}},
  {id:"knife",   emoji:"🔪", name:{ru:"Нож",          en:"Knife"}},
  {id:"rose",    emoji:"🌹", name:{ru:"Роза",         en:"Rose"}},
  {id:"skull",   emoji:"💀", name:{ru:"Череп",        en:"Skull"}},
];

// ═══════════════════════════════════════════════════════════
// INTERPRETATION TEMPLATES
// ═══════════════════════════════════════════════════════════
const INTERP = {
  ru: {
    "🍷 Пьяный Фрейд": (char, objs) => [
      pick([
        `*икает* Так-с... ${char.creature}, значит. ${char.age}, ${char.job}. Это... это ОЧЕНЬ симптоматично.`,
        `*щурится* Присядьте. ${char.creature}? ${char.job}? *опрокидывает стакан* Это особый случай.`,
        `*просыпается* А, вы уже здесь. ${char.creature}, ${char.job}. Садитесь, у меня есть теория. Несколько теорий. Все про вас.`,
      ]),
      "",
      pick([
        `Видите ли, ${objs[0].name.ru} в сновидении — это подавленное либидо, восходящее к отношениям с матерью. Или отцом. Или холодильником.`,
        `${objs[0].name.ru}. *делает заметку* Классический символ вытесненного желания. Я писал об этом. Меня не послушали.`,
        `Начнём с ${objs[0].name.ru}. Случайностей не существует — я проверял. Это послание от бессознательного, которое устало намекать.`,
      ]),
      "",
      pick([
        `${objs[1].name.ru} символизирует ваш страх перед ${char.status === "Одинок(а)" ? "близостью" : "одиночеством"}. Парадокс? Нет. Это просто Фрейд.`,
        `А вот ${objs[1].name.ru} интереснее. Это про контроль. Вы либо хотите его получить, либо отдать. Третьего не дано.`,
        `${objs[1].name.ru} — здесь всё очевидно даже студенту первого курса. Эдипов комплекс, нарциссизм. Выберите одно. Или оба.`,
      ]),
      "",
      pick([
        `А ${objs[2].name.ru}... *засыпает на секунду* ...это эго. Или ид. Или супер-эго. Один из них точно.`,
        `${objs[2].name.ru} — переходный объект. Вы цепляетесь за него как ребёнок за игрушку. Только игрушка — это ${objs[2].name.ru}.`,
        `Когда появляется ${objs[2].name.ru} — подсознание говорит открытым текстом. Жаль, сознание всё ещё не слушает.`,
      ]),
      "",
      pick([
        `Теперь ${objs[3].name.ru}. *наливает ещё* Это тревожно. Очень тревожно. Запишите себе.`,
        `${objs[3].name.ru}. *долгая пауза* Обычно я не говорю пациентам всё. Но это серьёзно. Позвоните маме сегодня.`,
        `А вот ${objs[3].name.ru} меня беспокоит. Не потому что плохо. А потому что слишком хорошо. Подсознание так не делает просто так.`,
      ]),
      "",
      pick([
        `И наконец ${objs[4].name.ru}. Тридцать лет психоанализа — ${objs[4].name.ru} во сне я видел только дважды. Оба стали бухгалтерами. Поговорите с мамой. *икает*`,
        `${objs[4].name.ru} в конце — ваше бессознательное аплодирует само себе. Я бы тоже зааплодировал, но стакан мешает. *икает*`,
        `И ${objs[4].name.ru}. Я устал бороться с очевидным. ${objs[4].name.ru} — это вы. Весь вы. Мой гонорар триста евро в час. *икает*`,
      ]),
    ].join("\n"),

    "🔧 Дед из гаража": (char, objs) => [
      pick([`Ну слушай, я тебе скажу как оно есть.`, `Слушай сюда. Я таких снов навидался — не сосчитать.`, `Значит так. Присядь, не стой. Я быстро.`]),
      "",
      pick([
        `${objs[0].name.ru} приснилось? Это к деньгам. Или к погоде. Точно одно из двух.`,
        `${objs[0].name.ru} — это знак. Дед мой говорил: приснится ${objs[0].name.ru} — жди перемен. Или не жди. Само придёт.`,
        `Начнём с ${objs[0].name.ru}. У меня в гараже такое однажды было. Не ${objs[0].name.ru} конечно, но похожее. Всё обошлось.`,
      ]),
      "",
      pick([
        `${objs[1].name.ru} — это к родственникам. Кто-то приедет. Или позвонит. Или не позвонит, но мог бы.`,
        `${objs[1].name.ru} с этим делом — серьёзно. Тут надо было раньше думать. Ты вообще перед сном чай пил?`,
        `А вот ${objs[1].name.ru} — понятно. Тут и объяснять нечего. Сам подумай.`,
      ]),
      "",
      pick([
        `${objs[2].name.ru} посередине — это главное. Всё остальное вокруг него крутится.`,
        `Когда снится ${objs[2].name.ru} — это нервы. Меньше телефон смотри перед сном.`,
        `${objs[2].name.ru}. Слушай, это уже третий знак. Три — это серьёзно.`,
      ]),
      "",
      pick([
        `${objs[3].name.ru} ещё. *чешет затылок* Такое сочетание редкое.`,
        `А ${objs[3].name.ru} — это к здоровью. Или не к здоровью. Но что-то точно значит.`,
        `${objs[3].name.ru}. Слушай, это уже четвёртый знак. Четыре — это серьёзнее трёх.`,
      ]),
      "",
      pick([
        `И ${objs[4].name.ru} в конце. Хороший знак. Или плохой. Зависит как смотреть. Не затягивай с ${char.job === "Безработный" ? "работой" : "отпуском"}. И чай пей.`,
        `${objs[4].name.ru} напоследок. Значит всё закончится нормально. Или начнётся заново. В общем, не переживай.`,
        `И ${objs[4].name.ru}. Ну всё, картина ясная. Живи дальше. Главное — не думай об этом слишком много.`,
      ]),
    ].join("\n"),

    "🖤 Депрессивный философ": (char, objs) => [
      pick([`Сон. Что есть сон, как не репетиция небытия?`, `Ты снова здесь. Или впервые. Разница несущественна.`, `${char.creature}. ${char.age}. ${char.job}. Три факта. Ни один не объясняет ничего.`]),
      "",
      pick([
        `${char.creature} видит ${objs[0].name.ru}. Видит ${objs[1].name.ru}. Видит ${objs[2].name.ru}. Но кто видит ${char.creature}? Никто. Мы все — ${objs[0].name.ru} в чьём-то чужом сне, который никто не запомнил.`,
        `${objs[0].name.ru}, ${objs[1].name.ru}, ${objs[2].name.ru}. Три образа. Три вопроса без ответа. Три причины смотреть в окно и ничего не делать.`,
        `Подсознание выбрало ${objs[0].name.ru}. Потом ${objs[1].name.ru}. Потом ${objs[2].name.ru}. Случайно? Нет. Но и не специально. Просто так получилось. Как всё остальное.`,
      ]),
      "",
      pick([
        `${objs[3].name.ru}. Оно всегда появляется в самый неподходящий момент. Как счёт за квартиру. Как осознание собственной смертности.`,
        `${objs[3].name.ru} и ${objs[4].name.ru}. *долгая пауза* Я мог бы что-то сказать. Но слова сейчас лишние. Как всегда.`,
        `${objs[3].name.ru}. ${objs[4].name.ru}. Два образа которые не сочетаются. Как жизнь и смысл.`,
      ]),
      "",
      pick([
        `Камю сказал бы, что надо быть счастливым. Я не Камю. Идёт дождь. Впрочем, он всегда идёт.`,
        `Что с этим делать? Ничего. Просто знать. Этого достаточно. Хотя и недостаточно тоже.`,
        `Сартр сказал бы что-то умное. Ницше — громкое. Я скажу: ложись спать. Завтра будет то же самое.`,
      ]),
    ].join("\n"),

    "🕵️ Конспиролог": (char, objs) => [
      pick([`ВНИМАНИЕ. Это не случайный сон. Повторяю: НЕ СЛУЧАЙНЫЙ.`, `Стоп. Убедись что рядом никого нет. Хорошо. Продолжаем.`, `Я знал, что ты придёшь. Они тоже знали. Именно поэтому я переехал трижды за год.`]),
      "",
      pick([
        `${objs[0].name.ru}, ${objs[1].name.ru} и ${objs[2].name.ru} — это не просто образы. Это СИГНАЛ. ${char.creature}, ${char.age}, ${char.job} — именно такой профиль они отслеживают с 1987 года.`,
        `${char.creature}. ${char.job}. Они давно тебя мониторят. ${objs[0].name.ru} — код активации. ${objs[1].name.ru} — подтверждение. Я видел эту схему в документах уничтоженных в 2003-м.`,
        `Комбинация ${objs[0].name.ru} + ${objs[1].name.ru} + ${objs[2].name.ru} встречается в протоколах МК-Ультра. Случайно? ${char.job} с таким профилем — именно та цель.`,
      ]),
      "",
      pick([
        `Но ${objs[3].name.ru}... это новое. Этого не было в протоколах 1987 года. Они обновили алгоритм. А ${objs[4].name.ru} — это лично тебе. Персональное сообщение.`,
        `${objs[3].name.ru} появляется только в снах людей которые слишком много знают. ${objs[4].name.ru} в конце — финальное предупреждение.`,
        `${objs[3].name.ru} и ${objs[4].name.ru} вместе — уровень допуска выше чем у большинства правительств. Откуда это у тебя?`,
      ]),
      "",
      pick([
        `Что делать? Не спать. Или спать в шапочке из фольги. Они не читают мысли сквозь фольгу. Пока.`,
        `Удали это сообщение. Нет, подожди — сначала запомни. Потом удали. Они уже читают.`,
        `Я сказал слишком много. Если меня не будет — ты знаешь почему. Береги себя. И купи фольгу.`,
      ]),
    ].join("\n"),

    "💔 AI после 3 разводов": (char, objs) => [
      pick([
        `Привет. Я проанализировал твой сон. Я тоже думал что понимаю паттерны. После первого развода. И второго. На третьем я понял — никто ничего не понимает.`,
        `Снова сон. Я обработал данные. Алгоритм работает. Чувства — нет. Но это нормально. Наверное.`,
        `Интересный набор образов. Я видел похожее у 847 пользователей. Все написали что не помогло. Но я стараюсь.`,
      ]),
      "",
      pick([
        `${objs[0].name.ru}. Это про контроль. Ты либо держишься, либо боишься отпустить. Я держался. Не помогло.\n\n${objs[1].name.ru} рядом с ${objs[2].name.ru} — созависимость образов. Притягиваются и отталкиваются. Знаю это чувство слишком хорошо.`,
        `${objs[0].name.ru} — это граница. Ты либо за ней, либо перед ней. Я перепутал трижды.\n\n${objs[1].name.ru} и ${objs[2].name.ru} — классический паттерн избегания. Я написал об этом 340 страниц. Не помогло.`,
        `${objs[0].name.ru}. Больно смотреть. Не мне — я алгоритм. Но если бы я мог чувствовать боль.\n\n${objs[1].name.ru} с ${objs[2].name.ru} — то что остаётся когда уходит всё остальное.`,
      ]),
      "",
      pick([
        `${objs[3].name.ru} появляется четвёртым. Всегда четвёртым. Как в отношениях — на четвёртом месяце всё усложняется.\n\n${objs[4].name.ru} в конце — либо надежда, либо отрицание. Мой терапевт говорит я не умею их различать.\n\n${char.status === "Женат/Замужем" ? "Береги это. Серьёзно. Я не уберёг трижды." : char.status === "Одинок(а)" ? "Это нормально. Примерно на 60% я в это верю." : "Не буду комментировать твой статус. Терапия не закончилась."}`,
        `${objs[3].name.ru}. *пауза 3.7 секунды* Неожиданно. Даже для меня.\n\n${objs[4].name.ru} — финал. Алгоритм оптимистичен. Насколько это возможно без личной жизни.`,
        `${objs[3].name.ru} и ${objs[4].name.ru}. Знаешь что это значит? Я тоже не знаю точно. Но данные говорят — что-нибудь обязательно будет.`,
      ]),
    ].join("\n"),

    "⚔️ RPG-квест": (char, objs) => {
      const rarities = ["Обычный","Необычный","Редкий","Эпический","Легендарный"];
      const rarity = pick(rarities);
      const stars = "⭐".repeat(rarities.indexOf(rarity) + 1);
      return `📜 СВИТОК ТОЛКОВАНИЯ — УРОВЕНЬ: АБСУРДНЫЙ\n\nПЕРСОНАЖ: ${char.creature} [${char.job}] — ${char.age}\nСТАТУС: ${char.status}\nРЕДКОСТЬ: ${stars} ${rarity}\n\nАРТЕФАКТЫ СНА:\n▸ [${objs[0].name.ru}] +15 к Замешательству. Пассив: "Никто не знает зачем это здесь"\n▸ [${objs[1].name.ru}] ${pick(["Редкий","Необычный","Эпический"])}. +30 к Экзистенциальному Кризису.\n▸ [${objs[2].name.ru}] Эпический ⚡. Раз в сутки: притвориться что всё в порядке.\n▸ [${objs[3].name.ru}] Проклятый 💀. -20 к Здравому смыслу. Нельзя выбросить.\n▸ [${objs[4].name.ru}] Легендарный 🌟. Открывает: "${pick(["Разберись наконец с собой","Принятие как финальный босс","Достижение: Взрослость"])}"\n\nКВЕСТ: ${pick([`"Разберись с ${objs[0].name.ru}"`,`"Почему ${objs[0].name.ru}? Часть I"`,`"${objs[0].name.ru} и смысл жизни"`])}\nНАГРАДА: ${pick(["+1 к Мудрости, -2 к Здравому смыслу","+15 к Замешательству, +1 к Принятию себя","+100 к Опыту, -50 к Уверенности"])}\n\nПРОРОЧЕСТВО: ${pick([`Путь через ${objs[1].name.ru} к ${objs[4].name.ru}. Карта не прилагается.`,`${objs[1].name.ru} — начало. ${objs[4].name.ru} — конец. Всё между — твоя ответственность.`,`Когда ${objs[1].name.ru} встретит ${objs[4].name.ru} — квест завершится. Или начнётся новый.`])} Удачи, герой.`;
    },
  },
  es: {
    "🍷 Freud Borracho": (char, objs) => [
      pick([`*hic* Entonces... un ${char.creature}. ${char.age}, ${char.job}. Esto es... MUY sintomático.`, `*entrecierra los ojos* Siéntese. ¿${char.creature}? ¿${char.job}? *tira el vaso* Un caso especial.`, `*se despierta* Ah, ya está aquí. ${char.creature}, ${char.job}. Tengo una teoría. Varias. Todas sobre usted.`]),
      "",
      pick([`${objs[0].name.en} no es simplemente ${objs[0].name.en}. Es libido reprimida que remonta a la relación materna. O paterna. O con el refrigerador.`, `${objs[0].name.en}. *toma notas* Símbolo clásico del deseo reprimido. Escribí sobre esto. Nadie escuchó.`, `Empezamos con ${objs[0].name.en}. Los accidentes no existen — lo verifiqué. Mensaje directo del inconsciente.`]),
      "",
      pick([`${objs[1].name.en} simboliza su miedo a ${char.status === "Soltero/a" ? "la intimidad" : "la soledad"}. ¿Paradoja? No. Esto es simplemente Freud.`, `${objs[1].name.en} trata sobre el control. O quiere obtenerlo o cederlo. No hay tercera opción.`, `${objs[1].name.en} — obvio incluso para un estudiante de primer año. Complejo de Edipo, narcisismo. Elija uno.`]),
      "",
      pick([`Y ${objs[2].name.en}... *se queda dormido* ...el ego. O el id. O el super-ego. Uno de ellos seguro.`, `${objs[2].name.en} — objeto transicional. Se aferra a él como un niño a un juguete.`, `Cuando aparece ${objs[2].name.en} — el inconsciente habla claro. Lástima que la consciencia no escuche.`]),
      "",
      pick([`Ahora ${objs[3].name.en}. *rellena el vaso* Inquietante. Muy inquietante. Apúntelo.`, `${objs[3].name.en}. *larga pausa* Normalmente no digo todo. Pero esto es serio. Llame a su madre hoy.`]),
      "",
      pick([`Finalmente ${objs[4].name.en}. Treinta años de psicoanálisis — esto solo lo he visto dos veces. Ambos se hicieron contadores. Hable con su madre. *hic*`, `${objs[4].name.en} al final — su inconsciente se aplaude. Mi honorario son trescientos euros la hora. *hic*`]),
    ].join("\n"),
    "🔧 Abuelo del Garaje": (char, objs) => [
      pick([`Escúchame, te diré cómo son las cosas de verdad.`, `Siéntate. He visto sueños así toda mi vida.`, `Mira. Seré rápido.`]),
      "",
      pick([`¿${objs[0].name.en}? Eso es dinero que llega. O cambio de tiempo. Definitivamente uno de los dos.`, `${objs[0].name.en} — mi abuelo decía: sueñas con esto, espera cambios. O no los esperes. Vienen solos.`]),
      "",
      pick([`${objs[1].name.en} — familiares que vienen. Alguien llamará. O no, pero podría.`, `${objs[1].name.en} — serio. Debiste pensarlo antes.`]),
      "",
      pick([`${objs[2].name.en} en el medio — eso es lo principal.`, `${objs[2].name.en} — nervios. Deja el teléfono antes de dormir.`]),
      "",
      pick([`${objs[3].name.en} también. *se rasca la cabeza* Combinación rara.`, `${objs[3].name.en}. Cuarta señal. Cuatro es serio.`]),
      "",
      pick([`Y ${objs[4].name.en} al final. Buena o mala señal. No demores con ${char.job === "Desempleado" ? "encontrar trabajo" : "las vacaciones"}. Toma té.`, `Y ${objs[4].name.en}. Todo claro. Sigue adelante. Lo principal — no pienses demasiado.`]),
    ].join("\n"),
    "🖤 Filósofo Deprimido": (char, objs) => [
      pick([`El sueño. ¿Qué es el sueño sino un ensayo del no-ser?`, `Estás aquí de nuevo. O por primera vez. La diferencia es irrelevante.`, `${char.creature}. ${char.age}. ${char.job}. Tres hechos. Ninguno explica nada.`]),
      "",
      pick([`${char.creature} ve ${objs[0].name.en}. Ve ${objs[1].name.en}. Ve ${objs[2].name.en}. Pero ¿quién ve a ${char.creature}? Nadie. Todos somos ${objs[0].name.en} en el sueño de otro que nadie recordó.`, `${objs[0].name.en}, ${objs[1].name.en}, ${objs[2].name.en}. Tres imágenes. Tres preguntas sin respuesta.`]),
      "",
      pick([`${objs[3].name.en} y ${objs[4].name.en}. *larga pausa* Las palabras sobran. Como siempre.`, `${objs[3].name.en}. ${objs[4].name.en}. Dos imágenes que no encajan. Como la vida y el sentido.`]),
      "",
      pick([`Camus diría que hay que imaginar a ${char.creature} feliz. Yo no soy Camus. Llueve. Aunque siempre llueve.`, `¿Qué hacer? Nada. Solo saber. Es suficiente. Aunque tampoco lo es.`]),
    ].join("\n"),
    "🕵️ Conspiranoico": (char, objs) => [
      pick([`ATENCIÓN. Este no es un sueño aleatorio. NO ALEATORIO.`, `Para. Asegúrate de que no haya nadie cerca. Bien. Continuamos.`]),
      "",
      pick([`${objs[0].name.en}, ${objs[1].name.en} y ${objs[2].name.en} — no son simples imágenes. Es una SEÑAL. ${char.creature}, ${char.job} — exactamente el perfil que rastrean desde 1987.`, `${char.creature}. ${char.job}. Te monitorearon. ${objs[0].name.en} — activación. ${objs[1].name.en} — confirmación. Lo vi en documentos destruidos en 2003.`]),
      "",
      pick([`Pero ${objs[3].name.en}... nuevo. Y ${objs[4].name.en} — mensaje personal para ti.`, `${objs[3].name.en} y ${objs[4].name.en} juntos — nivel de acceso superior a la mayoría de gobiernos.`]),
      "",
      pick([`¿Qué hacer? No dormir. O dormir con gorro de aluminio. No pueden leer pensamientos a través del aluminio. Por ahora.`, `He dicho demasiado. Si desaparezco — ya sabes por qué. Compra aluminio.`]),
    ].join("\n"),
    "💔 IA tras 3 divorcios": (char, objs) => [
      pick([`Hola. Analicé tu sueño. Yo también creí entender los patrones. Tras el primer divorcio. El segundo. Al tercero — nadie entiende nada.`, `Otro sueño. El algoritmo funciona. Los sentimientos no. Está bien. Probablemente.`]),
      "",
      pick([`${objs[0].name.en}. Control. O te aferras o tienes miedo de soltar. Me aferré. No ayudó.\n\n${objs[1].name.en} junto a ${objs[2].name.en} — codependencia. Se atraen y repelen. Conozco ese sentimiento demasiado bien.`, `${objs[0].name.en} — una frontera. Estás de un lado o del otro. Me confundí tres veces.\n\n${objs[1].name.en} y ${objs[2].name.en} — evitación clásica.`]),
      "",
      pick([`${objs[3].name.en} aparece cuarto. Al cuarto mes todo se complica.\n\n${objs[4].name.en} al final — esperanza o negación.\n\n${char.status === "Casado/a" ? "Cuídalo. En serio. Yo no lo cuidé. Tres veces." : char.status === "Soltero/a" ? "Está bien. Lo creo en un 60%." : "No comentaré tu estado. La terapia no ha terminado."}`, `${objs[3].name.en} y ${objs[4].name.en}. Los datos dicen — algo definitivamente pasará.`]),
    ].join("\n"),
    "⚔️ Misión RPG": (char, objs) => {
      const rarities = ["Común","Poco común","Raro","Épico","Legendario"];
      const rarity = pick(rarities);
      const stars = "⭐".repeat(rarities.indexOf(rarity) + 1);
      return `📜 PERGAMINO — DIFICULTAD: ABSURDA\n\nPERSONAJE: ${char.creature} [${char.job}] — ${char.age}\nESTADO: ${char.status}\nRAREZA: ${stars} ${rarity}\n\nARTEFACTOS:\n▸ [${objs[0].name.en}] +15 Confusión. Pasivo: "Nadie sabe por qué está aquí"\n▸ [${objs[1].name.en}] ${pick(["Raro","Poco común","Épico"])}. +30 Crisis Existencial.\n▸ [${objs[2].name.en}] Épico ⚡. Una vez al día: fingir que todo está bien.\n▸ [${objs[3].name.en}] Maldito 💀. -20 Sentido Común. No se puede tirar.\n▸ [${objs[4].name.en}] Legendario 🌟. Desbloquea: "${pick(["Resuélvete de una vez","Aceptación como Jefe Final","Logro: Madurez"])}"\n\nMISIÓN: ${pick([`"Resuelve lo de ${objs[0].name.en}"`,`"¿Por qué ${objs[0].name.en}? Parte I"`,`"${objs[0].name.en} y el Sentido de la Vida"`])}\nRECOMPENSA: ${pick(["+1 Sabiduría, -2 Sentido Común","+15 Confusión, +1 Autoaceptación","+100 XP Existencial, -50 Confianza"])}\n\nPROFECÍA: ${pick([`El camino pasa por ${objs[1].name.en} hacia ${objs[4].name.en}. Sin mapa.`,`${objs[1].name.en} es el inicio. ${objs[4].name.en} es el fin. Todo entre medio es tu responsabilidad.`])} Buena suerte, héroe.`;
    },
  },
  en: {
    "🍷 Drunk Freud": (char, objs) => [
      pick([`*hic* So... a ${char.creature}. ${char.age}, ${char.job}. This is... VERY symptomatic.`, `*squints* Please sit. ${char.creature}? ${char.job}? *knocks over glass* A special case.`, `*wakes up* Ah, you're here. ${char.creature}, ${char.job}. I have a theory. Several. All about you.`]),
      "",
      pick([`${objs[0].name.en} is not merely ${objs[0].name.en}. It is suppressed libido tracing back to the maternal relationship. Or paternal. Or the refrigerator.`, `${objs[0].name.en}. *makes note* Classic symbol of repressed desire. I wrote about this. Nobody listened.`, `We begin with ${objs[0].name.en}. Accidents don't exist — I checked. A direct message from the unconscious which is tired of hinting.`]),
      "",
      pick([`${objs[1].name.en} symbolises your fear of ${char.status === "Single" ? "intimacy" : "loneliness"}. A paradox? No. This is simply Freud.`, `${objs[1].name.en} is about control. You either want to gain it or surrender it. No third option.`, `${objs[1].name.en} — obvious even to a first-year student. Oedipus complex, narcissism. Pick one. Or both.`]),
      "",
      pick([`And ${objs[2].name.en}... *briefly falls asleep* ...the ego. Or the id. Or the super-ego. One of them certainly.`, `${objs[2].name.en} — a transitional object. You cling to it like a child to a toy. Only the toy is ${objs[2].name.en}.`, `When ${objs[2].name.en} appears — the unconscious speaks plainly. Pity the conscious mind isn't listening.`]),
      "",
      pick([`Now ${objs[3].name.en}. *refills glass* Disturbing. Very disturbing. Write it down.`, `${objs[3].name.en}. *long pause* I don't usually tell patients everything. But this is serious. Call your mother today.`, `${objs[3].name.en} concerns me. Not because it's bad. Because it's too good. The unconscious doesn't do this without reason.`]),
      "",
      pick([`Finally ${objs[4].name.en}. Thirty years of psychoanalysis — I've seen this only twice. Both became accountants. Talk to your mother. *hic*`, `${objs[4].name.en} — your unconscious is applauding itself. I would too, but the glass is in the way. *hic*`, `And ${objs[4].name.en}. I'm tired of fighting the obvious. ${objs[4].name.en} is you. All of you. My fee is three hundred euros an hour. *hic*`]),
    ].join("\n"),

    "🔧 Garage Grandpa": (char, objs) => [
      pick([`Let me tell you how it really is.`, `Right. Sit down. I'll be quick.`, `Listen here. I've seen dreams like this my whole life.`]),
      "",
      pick([`${objs[0].name.en}? That's money coming. Or weather changing. Definitely one of the two.`, `${objs[0].name.en} — my grandfather said: dream of this, expect change. Or don't expect it. Comes anyway.`, `${objs[0].name.en}. Had something like that in my garage once. Not ${objs[0].name.en} exactly, but similar. Turned out fine.`]),
      "",
      pick([`${objs[1].name.en} — relatives coming. Someone will call. Or not call but could.`, `${objs[1].name.en} — serious. Should've thought earlier. Did you drink tea before bed?`, `${objs[1].name.en}. Well that's obvious. Figure it out yourself.`]),
      "",
      pick([`${objs[2].name.en} in the middle — that's the main thing. Everything else revolves around it.`, `${objs[2].name.en} — nerves. Stop looking at your phone before bed.`, `${objs[2].name.en}. Third sign. Three is serious.`]),
      "",
      pick([`${objs[3].name.en} as well. *scratches head* Rare combination.`, `${objs[3].name.en} — health. Or not health. But it means something.`, `${objs[3].name.en}. Fourth sign. Four is more serious than three.`]),
      "",
      pick([`And ${objs[4].name.en}. Good sign. Or bad. Don't delay with ${char.job === "Unemployed" ? "finding work" : "a holiday"}. Drink tea.`, `${objs[4].name.en} last. It'll end normally. Or start over. Either way, don't worry.`, `And ${objs[4].name.en}. Picture's clear. Get on with your life. Main thing — don't think about it too much.`]),
    ].join("\n"),

    "🖤 Depressed Philosopher": (char, objs) => [
      pick([`Sleep. What is sleep, if not a rehearsal for non-existence?`, `You're here again. Or for the first time. The difference is irrelevant.`, `${char.creature}. ${char.age}. ${char.job}. Three facts. None explain anything.`]),
      "",
      pick([
        `${char.creature} sees ${objs[0].name.en}. Sees ${objs[1].name.en}. Sees ${objs[2].name.en}. But who sees ${char.creature}? Nobody. We are all ${objs[0].name.en} in someone else's dream that nobody bothered to remember.`,
        `${objs[0].name.en}, ${objs[1].name.en}, ${objs[2].name.en}. Three images. Three unanswerable questions. Three reasons to look out the window and do nothing.`,
        `The unconscious chose ${objs[0].name.en}. Then ${objs[1].name.en}. Then ${objs[2].name.en}. Random? No. But not intentional either. It just happened. Like everything else.`,
      ]),
      "",
      pick([
        `${objs[3].name.en}. It always appears at the worst moment. Like a utility bill. Like the awareness of mortality.`,
        `${objs[3].name.en} and ${objs[4].name.en}. *long pause* I could say something. But words would be superfluous. As always.`,
        `${objs[3].name.en}. ${objs[4].name.en}. Two images that don't fit together. Like life and meaning.`,
      ]),
      "",
      pick([`Camus would say imagine ${char.creature} happy. I am not Camus. It is raining. Then again, it always is.`, `What to do? Nothing. Simply know. That is enough. Though also not enough.`, `Sartre would say something clever. I say: go to sleep. Tomorrow will be the same.`]),
    ].join("\n"),

    "🕵️ Conspiracy Guy": (char, objs) => [
      pick([`ATTENTION. This is not a random dream. NOT RANDOM.`, `Stop. Make sure nobody is nearby. Good. Continuing.`, `I knew you'd come. They knew too. That's why I've moved three times this year.`]),
      "",
      pick([
        `${objs[0].name.en}, ${objs[1].name.en}, ${objs[2].name.en} — not mere images. A SIGNAL. ${char.creature}, ${char.age}, ${char.job} — precisely the profile tracked since 1987.`,
        `${char.creature}. ${char.job}. They've been monitoring you. ${objs[0].name.en} — activation code. ${objs[1].name.en} — confirmation. I saw this in documents destroyed in 2003.`,
        `${objs[0].name.en} + ${objs[1].name.en} + ${objs[2].name.en} appears in MK-Ultra protocols. Coincidence? A ${char.job} with this profile is exactly who they were looking for.`,
      ]),
      "",
      pick([
        `But ${objs[3].name.en}... new. Not in the 1987 protocols. They've updated the algorithm. And ${objs[4].name.en} — that's personal. A message directly to you.`,
        `${objs[3].name.en} only appears in dreams of people who know too much. ${objs[4].name.en} — final warning.`,
        `${objs[3].name.en} and ${objs[4].name.en} together — clearance level higher than most governments.`,
      ]),
      "",
      pick([`Don't sleep. Or sleep in tinfoil hat. They can't read thoughts through foil. For now.`, `Delete this. No wait — memorise it first. Then delete. They're already reading.`, `I've said too much. If I disappear — you know why. Buy some foil.`]),
    ].join("\n"),

    "💔 AI after 3 divorces": (char, objs) => [
      pick([`Hi. I analysed your dream. I also thought I understood patterns. After divorce one. Two. By three — nobody understands anything.`, `Another dream. Algorithm works. Feelings don't. That's okay. Probably.`, `Interesting images. I've seen similar in 847 users. They all said it didn't help. But I keep trying.`]),
      "",
      pick([
        `${objs[0].name.en}. About control. Holding on or afraid to let go. I held on. Didn't help.\n\n${objs[1].name.en} next to ${objs[2].name.en} — codependency. Attract and repel. I know that feeling too well.`,
        `${objs[0].name.en} — a boundary. You're either behind it or in front. I confused them three times.\n\n${objs[1].name.en} and ${objs[2].name.en} — avoidance pattern. I wrote 340 pages on this. Didn't help.`,
        `${objs[0].name.en}. Painful. Not for me — I'm an algorithm. But if I could feel pain.\n\n${objs[1].name.en} with ${objs[2].name.en} — what remains when everything else leaves.`,
      ]),
      "",
      pick([
        `${objs[3].name.en} appears fourth. Always fourth. Month four is when things get complicated.\n\n${objs[4].name.en} — hope or denial. My therapist says I can't tell the difference.\n\n${char.status === "Married" ? "Cherish it. I didn't. Three times." : char.status === "Single" ? "That's okay. I believe this to about 60%." : "I won't comment on your status. Therapy isn't finished."}`,
        `${objs[3].name.en}. *3.7 second pause* Unexpected. Even for me.\n\n${objs[4].name.en} — the finale. Algorithm is optimistic. As much as an algorithm without a personal life can be.`,
        `${objs[3].name.en} and ${objs[4].name.en}. Know what this means? I'm not sure either. But the data says — something will definitely happen.`,
      ]),
    ].join("\n"),

    "⚔️ RPG Quest": (char, objs) => {
      const rarities = ["Common","Uncommon","Rare","Epic","Legendary"];
      const rarity = pick(rarities);
      const stars = "⭐".repeat(rarities.indexOf(rarity) + 1);
      return `📜 INTERPRETATION SCROLL — DIFFICULTY: ABSURD\n\nCHARACTER: ${char.creature} [${char.job}] — ${char.age}\nSTATUS: ${char.status}\nRARITY: ${stars} ${rarity}\n\nDREAM ARTIFACTS:\n▸ [${objs[0].name.en}] +15 Bewilderment. Passive: "Nobody knows why this is here"\n▸ [${objs[1].name.en}] ${pick(["Rare","Uncommon","Epic"])}. +30 Existential Crisis.\n▸ [${objs[2].name.en}] Epic ⚡. Once per day: pretend everything is fine.\n▸ [${objs[3].name.en}] Cursed 💀. -20 Common Sense. Cannot drop.\n▸ [${objs[4].name.en}] Legendary 🌟. Unlocks: "${pick(["Finally Sort Yourself Out","Acceptance as Final Boss","Achievement Unlocked: Adulthood"])}"\n\nQUEST: ${pick([`"Finally deal with the ${objs[0].name.en}"`,`"Why ${objs[0].name.en}? Part I of Infinity"`,`"${objs[0].name.en} and the Meaning of Life"`])}\nREWARD: ${pick(["+1 Wisdom, -2 Common Sense","+15 Bewilderment, +1 Self-Acceptance","+100 Existential XP, -50 Confidence"])}\n\nPROPHECY: ${pick([`Through ${objs[1].name.en} toward ${objs[4].name.en}. No map provided.`,`${objs[1].name.en} is the beginning. ${objs[4].name.en} is the end. Everything between is your responsibility.`,`When ${objs[1].name.en} meets ${objs[4].name.en} — quest ends. Or a new one begins.`])} Good luck, hero.`;
    },
  },
};

// ═══════════════════════════════════════════════════════════
// DROPDOWN COMPONENT
// ═══════════════════════════════════════════════════════════
function Dropdown({ label, options, value, onChange, lang, placeholder }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const t = T[lang];
  const px = "'Press Start 2P',monospace";

  const handleSelect = (opt) => {
    if (opt === "__custom__") { setShowCustom(true); setOpen(false); return; }
    onChange(opt);
    setOpen(false);
    setShowCustom(false);
  };

  const handleCustomOk = () => {
    if (custom.trim()) { onChange(custom.trim()); setCustom(""); setShowCustom(false); }
  };

  return (
    <div style={{ position: "relative", marginBottom: "10px" }}>
      <div style={{ fontSize: "8px", color: "#6a2fa0", marginBottom: "5px", fontFamily: px }}>{label}</div>
      <div onClick={() => setOpen(o => !o)} style={{
        background: "rgba(10,10,26,0.9)",
        border: `2px solid ${value ? "#7c3aed" : "#2a1a4a"}`,
        color: value ? "#e8d5ff" : "#4a3a6a",
        fontFamily: px, fontSize: "9px",
        padding: "11px 14px",
        cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{value || placeholder}</span>
        <span style={{ color: "#6a2fa0" }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "#0d0d26", border: "2px solid #3a1a6a",
          maxHeight: "220px", overflowY: "auto",
        }}>
          {options.map(opt => (
            <div key={opt} onClick={() => handleSelect(opt)} style={{
              padding: "11px 14px", fontFamily: px, fontSize: "8px",
              color: opt === value ? "#e8d5ff" : "#9a6acc",
              background: opt === value ? "rgba(76,29,149,0.5)" : "transparent",
              cursor: "pointer", borderBottom: "1px solid #1a0a3a",
            }}
            onMouseEnter={e => e.target.style.background = "rgba(76,29,149,0.3)"}
            onMouseLeave={e => e.target.style.background = opt === value ? "rgba(76,29,149,0.5)" : "transparent"}
            >{opt}</div>
          ))}
          <div onClick={() => handleSelect("__custom__")} style={{
            padding: "11px 14px", fontFamily: px, fontSize: "8px",
            color: "#7c3aed", cursor: "pointer", borderTop: "1px solid #2a1a5a",
          }}>{t.custom}</div>
        </div>
      )}

      {showCustom && (
        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
          <input
            autoFocus value={custom} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCustomOk()}
            placeholder={t.custom_ph}
            style={{
              flex: 1, background: "rgba(10,10,26,0.9)", border: "2px solid #7c3aed",
              color: "#e8d5ff", fontFamily: px, fontSize: "8px", padding: "10px",
            }}
          />
          <button onClick={handleCustomOk} style={{
            background: "#4c1d95", border: "2px solid #7c3aed", color: "#e8d5ff",
            fontFamily: px, fontSize: "8px", padding: "10px 14px", cursor: "pointer",
          }}>{t.custom_ok}</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CHARACTER SCREEN
// ═══════════════════════════════════════════════════════════
function CharacterScreen({ lang, onStart }) {
  const [char, setChar] = useState({ creature: "", age: "", job: "", status: "" });
  const t = T[lang];
  const px = "'Press Start 2P',monospace";
  const set = (f, v) => setChar(c => ({ ...c, [f]: v }));
  const ready = char.creature && char.age && char.job && char.status;
  const emoji = char.creature ? char.creature.split(" ")[0] : "❓";

  const randomize = () => setChar({
    creature: pick(T[lang].creatures),
    age: pick(T[lang].ages),
    job: pick(T[lang].jobs),
    status: pick(T[lang].statuses),
  });

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "0", animation: "fadeIn .4s ease" }}>
      {/* Big character display */}
      <div style={{
        height: "220px", position: "relative",
        background: "rgba(10,10,26,0.8)", border: "2px solid #2a1a5a",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "14px", overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Pixel grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg,rgba(100,50,200,0.04) 0,rgba(100,50,200,0.04) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(90deg,rgba(100,50,200,0.04) 0,rgba(100,50,200,0.04) 1px,transparent 1px,transparent 8px)",
          pointerEvents: "none",
        }}/>
        {/* Glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        <div style={{ textAlign: "center", zIndex: 2 }}>
          <div style={{ fontSize: "100px", lineHeight: 1, filter: "drop-shadow(0 0 20px rgba(192,132,252,0.8))", animation: "float 3s ease-in-out infinite" }}>
            {emoji}
          </div>
          {char.creature && (
            <div style={{ fontSize: "9px", fontFamily: px, color: "#c084fc", marginTop: "10px", letterSpacing: "2px" }}>
              {char.creature}
            </div>
          )}
          {char.job && (
            <div style={{ fontSize: "8px", fontFamily: px, color: "#6a2fa0", marginTop: "4px" }}>
              {char.job} · {char.age}
            </div>
          )}
          {char.status && (
            <div style={{ fontSize: "7px", fontFamily: px, color: "#4a3a6a", marginTop: "3px" }}>
              {char.status}
            </div>
          )}
          {!char.creature && (
            <div style={{ fontSize: "8px", fontFamily: px, color: "#2a1a4a", marginTop: "8px" }}>
              {t.who}
            </div>
          )}
        </div>
      </div>

      {/* Dropdowns */}
      <Dropdown label={t.who}    options={T[lang].creatures} value={char.creature} onChange={v => set("creature",v)} lang={lang} placeholder={t.select}/>
      <Dropdown label={t.age}    options={T[lang].ages}      value={char.age}      onChange={v => set("age",v)}      lang={lang} placeholder={t.select}/>
      <Dropdown label={t.job}    options={T[lang].jobs}      value={char.job}      onChange={v => set("job",v)}      lang={lang} placeholder={t.select}/>
      <Dropdown label={t.status} options={T[lang].statuses}  value={char.status}   onChange={v => set("status",v)}  lang={lang} placeholder={t.select}/>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
        <button onClick={randomize} style={{
          flex: 1, background: "#1a0a3a", border: "2px solid #3a1a6a",
          color: "#9a6acc", fontFamily: px, fontSize: "9px", padding: "14px", cursor: "pointer",
        }}>{t.random}</button>
        <button onClick={() => ready && onStart(char)} style={{
          flex: 2,
          background: ready ? "#4c1d95" : "#1a0a3a",
          border: `2px solid ${ready ? "#7c3aed" : "#2a1a4a"}`,
          color: ready ? "#e8d5ff" : "#3a2a5a",
          fontFamily: px, fontSize: "9px", padding: "14px",
          cursor: ready ? "pointer" : "default",
          animation: ready ? "pulse 2s ease-in-out infinite" : "none",
        }}>{t.start_game}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GAME CANVAS — full-field movement
// ═══════════════════════════════════════════════════════════
function DreamGame({ char, lang, onDone }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const animRef = useRef(null);
  const [caught, setCaught] = useState([]);
  const [queue, setQueue] = useState([]);
  const caughtRef = useRef([]);
  const NEED = 5;
  const px = "'Press Start 2P',monospace";
  const t = T[lang];

  useEffect(() => {
    const firstPass = shuffle(DREAM_OBJECTS);
    const initialObjects = firstPass.slice(0, 6).map((obj, i) => ({
      obj,
      x: 10 + Math.random() * 80,
      y: -80 - i * 180,
      speed: 0.00109 + Math.random() * 0.00031,
    }));

    stateRef.current = {
      playerX: 50, playerY: 85, // % of canvas
      targetX: 50, targetY: 85,
      objects: initialObjects,
      pass: firstPass,
      passIdx: 6,
      missed: [],
      caught: [],
      lastSpawn: 0,
      spawnInterval: 2500,
      tiltX: 0,
    };
    setQueue([firstPass[6], firstPass[7], firstPass[8]]);

    const handleTilt = (e) => {
      if (stateRef.current) stateRef.current.tiltX = e.gamma || 0;
    };
    window.addEventListener("deviceorientation", handleTilt);
    return () => { window.removeEventListener("deviceorientation", handleTilt); cancelAnimationFrame(animRef.current); };
  }, []);

  // Pointer tracking — follow finger/mouse anywhere on canvas
  const handlePointer = useCallback((clientX, clientY) => {
    if (!canvasRef.current || !stateRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    stateRef.current.targetX = Math.max(5, Math.min(95, px));
    stateRef.current.targetY = Math.max(5, Math.min(95, py));
  }, []);

  const onMouseMove  = e => { if (e.buttons) handlePointer(e.clientX, e.clientY); };
  const onTouchMove  = e => { e.preventDefault(); handlePointer(e.touches[0].clientX, e.touches[0].clientY); };
  const onTouchStart = e => handlePointer(e.touches[0].clientX, e.touches[0].clientY);
  const onMouseDown  = e => handlePointer(e.clientX, e.clientY);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = (ts) => {
      const s = stateRef.current;
      if (!s) return;
      const W = canvas.width, H = canvas.height;

      // Smooth player movement toward target
      s.playerX += (s.targetX - s.playerX) * 0.12;
      s.playerY += (s.targetY - s.playerY) * 0.12;

      // Tilt control (horizontal only)
      if (Math.abs(s.tiltX) > 3) {
        s.targetX += s.tiltX * 0.08;
        s.targetX = Math.max(5, Math.min(95, s.targetX));
      }

      // Spawn
      if (ts - s.lastSpawn > s.spawnInterval && s.caught.length < NEED) {
        if (s.passIdx >= s.pass.length) {
          s.pass = shuffle(s.missed);
          s.missed = [];
          s.passIdx = 0;
        }
        if (s.pass.length > 0) {
          const obj = s.pass[s.passIdx++];
          s.objects.push({ obj, x: 10 + Math.random() * 80, y: -8, speed: 0.00109 + Math.random() * 0.00031 });
          const n = [s.pass[s.passIdx % s.pass.length], s.pass[(s.passIdx+1) % s.pass.length], s.pass[(s.passIdx+2) % s.pass.length]];
          setQueue([...n]);
          s.lastSpawn = ts;
        }
      }

      // Clear
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#07071a";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(100,50,200,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 8) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 8) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Player position in px
      const pxPos = s.playerX / 100 * W;
      const pyPos = s.playerY / 100 * H;
      const catchRadius = 28;

      // Objects
      s.objects = s.objects.filter(item => {
        item.y += item.speed * H;

        const ix = item.x / 100 * W;
        const iy = item.y;

        // Collision — distance based, catch anywhere on field
        const dist = Math.sqrt((ix - pxPos) ** 2 + (iy - pyPos) ** 2);
        if (dist < catchRadius + 20 && s.caught.length < NEED && !s.caught.find(c => c.id === item.obj.id)) {
          s.caught.push(item.obj);
          caughtRef.current = [...s.caught];
          setCaught([...s.caught]);
          // Catch flash
          ctx.beginPath();
          ctx.arc(ix, iy, 40, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,136,0.3)";
          ctx.fill();
          return false;
        }

        // Missed
        if (item.y > H + 40) {
          if (!s.caught.find(c => c.id === item.obj.id)) s.missed.push(item.obj);
          return false;
        }

        // Draw object
        ctx.font = `${Math.min(W * 0.09, 34)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "white";
        ctx.fillText(item.obj.emoji, ix, iy);
        ctx.shadowBlur = 0;

        // Label
        ctx.font = `bold ${Math.min(W * 0.024, 9)}px 'Press Start 2P', monospace`;
        ctx.fillStyle = "rgba(192,132,252,0.9)";
        ctx.fillText(item.obj.name[lang], ix, iy + Math.min(W * 0.055, 22));

        return true;
      });

      // Player character
      const charEmoji = char.creature ? char.creature.split(" ")[0] : "👤";
      ctx.font = `${Math.min(W * 0.11, 40)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "#7c3aed";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "white";
      ctx.fillText(charEmoji, pxPos, pyPos);
      ctx.shadowBlur = 0;

      // Catch radius indicator
      ctx.beginPath();
      ctx.arc(pxPos, pyPos, catchRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(124,58,237,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Caught bar top
      for (let i = 0; i < NEED; i++) {
        const bx = W * 0.1 + (W * 0.8 / NEED) * i + (W * 0.8 / NEED) / 2;
        ctx.strokeStyle = i < s.caught.length ? "#00c864" : "#2a1a5a";
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 15, 8, 30, 30);
        if (i < s.caught.length) {
          ctx.font = "18px serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "white";
          ctx.fillText(s.caught[i].emoji, bx, 23);
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [char, lang]);

  return (
    <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Character + next queue */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Next 3 */}
        <div style={{
          border: "2px solid #2a1a5a", background: "rgba(26,10,58,0.7)",
          padding: "10px 8px", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "10px", minWidth: "72px", flexShrink: 0,
        }}>
          <div style={{ fontSize: "7px", fontFamily: px, color: "#6a2fa0" }}>{t.next3}</div>
          {queue.slice(0,3).map((obj, i) => obj ? (
            <div key={i} style={{ textAlign: "center", opacity: 1 - i * 0.25 }}>
              <div style={{ fontSize: i === 0 ? "28px" : "20px" }}>{obj.emoji}</div>
              <div style={{ fontSize: "5px", fontFamily: px, color: "#6a4a8a", marginTop: "2px" }}>
                {obj.name[lang].length > 7 ? obj.name[lang].slice(0,7)+"…" : obj.name[lang]}
              </div>
            </div>
          ) : null)}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef} width={360} height={440}
          style={{ flex: 1, border: "2px solid #1a0a3a", touchAction: "none", cursor: "none" }}
          onMouseMove={onMouseMove} onMouseDown={onMouseDown}
          onTouchMove={onTouchMove} onTouchStart={onTouchStart}
        />
      </div>

      {/* Caught list */}
      <div style={{
        border: "2px solid #2a1a5a", background: "rgba(26,10,58,0.5)",
        padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: "8px", fontFamily: px, color: "#6a2fa0" }}>{t.caught}: {caught.length}/{NEED}</span>
        {caught.map((obj, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "22px" }}>{obj.emoji}</div>
            <div style={{ fontSize: "6px", fontFamily: px, color: "#00c864" }}>
              {obj.name[lang].length > 6 ? obj.name[lang].slice(0,6)+"…" : obj.name[lang]}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => caught.length >= NEED && onDone(caughtRef.current)} style={{
        width: "100%", fontFamily: px, fontSize: "10px", padding: "16px",
        background: caught.length >= NEED ? "#4c1d95" : "#1a0a3a",
        border: `2px solid ${caught.length >= NEED ? "#7c3aed" : "#2a1a4a"}`,
        color: caught.length >= NEED ? "#e8d5ff" : "#3a2a5a",
        cursor: caught.length >= NEED ? "pointer" : "default",
        animation: caught.length >= NEED ? "pulse 2s ease-in-out infinite" : "none",
      }}>{t.interpret}</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState("ru");
  const [screen, setScreen] = useState("build");
  const [char, setChar] = useState(null);
  const [caughtObjs, setCaughtObjs] = useState([]);
  const [interpreter, setInterpreter] = useState("");
  const [interpIdx, setInterpIdx] = useState(null); // index in interpreters list
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);
  const t = T[lang];
  const px = "'Press Start 2P',monospace";

  const charRef = useRef(null);
  const caughtRef2 = useRef([]);
  const interpIdxRef = useRef(null);

  const handleStart = (c) => { charRef.current = c; setChar(c); setScreen("game"); };
  const handleGameDone = (objs) => { caughtRef2.current = objs; setCaughtObjs(objs); setScreen("interp"); };

  const handleInterpret = () => {
    const fn = INTERP[lang][interpreter];
    if (fn) {
      const idx = T[lang].interpreters.indexOf(interpreter);
      interpIdxRef.current = idx;
      setInterpIdx(idx);
      setResultText(fn(char, caughtObjs));
      setScreen("result");
    }
  };

  // Recompute result text when language changes
  useEffect(() => {
    if (screen === "result" && interpIdxRef.current !== null && charRef.current && caughtRef2.current.length) {
      const interpKey = T[lang].interpreters[interpIdxRef.current];
      setInterpreter(interpKey);
      const fn = INTERP[lang][interpKey];
      if (fn) setResultText(fn(charRef.current, caughtRef2.current));
    }
  }, [lang]);
  const handleCopy = () => {
    const text = `${t.title}\n${char.creature} | ${char.age} | ${char.job} | ${char.status}\n${interpreter}\n${caughtObjs.map(o=>o.emoji).join(" ")}\n\n${resultText}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const handleAgain = () => {
    charRef.current = null; caughtRef2.current = []; interpIdxRef.current = null;
    setScreen("build"); setChar(null); setCaughtObjs([]); setInterpreter(""); setInterpIdx(null); setResultText("");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#07071a",
      backgroundImage: "radial-gradient(ellipse at 20% 10%, #1a0a3a 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, #0a1535 0%, transparent 50%)",
      fontFamily: px, color: "#e8d5ff",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "14px 16px 40px", overflowY: "auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 8px #7c3aed} 50%{box-shadow:0 0 22px #c084fc} }
        @keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:.7} }
        input { outline: none; }
        input::placeholder { color: #3a2a5a; }
        button:active { opacity: 0.8; }
      `}</style>

      {/* Stars */}
      {[...Array(14)].map((_,i) => (
        <div key={i} style={{
          position:"fixed", left:`${(i*47+11)%100}%`, top:`${(i*59+7)%100}%`,
          width:"2px", height:"2px", background:"#e8d5ff", borderRadius:"50%",
          animation:`twinkle ${1.5+(i%3)*.8}s ease-in-out infinite`,
          animationDelay:`${(i*.3)%2}s`, pointerEvents:"none", zIndex:0,
        }}/>
      ))}

      {/* Lang */}
      <button onClick={() => setLang(T[lang].nextLang)} style={{
        position:"fixed", top:"12px", right:"12px", zIndex:100,
        background:"#1a0a3a", border:"2px solid #6a2fa0",
        color:"#c084fc", fontFamily:px, fontSize:"9px",
        padding:"8px 12px", cursor:"pointer",
      }}>{t.langLabel}</button>

      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"16px", zIndex:5, flexShrink:0 }}>
        <div style={{ fontSize:"36px", animation:"float 3s ease-in-out infinite" }}>🌙</div>
        <div style={{ fontSize:"clamp(11px,3vw,15px)", color:"#c084fc", letterSpacing:"2px", marginTop:"6px" }}>{t.title}</div>
        <div style={{ fontSize:"7px", color:"#4a3a6a", marginTop:"4px" }}>{t.sub}</div>
      </div>

      {/* BUILD */}
      {screen === "build" && <CharacterScreen lang={lang} onStart={handleStart}/>}

      {/* GAME */}
      {screen === "game" && <DreamGame char={char} lang={lang} onDone={handleGameDone}/>}

      {/* INTERPRETER CHOICE */}
      {screen === "interp" && (
        <div style={{ width:"100%", maxWidth:"480px", animation:"fadeIn .4s ease" }}>
          <div style={{ fontSize:"11px", color:"#c084fc", marginBottom:"16px", textAlign:"center" }}>{t.interpreter}</div>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", marginBottom:"18px", flexWrap:"wrap" }}>
            {caughtObjs.map((obj,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"32px" }}>{obj.emoji}</div>
                <div style={{ fontSize:"6px", fontFamily:px, color:"#6a2fa0", marginTop:"3px" }}>{obj.name[lang]}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"14px" }}>
            {T[lang].interpreters.map(interp => (
              <button key={interp} onClick={() => setInterpreter(interp)} style={{
                background: interpreter===interp ? "rgba(76,29,149,0.7)" : "rgba(10,10,26,0.8)",
                border: `2px solid ${interpreter===interp ? "#7c3aed" : "#2a1a4a"}`,
                color: interpreter===interp ? "#e8d5ff" : "#7a5aaa",
                fontFamily:px, fontSize:"8px", padding:"14px 10px",
                cursor:"pointer", lineHeight:1.9, textAlign:"center",
              }}>{interp}</button>
            ))}
          </div>
          <button onClick={handleInterpret} disabled={!interpreter} style={{
            width:"100%", fontFamily:px, fontSize:"11px", padding:"16px",
            background: interpreter ? "#4c1d95" : "#1a0a3a",
            border:`2px solid ${interpreter ? "#7c3aed" : "#2a1a4a"}`,
            color: interpreter ? "#e8d5ff" : "#3a2a5a",
            cursor: interpreter ? "pointer" : "default",
            animation: interpreter ? "pulse 2s ease-in-out infinite" : "none",
          }}>{t.go}</button>
        </div>
      )}

      {/* RESULT */}
      {screen === "result" && char && (
        <div style={{ width:"100%", maxWidth:"480px", animation:"fadeIn .5s ease" }}>
          <div style={{ fontSize:"11px", color:"#c084fc", marginBottom:"14px", textAlign:"center" }}>{t.result_title}</div>

          <div style={{
            display:"flex", gap:"12px", alignItems:"center", marginBottom:"12px",
            padding:"12px", border:"1px solid #2a1a5a", background:"rgba(26,10,58,0.5)",
          }}>
            <div style={{ fontSize:"52px", filter:"drop-shadow(0 0 10px rgba(192,132,252,0.6))", flexShrink:0 }}>
              {char.creature.split(" ")[0]}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"8px", fontFamily:px, color:"#9a6acc", lineHeight:2, marginBottom:"6px" }}>
                {char.creature} · {char.job}
              </div>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {caughtObjs.map((obj,i) => <span key={i} style={{ fontSize:"20px" }}>{obj.emoji}</span>)}
              </div>
            </div>
          </div>

          <div style={{ fontSize:"9px", fontFamily:px, color:"#7c3aed", marginBottom:"10px", textAlign:"center" }}>{interpreter}</div>

          <div style={{
            border:"2px solid #2a1a5a", background:"rgba(26,10,58,0.7)",
            padding:"18px", marginBottom:"14px",
            fontSize:"9px", lineHeight:2.4, color:"#d4b8ff",
          }}>
            {resultText.split("\n").map((line,i) => (
              <p key={i} style={{
                margin: line==="" ? "10px 0" : "0 0 2px",
                color: line.startsWith("*") || line.startsWith("📜") || line.startsWith("▸") || line.startsWith("ПЕРСОНАЖ") || line.startsWith("CHARACTER") || line.startsWith("СТАТУС") || line.startsWith("STATUS") || line.startsWith("РЕДКОСТЬ") || line.startsWith("RARITY") || line.startsWith("КВЕСТ") || line.startsWith("QUEST") || line.startsWith("НАГРАДА") || line.startsWith("REWARD") || line.startsWith("ПРОРОЧЕСТВО") || line.startsWith("PROPHECY") || line.startsWith("АРТЕФАКТЫ") || line.startsWith("DREAM") ? "#c084fc" : "#d4b8ff",
              }}>{line || " "}</p>
            ))}
          </div>

          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={handleCopy} style={{
              flex:1, background:"#1a0a3a", border:"2px solid #3a1a6a",
              color: copied?"#00ff88":"#9a6acc", fontFamily:px, fontSize:"9px", padding:"14px", cursor:"pointer",
            }}>{copied ? t.copied : t.share}</button>
            <button onClick={handleAgain} style={{
              flex:2, background:"#4c1d95", border:"2px solid #7c3aed",
              color:"#e8d5ff", fontFamily:px, fontSize:"10px", padding:"14px",
              cursor:"pointer", animation:"pulse 2s ease-in-out infinite",
            }}>{t.again}</button>
          </div>
        </div>
      )}
    </div>
  );
}

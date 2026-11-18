const adhkar = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "أستغفر الله العظيم",
  "اللهم صل وسلم على نبينا محمد",
  "لا حول ولا قوة إلا بالله",
  "سبحان الله وبحمده",
  "سبحان الله العظيم",
  "رب إني لما أنزلت إلي من خير فقير",
  "لا إله إلا أنت سبحانك إني كنت من الظالمين",
  "حسبي الله ونعم الوكيل",
  "اللهم اغفر لي وارحمني",
  "اللهم ارحم موتانا وموتى المسلمين"
];

// أدعية خاصة بالسيد فتحي قاسم الدقة رحمه الله
const fatherDuas = [
  "اللهم ارحم فتحي قاسم الدقة",
  "اللهم اجعل قبره روضة من رياض الجنة",
  "اللهم أسكنه الفردوس الأعلى",
  "اللهم آنس وحشته ونوّر قبره",
  "اللهم اغفر له وارفع درجته في المهديين",
  "اللهم وسّع مدخله، وأنر قبره، وآنس وحشته",
  "اللهم أبدله دارًا خيرًا من داره، وأهلًا خيرًا من أهله",
  "اللهم اسقه من حوض نبيك شربةً لا يظمأ بعدها أبدًا",
  "اللهم اجعل قبره نورًا وضياءً وفسحةً وسرورًا",
  "اللهم اجعل ما أصابه في الدنيا رفعةً لدرجاته وتكفيرًا لسيئاته",
  "اللهم أكرم نزله، وطيّب ثراه، واجعل الجنة مستقره",
  "اللهم اجعل كتابه في عليين، وحسابه يسيرًا",
  "اللهم اجمع له بين الرحمة والمغفرة والرضوان",
  "اللهم اكتب له نعيمًا لا ينقطع، وراحةً لا تزول",
  "اللهم اجعل دعواتنا نورًا يصل إليه",
  "اللهم اجعل الفردوس الأعلى داره، واجمعنا به فيها"
];

// الأدعية التي تُقرأ مرة واحدة فقط
const singleCountAdhkar = [
  "اللهم اغفر لي وارحمني",
  "اللهم ارحم موتانا وموتى المسلمين",
  ...fatherDuas
];

const allAdhkar = [...adhkar, ...fatherDuas];

// مفتاح جديد مع المحافظة على البيانات القديمة
const STORAGE_KEY = "tasbih-fathi-state-v2";
const LEGACY_STORAGE_KEY = "tasbih-akram-state-v1";

const grid = document.getElementById("tasbihGrid");
const fatherGrid = document.getElementById("fatherDuasGrid");
const totalCountElement = document.getElementById("totalCount");
const toast = document.getElementById("toast");

let toastTimer;

// تحديد عدد مرات كل ذكر
function getTarget(index) {
  return singleCountAdhkar.includes(allAdhkar[index]) ? 1 : 10;
}

// حساب الإجمالي القديم
function calculateOldTotal(saved) {
  if (
    !saved ||
    !Array.isArray(saved.remaining) ||
    !Array.isArray(saved.completed)
  ) {
    return 0;
  }

  return adhkar.reduce((sum, _, index) => {
    const target = getTarget(index);

    const remainingValue = Number(saved.remaining[index]);
    const completedValue = Number(saved.completed[index]);

    const remaining = Number.isFinite(remainingValue)
      ? Math.max(0, Math.min(target, remainingValue))
      : target;

    const completed = Number.isFinite(completedValue)
      ? Math.max(0, completedValue)
      : 0;

    const currentProgress = remaining === 0
      ? 0
      : target - remaining;

    return sum + completed * target + currentProgress;
  }, 0);
}

// تحميل البيانات المحفوظة
function loadState() {
  try {
    const currentSaved = localStorage.getItem(STORAGE_KEY);

    const oldSaved = currentSaved
      ? null
      : localStorage.getItem(LEGACY_STORAGE_KEY);

    const saved = JSON.parse(
      currentSaved || oldSaved || "null"
    );

    if (
      saved &&
      Array.isArray(saved.remaining) &&
      Array.isArray(saved.completed)
    ) {
      return {
        remaining: allAdhkar.map((_, i) => {
          const target = getTarget(i);
          const value = Number(saved.remaining[i]);

          return Number.isFinite(value)
            ? Math.max(0, Math.min(target, value))
            : target;
        }),

        completed: allAdhkar.map((_, i) => {
          const value = Number(saved.completed[i]);

          return Number.isFinite(value)
            ? Math.max(0, value)
            : 0;
        }),

        totalClicks: Number.isFinite(Number(saved.totalClicks))
          ? Math.max(0, Number(saved.totalClicks))
          : calculateOldTotal(saved)
      };
    }

  } catch (error) {
    console.error(
      "تعذّر تحميل البيانات المحفوظة:",
      error
    );
  }

  return {
    remaining: allAdhkar.map((_, i) => getTarget(i)),
    completed: allAdhkar.map(() => 0),
    totalClicks: 0
  };
}

let state = loadState();

// حفظ البيانات
function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {
    console.error("تعذّر حفظ البيانات:", error);

    showToast("تعذّر حفظ العدادات في هذا المتصفح");
  }
}

// تحويل الأرقام إلى أرقام عربية
function toArabicNumber(number) {
  return Number(number).toLocaleString("ar");
}

// إنشاء بطاقة ذكر
function createCard(dhikr, index, number) {
  const remaining = state.remaining[index];
  const target = getTarget(index);

  const done = target - remaining;
  const completed = remaining === 0;

  const card = document.createElement("article");

  card.className = "tasbih-card";

  if (completed) {
    card.classList.add("completed");
  }

  card.innerHTML = `
    <div class="card-top">
      <span class="card-number">
        ${toArabicNumber(number)}
      </span>

      <div class="dhikr-name"></div>
    </div>

    <div class="counter-row">
      <span class="remaining-label">
        ${completed ? "اكتمل الذكر" : "المتبقي"}
      </span>

      <strong class="remaining-number">
        ${toArabicNumber(remaining)}
        <small>/ ${toArabicNumber(target)}</small>
      </strong>
    </div>

    <div class="progress-track">
      <div
        class="progress-fill"
        style="width:${(done / target) * 100}%"
      ></div>
    </div>

    <div class="card-actions">
      <button
        class="count-button"
        type="button"
        ${completed ? "disabled" : ""}
      >
        ${completed ? "اكتمل ✓" : "تسبيح"}
      </button>

      <button
        class="reset-button"
        type="button"
      >
        إعادة تعيين ↻
      </button>
    </div>

    <div class="completed-note">
      ${completed ? "تقبّل الله منك 🤍" : " "}
    </div>
  `;

  card.querySelector(".dhikr-name").textContent = dhikr;

  card.querySelector(".count-button").addEventListener(
    "click",
    () => countDhikr(index)
  );

  card.querySelector(".reset-button").addEventListener(
    "click",
    () => resetOne(index)
  );

  return card;
}

// عرض مجموعة من الأذكار
function renderGroup(items, container, startIndex) {
  container.innerHTML = "";

  items.forEach((dhikr, localIndex) => {
    const globalIndex = startIndex + localIndex;

    const card = createCard(
      dhikr,
      globalIndex,
      localIndex + 1
    );

    container.appendChild(card);
  });
}

// عرض القسمين
function render() {
  renderGroup(adhkar, grid, 0);

  renderGroup(
    fatherDuas,
    fatherGrid,
    adhkar.length
  );

  updateTotal();
}

// إنقاص العداد
function countDhikr(index) {
  if (state.remaining[index] <= 0) return;

  state.remaining[index]--;
  state.totalClicks++;

  if (state.remaining[index] === 0) {
    state.completed[index]++;

    showToast(
      "تقبّل الله منك، اكتمل الذكر 🤍"
    );
  }

  saveState();
  render();
}

// إعادة تعيين ذكر واحد
function resetOne(index) {
  state.remaining[index] = getTarget(index);

  saveState();
  render();

  showToast("تمت إعادة تعيين هذا الذكر");
}

// إعادة تعيين جميع الأذكار والأدعية
function resetAll() {
  const confirmed = window.confirm(
    "هل تريد إعادة جميع عدادات الأذكار والأدعية إلى وضعها الأصلي؟ سيبقى إجمالي التسبيحات المنجزة محفوظًا."
  );

  if (!confirmed) return;

  state.remaining = allAdhkar.map(
    (_, index) => getTarget(index)
  );

  saveState();
  render();

  showToast(
    "تمت إعادة تعيين جميع الأذكار والأدعية"
  );
}

// تحديث إجمالي التسبيحات
function updateTotal() {
  totalCountElement.textContent = toArabicNumber(
    state.totalClicks
  );
}

// إظهار الرسائل
function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// زر إعادة تعيين الكل
document
  .getElementById("resetAll")
  .addEventListener("click", resetAll);

// عرض الأذكار عند فتح الصفحة
render();
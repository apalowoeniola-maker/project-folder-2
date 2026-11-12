/**
 * NutriTrack - Pure Vanilla JavaScript Calorie & Macro Tracker
 * Persistent local browser storage (localStorage)
 */

(function () {
  'use strict';

  // --- Storage Keys ---
  const STORAGE_KEYS = {
    LOGS: 'nutritrack_logs_v1',
    GOALS: 'nutritrack_goals_v1',
    FAVORITES: 'nutritrack_favorites_v1'
  };

  // --- Default Goals ---
  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65,
    water: 2500
  };

  // --- Default Favorites / Quick Picks ---
  const DEFAULT_FAVORITES = [
    { name: 'Oatmeal with Blueberries', calories: 280, protein: 9, carbs: 48, fat: 5, serving: '1 bowl (60g dry)' },
    { name: 'Grilled Chicken Breast', calories: 220, protein: 42, carbs: 0, fat: 5, serving: '180g cooked' },
    { name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fat: 2, serving: '1 cup cooked (195g)' },
    { name: 'Greek Yogurt (0% Fat)', calories: 130, protein: 18, carbs: 7, fat: 0, serving: '1 cup (170g)' },
    { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: '1 medium (118g)' },
    { name: 'Whey Protein Shake', calories: 140, protein: 25, carbs: 3, fat: 2, serving: '1 scoop with water' },
    { name: 'Avocado Toast', calories: 260, protein: 6, carbs: 24, fat: 15, serving: '1 slice whole wheat' },
    { name: 'Hard Boiled Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, serving: '1 large egg' }
  ];

  // --- State ---
  let currentDate = getTodayDateString();
  let appGoals = loadGoals();
  let appLogs = loadLogs();
  let appFavorites = loadFavorites();

  // Seed sample data for today if user is opening for the very first time
  seedSampleDataIfFirstRun();

  // --- DOM Elements ---
  const elements = {
    datePicker: document.getElementById('active-date-picker'),
    dateLabel: document.getElementById('date-display-label'),
    prevDateBtn: document.getElementById('prev-date-btn'),
    nextDateBtn: document.getElementById('next-date-btn'),
    todayBtn: document.getElementById('today-btn'),

    // Summary Numbers
    totalCaloriesVal: document.getElementById('total-calories-val'),
    goalCaloriesVal: document.getElementById('goal-calories-val'),
    remainingCaloriesVal: document.getElementById('remaining-calories-val'),
    calorieProgressBar: document.getElementById('calorie-progress-bar'),
    caloriePercentLabel: document.getElementById('calorie-percent-label'),
    calorieStatusBadge: document.getElementById('calorie-status-badge'),
    overBudgetWarning: document.getElementById('over-budget-warning'),

    // Macros
    valProtein: document.getElementById('val-protein'),
    targetProtein: document.getElementById('target-protein'),
    barProtein: document.getElementById('bar-protein'),
    calProtein: document.getElementById('cal-protein'),

    valCarbs: document.getElementById('val-carbs'),
    targetCarbs: document.getElementById('target-carbs'),
    barCarbs: document.getElementById('bar-carbs'),
    calCarbs: document.getElementById('cal-carbs'),

    valFat: document.getElementById('val-fat'),
    targetFat: document.getElementById('target-fat'),
    barFat: document.getElementById('bar-fat'),
    calFat: document.getElementById('cal-fat'),

    // Water
    waterAmountVal: document.getElementById('water-amount-val'),
    waterProgressText: document.getElementById('water-progress-text'),
    waterProgressBar: document.getElementById('water-progress-bar'),
    waterGlassesContainer: document.getElementById('water-glasses-container'),
    waterPlusBtn: document.getElementById('water-plus-btn'),
    waterMinusBtn: document.getElementById('water-minus-btn'),

    // Meal items containers & totals
    itemsBreakfast: document.getElementById('items-breakfast'),
    itemsLunch: document.getElementById('items-lunch'),
    itemsDinner: document.getElementById('items-dinner'),
    itemsSnack: document.getElementById('items-snack'),
    mealCalBreakfast: document.getElementById('meal-cal-breakfast'),
    mealCalLunch: document.getElementById('meal-cal-lunch'),
    mealCalDinner: document.getElementById('meal-cal-dinner'),
    mealCalSnack: document.getElementById('meal-cal-snack'),

    // Modals
    foodModal: document.getElementById('food-modal'),
    foodEntryForm: document.getElementById('food-entry-form'),
    foodModalTitle: document.getElementById('food-modal-title'),
    closeFoodModalBtn: document.getElementById('close-food-modal-btn'),
    cancelFoodModalBtn: document.getElementById('cancel-food-modal-btn'),
    globalAddFoodBtn: document.getElementById('global-add-food-btn'),

    // Food Form Inputs
    editEntryId: document.getElementById('edit-entry-id'),
    inputMealCategory: document.getElementById('input-meal-category'),
    inputFoodName: document.getElementById('input-food-name'),
    inputServing: document.getElementById('input-serving'),
    inputCalories: document.getElementById('input-calories'),
    inputProtein: document.getElementById('input-protein'),
    inputCarbs: document.getElementById('input-carbs'),
    inputFat: document.getElementById('input-fat'),
    inputSaveFavorite: document.getElementById('input-save-favorite'),
    foodSuggestionsDatalist: document.getElementById('food-suggestions'),

    // Goals Modal
    goalsModal: document.getElementById('goals-modal'),
    openGoalsModalBtn: document.getElementById('open-goals-modal-btn'),
    closeGoalsModalBtn: document.getElementById('close-goals-modal-btn'),
    cancelGoalsModalBtn: document.getElementById('cancel-goals-modal-btn'),
    goalsForm: document.getElementById('goals-form'),
    goalInputCalories: document.getElementById('goal-input-calories'),
    goalInputProtein: document.getElementById('goal-input-protein'),
    goalInputCarbs: document.getElementById('goal-input-carbs'),
    goalInputFat: document.getElementById('goal-input-fat'),
    goalInputWater: document.getElementById('goal-input-water'),

    // Settings Modal
    dataModal: document.getElementById('data-modal'),
    openDataModalBtn: document.getElementById('open-data-modal-btn'),
    closeDataModalBtn: document.getElementById('close-data-modal-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonTriggerBtn: document.getElementById('import-json-trigger-btn'),
    importJsonFile: document.getElementById('import-json-file'),
    clearAllDataBtn: document.getElementById('clear-all-data-btn'),

    // Weekly Chart & Stats
    weeklyCanvas: document.getElementById('weekly-chart'),
    statAvgCal: document.getElementById('stat-avg-cal'),
    statMaxCal: document.getElementById('stat-max-cal'),
    statLoggedCount: document.getElementById('stat-logged-count'),
    streakCounterBadge: document.getElementById('streak-counter-badge'),

    // Sidebar
    quickPicksContainer: document.getElementById('quick-picks-container'),
    toastContainer: document.getElementById('toast-container')
  };

  // --- Helper Date Functions ---
  function getTodayDateString() {
    const today = new Date();
    return formatDateToString(today);
  }

  function formatDateToString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateString(str) {
    const parts = str.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function shiftDate(dateStr, offsetDays) {
    const d = parseDateString(dateStr);
    d.setDate(d.getDate() + offsetDays);
    return formatDateToString(d);
  }

  function formatHumanDate(dateStr) {
    const todayStr = getTodayDateString();
    const yesterdayStr = shiftDate(todayStr, -1);
    const tomorrowStr = shiftDate(todayStr, 1);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const d = parseDateString(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // --- Storage Functions ---
  function loadGoals() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      return stored ? Object.assign({}, DEFAULT_GOALS, JSON.parse(stored)) : Object.assign({}, DEFAULT_GOALS);
    } catch (e) {
      console.error('Error loading goals:', e);
      return Object.assign({}, DEFAULT_GOALS);
    }
  }

  function saveGoals(goals) {
    appGoals = goals;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  function loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading logs:', e);
      return {};
    }
  }

  function saveLogs(logs) {
    appLogs = logs;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [...DEFAULT_FAVORITES];
    } catch (e) {
      console.error('Error loading favorites:', e);
      return [...DEFAULT_FAVORITES];
    }
  }

  function saveFavorites(favorites) {
    appFavorites = favorites;
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }

  // Seed sample data if fresh start
  function seedSampleDataIfFirstRun() {
    const hasInitialized = localStorage.getItem('nutritrack_initialized');
    if (!hasInitialized) {
      const todayStr = getTodayDateString();
      const yesterdayStr = shiftDate(todayStr, -1);
      const twoDaysAgoStr = shiftDate(todayStr, -2);

      appLogs[todayStr] = {
        water: 1250,
        entries: [
          {
            id: 'sample-1',
            meal: 'breakfast',
            name: 'Oatmeal with Blueberries & Honey',
            serving: '1 large bowl',
            calories: 340,
            protein: 11,
            carbs: 62,
            fat: 6,
            timestamp: '08:30'
          },
          {
            id: 'sample-2',
            meal: 'lunch',
            name: 'Grilled Chicken Salad with Avocado',
            serving: '1 bowl',
            calories: 480,
            protein: 38,
            carbs: 18,
            fat: 22,
            timestamp: '12:45'
          }
        ]
      };

      // Past days to make charts look great right out of the box
      appLogs[yesterdayStr] = {
        water: 2000,
        entries: [
          { id: 'sample-y1', meal: 'breakfast', name: 'Greek Yogurt with Granola', serving: '1 cup', calories: 290, protein: 20, carbs: 35, fat: 5, timestamp: '08:00' },
          { id: 'sample-y2', meal: 'lunch', name: 'Turkey & Cheese Wrap', serving: '1 wrap', calories: 450, protein: 32, carbs: 42, fat: 14, timestamp: '13:00' },
          { id: 'sample-y3', meal: 'dinner', name: 'Baked Salmon with Quinoa', serving: '200g salmon', calories: 620, protein: 46, carbs: 40, fat: 24, timestamp: '19:30' },
          { id: 'sample-y4', meal: 'snack', name: 'Whey Protein Shake', serving: '1 shake', calories: 140, protein: 25, carbs: 3, fat: 2, timestamp: '16:00' }
        ]
      };

      appLogs[twoDaysAgoStr] = {
        water: 2250,
        entries: [
          { id: 'sample-2d1', meal: 'breakfast', name: 'Scrambled Eggs on Whole Grain Toast', serving: '2 eggs + 2 toast', calories: 380, protein: 22, carbs: 28, fat: 18, timestamp: '08:15' },
          { id: 'sample-2d2', meal: 'lunch', name: 'Rice Bowl with Grilled Beef', serving: '1 bowl', calories: 680, protein: 40, carbs: 75, fat: 20, timestamp: '13:15' },
          { id: 'sample-2d3', meal: 'dinner', name: 'Stir-Fry Chicken with Vegetables', serving: '350g plate', calories: 510, protein: 42, carbs: 35, fat: 15, timestamp: '20:00' }
        ]
      };

      saveLogs(appLogs);
      localStorage.setItem('nutritrack_initialized', 'true');
    }
  }

  function getDayData(dateStr) {
    if (!appLogs[dateStr]) {
      appLogs[dateStr] = { entries: [], water: 0 };
    }
    if (!Array.isArray(appLogs[dateStr].entries)) {
      appLogs[dateStr].entries = [];
    }
    if (typeof appLogs[dateStr].water !== 'number') {
      appLogs[dateStr].water = 0;
    }
    return appLogs[dateStr];
  }

  // --- Rendering UI ---
  function renderAll() {
    renderDateControls();
    renderDayTotals();
    renderMealLists();
    renderWater();
    renderWeeklyChart();
    renderFavorites();
    updateSuggestionsDatalist();
  }

  function renderDateControls() {
    elements.datePicker.value = currentDate;
    const humanStr = formatHumanDate(currentDate);
    elements.dateLabel.textContent = humanStr;
  }

  function renderDayTotals() {
    const day = getDayData(currentDate);
    let totalCal = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    day.entries.forEach(item => {
      totalCal += Number(item.calories) || 0;
      totalP += Number(item.protein) || 0;
      totalC += Number(item.carbs) || 0;
      totalF += Number(item.fat) || 0;
    });

    totalP = Math.round(totalP * 10) / 10;
    totalC = Math.round(totalC * 10) / 10;
    totalF = Math.round(totalF * 10) / 10;

    const goalCal = appGoals.calories || 2000;
    const remaining = goalCal - totalCal;
    const percentage = goalCal > 0 ? Math.round((totalCal / goalCal) * 100) : 0;

    elements.totalCaloriesVal.textContent = totalCal.toLocaleString();
    elements.goalCaloriesVal.textContent = goalCal.toLocaleString();
    elements.remainingCaloriesVal.textContent = remaining.toLocaleString();

    // Progress Bar and Badges
    const clampedWidth = Math.min(percentage, 100);
    elements.calorieProgressBar.style.width = clampedWidth + '%';
    elements.caloriePercentLabel.textContent = `${percentage}% of daily target`;

    // Reset bar states
    elements.calorieProgressBar.classList.remove('warning', 'danger');
    if (remaining < 0) {
      elements.calorieProgressBar.classList.add('danger');
      elements.overBudgetWarning.style.display = 'inline';
      elements.overBudgetWarning.textContent = `${Math.abs(remaining).toLocaleString()} kcal over budget`;
      elements.calorieStatusBadge.className = 'badge badge-danger';
      elements.calorieStatusBadge.textContent = 'Exceeded';
      elements.remainingCaloriesVal.style.color = '#dc2626';
    } else if (percentage >= 85) {
      elements.calorieProgressBar.classList.add('warning');
      elements.overBudgetWarning.style.display = 'none';
      elements.calorieStatusBadge.className = 'badge badge-warning';
      elements.calorieStatusBadge.textContent = 'Near Target';
      elements.remainingCaloriesVal.style.color = '#2563eb';
    } else {
      elements.overBudgetWarning.style.display = 'none';
      elements.calorieStatusBadge.className = 'badge badge-success';
      elements.calorieStatusBadge.textContent = 'On Track';
      elements.remainingCaloriesVal.style.color = '#2563eb';
    }

    // Macros
    elements.valProtein.textContent = totalP;
    elements.targetProtein.textContent = appGoals.protein || 140;
    const pPercent = appGoals.protein > 0 ? Math.min(Math.round((totalP / appGoals.protein) * 100), 100) : 0;
    elements.barProtein.style.width = pPercent + '%';
    elements.calProtein.textContent = Math.round(totalP * 4);

    elements.valCarbs.textContent = totalC;
    elements.targetCarbs.textContent = appGoals.carbs || 220;
    const cPercent = appGoals.carbs > 0 ? Math.min(Math.round((totalC / appGoals.carbs) * 100), 100) : 0;
    elements.barCarbs.style.width = cPercent + '%';
    elements.calCarbs.textContent = Math.round(totalC * 4);

    elements.valFat.textContent = totalF;
    elements.targetFat.textContent = appGoals.fat || 65;
    const fPercent = appGoals.fat > 0 ? Math.min(Math.round((totalF / appGoals.fat) * 100), 100) : 0;
    elements.barFat.style.width = fPercent + '%';
    elements.calFat.textContent = Math.round(totalF * 9);
  }

  function renderMealLists() {
    const day = getDayData(currentDate);

    const meals = {
      breakfast: { container: elements.itemsBreakfast, calElement: elements.mealCalBreakfast, items: [], totalCal: 0 },
      lunch: { container: elements.itemsLunch, calElement: elements.mealCalLunch, items: [], totalCal: 0 },
      dinner: { container: elements.itemsDinner, calElement: elements.mealCalDinner, items: [], totalCal: 0 },
      snack: { container: elements.itemsSnack, calElement: elements.mealCalSnack, items: [], totalCal: 0 }
    };

    day.entries.forEach(entry => {
      const m = meals[entry.meal] || meals.snack;
      m.items.push(entry);
      m.totalCal += Number(entry.calories) || 0;
    });

    Object.keys(meals).forEach(mealKey => {
      const data = meals[mealKey];
      data.calElement.textContent = data.totalCal.toLocaleString();

      if (data.items.length === 0) {
        data.container.innerHTML = `<div class="empty-meal-state">No foods logged for ${mealKey} yet</div>`;
      } else {
        data.container.innerHTML = '';
        data.items.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'food-entry-item';
          itemEl.setAttribute('data-id', item.id);

          const portionHtml = item.serving ? `<span class="food-item-portion">${escapeHtml(item.serving)}</span>` : '';
          const pVal = item.protein ? `<span class="macro-tag p">P: ${item.protein}g</span>` : '';
          const cVal = item.carbs ? `<span class="macro-tag c">C: ${item.carbs}g</span>` : '';
          const fVal = item.fat ? `<span class="macro-tag f">F: ${item.fat}g</span>` : '';

          itemEl.innerHTML = `
            <div class="food-info-block">
              <div class="food-name-row">
                <span class="food-item-name">${escapeHtml(item.name)}</span>
                ${portionHtml}
              </div>
              <div class="food-macro-tags">
                ${pVal}
                ${cVal}
                ${fVal}
              </div>
            </div>
            <div class="food-item-actions">
              <span class="food-item-calories">${Number(item.calories).toLocaleString()} kcal</span>
              <button class="action-icon-btn edit-food-btn" title="Edit Item" data-id="${item.id}">✏️</button>
              <button class="action-icon-btn delete-btn delete-food-btn" title="Delete Item" data-id="${item.id}">🗑️</button>
            </div>
          `;
          data.container.appendChild(itemEl);
        });
      }
    });

    // Attach Event Listeners to dynamic buttons
    attachFoodListActionListeners();
  }

  function attachFoodListActionListeners() {
    // Delete buttons
    document.querySelectorAll('.delete-food-btn').forEach(btn => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        deleteFoodEntry(id);
      };
    });

    // Edit buttons
    document.querySelectorAll('.edit-food-btn').forEach(btn => {
      btn.onclick = function (e) {
        e.stopPropagation();
        const id = this.getAttribute('data-id');
        openEditFoodModal(id);
      };
    });
  }

  function renderWater() {
    const day = getDayData(currentDate);
    const currentWater = day.water || 0;
    const targetWater = appGoals.water || 2500;

    elements.waterAmountVal.textContent = currentWater.toLocaleString();
    elements.waterProgressText.textContent = `${currentWater.toLocaleString()} / ${targetWater.toLocaleString()} ml`;

    const waterPct = targetWater > 0 ? Math.min(Math.round((currentWater / targetWater) * 100), 100) : 0;
    elements.waterProgressBar.style.width = waterPct + '%';

    // Render glass icons (10 glasses total, each ~ 250ml)
    elements.waterGlassesContainer.innerHTML = '';
    const glassCount = Math.max(10, Math.ceil(targetWater / 250));
    for (let i = 1; i <= glassCount; i++) {
      const glass = document.createElement('span');
      glass.className = 'water-glass-icon';
      glass.textContent = '💧';
      const glassAmount = i * 250;
      if (currentWater >= glassAmount) {
        glass.classList.add('filled');
      }
      glass.title = `${glassAmount} ml`;
      glass.onclick = () => {
        setWaterAmount(glassAmount);
      };
      elements.waterGlassesContainer.appendChild(glass);
    }
  }

  function setWaterAmount(amount) {
    const day = getDayData(currentDate);
    day.water = Math.max(0, amount);
    saveLogs(appLogs);
    renderWater();
  }

  function adjustWater(delta) {
    const day = getDayData(currentDate);
    day.water = Math.max(0, (day.water || 0) + delta);
    saveLogs(appLogs);
    renderWater();
  }

  // --- Favorites / Quick Picks ---
  function renderFavorites() {
    elements.quickPicksContainer.innerHTML = '';
    if (!appFavorites || appFavorites.length === 0) {
      elements.quickPicksContainer.innerHTML = '<p class="form-help">No favorites saved yet.</p>';
      return;
    }

    appFavorites.slice(0, 8).forEach(fav => {
      const item = document.createElement('div');
      item.className = 'quick-pick-item';
      item.title = `Click to add ${fav.name} (Portion: ${fav.serving || '1 serving'})`;
      item.innerHTML = `
        <span class="quick-pick-name">${escapeHtml(fav.name)}</span>
        <span class="quick-pick-cals">+${fav.calories} kcal</span>
      `;
      item.onclick = () => {
        quickAddFavorite(fav);
      };
      elements.quickPicksContainer.appendChild(item);
    });
  }

  function quickAddFavorite(fav) {
    // Choose appropriate meal based on time of day or default to snack
    const hour = new Date().getHours();
    let suggestedMeal = 'snack';
    if (hour >= 5 && hour < 11) suggestedMeal = 'breakfast';
    else if (hour >= 11 && hour < 16) suggestedMeal = 'lunch';
    else if (hour >= 16 && hour < 22) suggestedMeal = 'dinner';

    const newEntry = {
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      meal: suggestedMeal,
      name: fav.name,
      serving: fav.serving || '',
      calories: Number(fav.calories) || 0,
      protein: Number(fav.protein) || 0,
      carbs: Number(fav.carbs) || 0,
      fat: Number(fav.fat) || 0,
      timestamp: new Date().toTimeString().substring(0, 5)
    };

    const day = getDayData(currentDate);
    day.entries.push(newEntry);
    saveLogs(appLogs);
    renderAll();
    showToast(`Added "${fav.name}" to ${suggestedMeal}!`, 'success');
  }

  function updateSuggestionsDatalist() {
    elements.foodSuggestionsDatalist.innerHTML = '';
    const uniqueNames = new Set();

    appFavorites.forEach(f => uniqueNames.add(f.name));

    // Also collect from recent logs
    Object.values(appLogs).forEach(day => {
      if (day.entries) {
        day.entries.forEach(e => uniqueNames.add(e.name));
      }
    });

    uniqueNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      elements.foodSuggestionsDatalist.appendChild(opt);
    });
  }

  // --- Weekly Trend Canvas Chart (No external chart libraries) ---
  function renderWeeklyChart() {
    const canvas = elements.weeklyCanvas;
    if (!canvas) return;

    // Use container width dynamically for perfect crispness on all devices
    const containerW = canvas.parentElement ? canvas.parentElement.clientWidth : 360;
    const width = Math.max(280, containerW);
    const height = 210;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Compute last 7 days ending with currentDate
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = shiftDate(currentDate, -i);
      const dayData = appLogs[dateStr] || { entries: [] };
      let cal = 0;
      if (dayData.entries) {
        dayData.entries.forEach(e => cal += (Number(e.calories) || 0));
      }
      past7Days.push({
        dateStr,
        calories: cal,
        isCurrent: dateStr === currentDate,
        dayLabel: parseDateString(dateStr).toLocaleDateString(undefined, { weekday: 'narrow' })
      });
    }

    // Calculate Stats
    let totalCals = 0;
    let maxCals = 0;
    let loggedDaysCount = 0;

    past7Days.forEach(d => {
      totalCals += d.calories;
      if (d.calories > maxCals) maxCals = d.calories;
      if (d.calories > 0) loggedDaysCount++;
    });

    const avgCals = Math.round(totalCals / 7);
    elements.statAvgCal.textContent = `${avgCals.toLocaleString()} kcal`;
    elements.statMaxCal.textContent = `${maxCals.toLocaleString()} kcal`;
    elements.statLoggedCount.textContent = `${loggedDaysCount}/7`;

    // Streak Calculation (consecutive days with logs ending today/yesterday)
    const streak = calculateStreak();
    elements.streakCounterBadge.textContent = `🔥 ${streak} Day Streak`;

    // Chart Dimensions
    const padding = { top: 30, right: 15, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Max scale ceiling
    const targetCal = appGoals.calories || 2000;
    const scaleMax = Math.max(targetCal * 1.25, maxCals * 1.15, 2200);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & labels
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const val = Math.round((scaleMax / gridLines) * i);
      const y = padding.top + chartH - (i / gridLines) * chartH;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText(val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val, padding.left - 6, y);
    }

    // Draw Target Reference Line
    const targetY = padding.top + chartH - (targetCal / scaleMax) * chartH;
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(padding.left + chartW, targetY);
    ctx.stroke();
    ctx.restore();

    // Label on target line
    ctx.fillStyle = '#2563eb';
    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${targetCal}`, padding.left + 4, targetY - 6);

    // Draw Bars
    const barCount = past7Days.length;
    const colWidth = chartW / barCount;
    const barWidth = Math.min(24, colWidth * 0.55);

    past7Days.forEach((day, index) => {
      const barH = (day.calories / scaleMax) * chartH;
      const x = padding.left + index * colWidth + (colWidth - barWidth) / 2;
      const y = padding.top + chartH - barH;

      // Fill style depending on goal
      if (day.calories === 0) {
        ctx.fillStyle = '#e2e8f0';
      } else if (day.calories > targetCal) {
        ctx.fillStyle = '#ef4444'; // over
      } else if (day.isCurrent) {
        ctx.fillStyle = '#10b981'; // today on track
      } else {
        ctx.fillStyle = '#34d399'; // past day on track
      }

      // Rounded rectangle for bar
      drawRoundedRect(ctx, x, y, barWidth, Math.max(barH, 3), 4);
      ctx.fill();

      // Highlight active selected day with border or dot
      if (day.isCurrent) {
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, x, y, barWidth, Math.max(barH, 3), 4);
        ctx.stroke();
      }

      // Day Label underneath
      ctx.fillStyle = day.isCurrent ? '#0f172a' : '#64748b';
      ctx.font = day.isCurrent ? 'bold 11px "Plus Jakarta Sans", sans-serif' : '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day.dayLabel, x + barWidth / 2, padding.top + chartH + 16);

      // Calorie value on top of bar if space permits
      if (day.calories > 0) {
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(day.calories >= 1000 ? Math.round(day.calories) : day.calories, x + barWidth / 2, Math.max(y - 5, padding.top - 8));
      }
    });
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    if (h < r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function calculateStreak() {
    let streak = 0;
    const today = getTodayDateString();
    let checkDate = today;

    // Check if logged today, if not check yesterday
    const todayData = appLogs[today];
    const loggedToday = todayData && todayData.entries && todayData.entries.length > 0;

    if (!loggedToday) {
      checkDate = shiftDate(today, -1);
    }

    while (true) {
      const data = appLogs[checkDate];
      if (data && data.entries && data.entries.length > 0) {
        streak++;
        checkDate = shiftDate(checkDate, -1);
      } else {
        break;
      }
      if (streak > 365) break; // safety guard
    }

    return streak;
  }

  // --- Food Modal Operations ---
  function openAddFoodModal(presetMeal) {
    elements.editEntryId.value = '';
    elements.foodModalTitle.textContent = 'Add Food Item';
    elements.inputMealCategory.value = presetMeal || 'breakfast';
    elements.inputFoodName.value = '';
    elements.inputServing.value = '';
    elements.inputCalories.value = '';
    elements.inputProtein.value = '';
    elements.inputCarbs.value = '';
    elements.inputFat.value = '';
    elements.inputSaveFavorite.checked = true;

    elements.foodModal.style.display = 'flex';
    elements.inputFoodName.focus();
  }

  function openEditFoodModal(entryId) {
    const day = getDayData(currentDate);
    const item = day.entries.find(e => e.id === entryId);
    if (!item) return;

    elements.editEntryId.value = item.id;
    elements.foodModalTitle.textContent = 'Edit Food Item';
    elements.inputMealCategory.value = item.meal;
    elements.inputFoodName.value = item.name;
    elements.inputServing.value = item.serving || '';
    elements.inputCalories.value = item.calories;
    elements.inputProtein.value = item.protein || '';
    elements.inputCarbs.value = item.carbs || '';
    elements.inputFat.value = item.fat || '';
    elements.inputSaveFavorite.checked = false;

    elements.foodModal.style.display = 'flex';
  }

  function closeFoodModal() {
    elements.foodModal.style.display = 'none';
  }

  function deleteFoodEntry(entryId) {
    const day = getDayData(currentDate);
    const index = day.entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      const removed = day.entries.splice(index, 1)[0];
      saveLogs(appLogs);
      renderAll();
      showToast(`Removed "${removed.name}"`, 'info');
    }
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = elements.inputFoodName.value.trim();
    const calories = Math.max(0, parseInt(elements.inputCalories.value, 10) || 0);
    const protein = Math.max(0, parseFloat(elements.inputProtein.value) || 0);
    const carbs = Math.max(0, parseFloat(elements.inputCarbs.value) || 0);
    const fat = Math.max(0, parseFloat(elements.inputFat.value) || 0);
    const meal = elements.inputMealCategory.value;
    const serving = elements.inputServing.value.trim();
    const saveFavorite = elements.inputSaveFavorite.checked;
    const editId = elements.editEntryId.value;

    if (!name) {
      showToast('Please provide a food name', 'danger');
      return;
    }

    const day = getDayData(currentDate);

    if (editId) {
      // Editing existing entry
      const existing = day.entries.find(entry => entry.id === editId);
      if (existing) {
        existing.name = name;
        existing.calories = calories;
        existing.protein = protein;
        existing.carbs = carbs;
        existing.fat = fat;
        existing.meal = meal;
        existing.serving = serving;
        showToast(`Updated "${name}"`, 'success');
      }
    } else {
      // Adding new entry
      const newEntry = {
        id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        meal,
        name,
        serving,
        calories,
        protein,
        carbs,
        fat,
        timestamp: new Date().toTimeString().substring(0, 5)
      };
      day.entries.push(newEntry);
      showToast(`Added "${name}" (${calories} kcal)`, 'success');
    }

    // Save as favorite if requested
    if (saveFavorite) {
      const existingFav = appFavorites.find(f => f.name.toLowerCase() === name.toLowerCase());
      if (!existingFav) {
        appFavorites.unshift({ name, calories, protein, carbs, fat, serving });
        if (appFavorites.length > 20) appFavorites.pop();
        saveFavorites(appFavorites);
      }
    }

    saveLogs(appLogs);
    closeFoodModal();
    renderAll();
  }

  // Auto-fill from favorites when typing known food name
  function handleFoodNameInput() {
    const val = elements.inputFoodName.value.trim().toLowerCase();
    if (!val) return;

    const matchedFav = appFavorites.find(f => f.name.toLowerCase() === val);
    if (matchedFav) {
      if (!elements.inputCalories.value) elements.inputCalories.value = matchedFav.calories;
      if (!elements.inputProtein.value && matchedFav.protein !== undefined) elements.inputProtein.value = matchedFav.protein;
      if (!elements.inputCarbs.value && matchedFav.carbs !== undefined) elements.inputCarbs.value = matchedFav.carbs;
      if (!elements.inputFat.value && matchedFav.fat !== undefined) elements.inputFat.value = matchedFav.fat;
      if (!elements.inputServing.value && matchedFav.serving) elements.inputServing.value = matchedFav.serving;
    }
  }

  // --- Goals Modal Operations ---
  function openGoalsModal() {
    elements.goalInputCalories.value = appGoals.calories || 2000;
    elements.goalInputProtein.value = appGoals.protein || 140;
    elements.goalInputCarbs.value = appGoals.carbs || 220;
    elements.goalInputFat.value = appGoals.fat || 65;
    elements.goalInputWater.value = appGoals.water || 2500;
    elements.goalsModal.style.display = 'flex';
  }

  function closeGoalsModal() {
    elements.goalsModal.style.display = 'none';
  }

  function handleGoalsFormSubmit(e) {
    e.preventDefault();
    const updated = {
      calories: Math.max(500, parseInt(elements.goalInputCalories.value, 10) || 2000),
      protein: Math.max(0, parseInt(elements.goalInputProtein.value, 10) || 0),
      carbs: Math.max(0, parseInt(elements.goalInputCarbs.value, 10) || 0),
      fat: Math.max(0, parseInt(elements.goalInputFat.value, 10) || 0),
      water: Math.max(500, parseInt(elements.goalInputWater.value, 10) || 2500)
    };

    saveGoals(updated);
    closeGoalsModal();
    renderAll();
    showToast('Daily targets successfully updated!', 'success');
  }

  function applyMacroPreset(type) {
    const cals = parseInt(elements.goalInputCalories.value, 10) || 2000;
    if (type === 'balanced') {
      // 30% P, 45% C, 25% F
      elements.goalInputProtein.value = Math.round((cals * 0.30) / 4);
      elements.goalInputCarbs.value = Math.round((cals * 0.45) / 4);
      elements.goalInputFat.value = Math.round((cals * 0.25) / 9);
    } else if (type === 'high-protein') {
      // 40% P, 35% C, 25% F
      elements.goalInputProtein.value = Math.round((cals * 0.40) / 4);
      elements.goalInputCarbs.value = Math.round((cals * 0.35) / 4);
      elements.goalInputFat.value = Math.round((cals * 0.25) / 9);
    } else if (type === 'low-carb') {
      // 30% P, 10% C, 60% F
      elements.goalInputProtein.value = Math.round((cals * 0.30) / 4);
      elements.goalInputCarbs.value = Math.round((cals * 0.10) / 4);
      elements.goalInputFat.value = Math.round((cals * 0.60) / 9);
    }
  }

  // --- Settings / Data Management ---
  function openDataModal() {
    elements.dataModal.style.display = 'flex';
  }

  function closeDataModal() {
    elements.dataModal.style.display = 'none';
  }

  function exportBackupJSON() {
    const payload = {
      version: 1,
      exportDate: new Date().toISOString(),
      goals: appGoals,
      logs: appLogs,
      favorites: appFavorites
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutritrack_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup JSON exported successfully!', 'success');
  }

  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.goals) saveGoals(parsed.goals);
        if (parsed.logs) saveLogs(parsed.logs);
        if (parsed.favorites) saveFavorites(parsed.favorites);

        renderAll();
        closeDataModal();
        showToast('Backup restored successfully!', 'success');
      } catch (err) {
        console.error('Import error:', err);
        showToast('Invalid backup file. Could not import.', 'danger');
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    if (confirm('Are you sure you want to permanently delete ALL food logs and reset targets? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem('nutritrack_initialized');

      appGoals = Object.assign({}, DEFAULT_GOALS);
      appLogs = {};
      appFavorites = [...DEFAULT_FAVORITES];

      seedSampleDataIfFirstRun();
      renderAll();
      closeDataModal();
      showToast('All data has been reset to defaults.', 'info');
    }
  }

  // --- Toast Notification Helper ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Date Navigation
    elements.prevDateBtn.addEventListener('click', () => {
      currentDate = shiftDate(currentDate, -1);
      renderAll();
    });

    elements.nextDateBtn.addEventListener('click', () => {
      currentDate = shiftDate(currentDate, 1);
      renderAll();
    });

    elements.todayBtn.addEventListener('click', () => {
      currentDate = getTodayDateString();
      renderAll();
    });

    elements.datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        currentDate = e.target.value;
        renderAll();
      }
    });

    // Water Controls
    elements.waterPlusBtn.addEventListener('click', () => adjustWater(250));
    elements.waterMinusBtn.addEventListener('click', () => adjustWater(-250));

    // Meal Quick Add Buttons
    document.querySelectorAll('.quick-add-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const meal = btn.getAttribute('data-meal');
        openAddFoodModal(meal);
      });
    });

    elements.globalAddFoodBtn.addEventListener('click', () => {
      openAddFoodModal('breakfast');
    });

    // Food Modal Events
    elements.closeFoodModalBtn.addEventListener('click', closeFoodModal);
    elements.cancelFoodModalBtn.addEventListener('click', closeFoodModal);
    elements.foodEntryForm.addEventListener('submit', handleFoodFormSubmit);
    elements.inputFoodName.addEventListener('input', handleFoodNameInput);

    // Goals Modal Events
    elements.openGoalsModalBtn.addEventListener('click', openGoalsModal);
    elements.closeGoalsModalBtn.addEventListener('click', closeGoalsModal);
    elements.cancelGoalsModalBtn.addEventListener('click', closeGoalsModal);
    elements.goalsForm.addEventListener('submit', handleGoalsFormSubmit);

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        applyMacroPreset(preset);
      });
    });

    // Settings Modal Events
    elements.openDataModalBtn.addEventListener('click', openDataModal);
    elements.closeDataModalBtn.addEventListener('click', closeDataModal);
    elements.exportJsonBtn.addEventListener('click', exportBackupJSON);

    elements.importJsonTriggerBtn.addEventListener('click', () => {
      elements.importJsonFile.click();
    });

    elements.importJsonFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFile(e.target.files[0]);
        e.target.value = '';
      }
    });

    elements.clearAllDataBtn.addEventListener('click', clearAllData);

    // Close modals on clicking outside window
    window.addEventListener('click', (e) => {
      if (e.target === elements.foodModal) closeFoodModal();
      if (e.target === elements.goalsModal) closeGoalsModal();
      if (e.target === elements.dataModal) closeDataModal();
    });

    // Keyboard shortcuts (Escape closes modals)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeFoodModal();
        closeGoalsModal();
        closeDataModal();
      }
    });

    // Resize listener to re-render canvas on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderWeeklyChart, 150);
    });
  }

  // --- Initialize Application ---
  function init() {
    setupEventListeners();
    renderAll();
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

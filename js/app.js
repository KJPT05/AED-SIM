(function () {
  'use strict';


  /* ---------- Voice (speech synthesis) ---------- */
  const speechSupported = 'speechSynthesis' in window;
  const voiceHint = document.getElementById('voice-support-hint');
  if (!speechSupported) {
    voiceHint.textContent = 'Your browser doesn\'t support spoken prompts here — on-screen captions will guide you instead.';
  } else {
    voiceHint.textContent = 'Turn your volume up — this simulator speaks its instructions out loud, just like a real AED.';
  }

  let preferredVoice = null;
  function pickVoice() {
    if (!speechSupported) return;
    const voices = speechSynthesis.getVoices();
    preferredVoice =
      voices.find((v) => /en-GB/i.test(v.lang) && /female|Google UK English Female/i.test(v.name)) ||
      voices.find((v) => /en-GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      voices[0] || null;
  }
  if (speechSupported) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  const captionBarText = document.getElementById('caption-bar-text');
  const voiceIndicatorEl = document.getElementById('voice-indicator');

  function speak(text, { interrupt = false } = {}) {
    captionBarText.textContent = text;
    if (!speechSupported) return;
    function queue() {
      const utter = new SpeechSynthesisUtterance(text);
      if (preferredVoice) utter.voice = preferredVoice;
      utter.rate = 0.98;
      utter.pitch = 1;
      if (voiceIndicatorEl) {
        utter.addEventListener('start', () => voiceIndicatorEl.classList.add('active'));
        utter.addEventListener('end', () => voiceIndicatorEl.classList.remove('active'));
        utter.addEventListener('error', () => voiceIndicatorEl.classList.remove('active'));
      }
      speechSynthesis.speak(utter);
    }
    if (interrupt) {
      speechSynthesis.cancel();
      // Android Chrome's speech engine can silently drop a speak() call made
      // in the same tick as cancel() — a short delay lets the engine reset
      // first so the new prompt reliably plays in full.
      setTimeout(queue, 60);
    } else {
      queue();
    }
  }

  /* ---------- Web Audio metronome beep ---------- */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function beep() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /* ---------- Screen switching ---------- */
  const screens = {
    home: document.getElementById('screen-home'),
    intro: document.getElementById('screen-intro'),
    device: document.getElementById('screen-device'),
    end: document.getElementById('screen-end'),
  };
  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.setAttribute('aria-hidden', key === name ? 'false' : 'true');
    });
    window.scrollTo(0, 0);

    if (name === 'device') {
      document.body.classList.add('device-active');
      try {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (req) req.call(el).catch(() => {});
      } catch (e) { /* fullscreen not permitted here — safe to ignore */ }
    } else {
      document.body.classList.remove('device-active');
      if (voiceIndicatorEl) voiceIndicatorEl.classList.remove('active');
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
        }
      } catch (e) { /* ignore */ }
    }
  }

  /* ---------- Device panel elements ---------- */
  const panels = {};
  document.querySelectorAll('.panel').forEach((el) => { panels[el.dataset.panel] = el; });
  function showPanel(name) {
    Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== name; });
  }

  const lightPower = document.getElementById('light-power');
  const lightShock = document.getElementById('light-shock');
  const lightCpr = document.getElementById('light-cpr');
  function setLight(el, state) {
    el.classList.remove('on', 'alert', 'safe');
    if (state) el.classList.add(state);
  }

  const btnPower = document.getElementById('btn-power');
  const controlsHint = document.getElementById('controls-hint');
  const btnPadsDone = document.getElementById('btn-pads-done');
  const btnShock = document.getElementById('btn-shock');
  const btnClearCorrect = document.getElementById('btn-clear-correct');
const btnClearContinue = document.getElementById('btn-clear-continue');
const btnClearPads = document.getElementById('btn-clear-pads');
const clearFeedbackEl = document.getElementById('clear-feedback');
  const shockStatusCode = document.getElementById('shock-status-code');
  const captionShock = document.getElementById('caption-shock');
  const captionNoShock = document.getElementById('caption-noshock');
  const chargeBarFill = document.querySelector('#charge-bar span');
  const cprCountEl = document.getElementById('cpr-count');
  const cprTimerEl = document.getElementById('cpr-timer');
  const cprStatusCodeEl = document.getElementById('cpr-status-code');
  const cprCompressionsViewEl = document.getElementById('cpr-compressions-view');
  const breathsPhaseEl = document.getElementById('breaths-phase');
  const breathsCountdownEl = document.getElementById('breaths-countdown');
  const captionCprEl = document.getElementById('caption-cpr');
  const cprTimerLabelEl = document.getElementById('cpr-timer-label');
  const panelOffLabelEl = document.getElementById('panel-off-label');
  const metronomeRingEl = document.getElementById('metronome-ring');
const chestAnimationEl = document.getElementById('chest-animation');
  const btnExit = document.getElementById('btn-exit');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
const btnIntroExit = document.getElementById('btn-intro-exit');
const btnIntroPrimary = document.getElementById('btn-intro-primary');
const btnIntroSecondary = document.getElementById('btn-intro-secondary');
const btnIntroRepeat = document.getElementById('btn-intro-repeat');
const introStepEl = document.getElementById('intro-step');
const introTitleEl = document.getElementById('intro-title');
const introMessageEl = document.getElementById('intro-message');
const btnMainMenu = document.getElementById('btn-main-menu');
  /* ---------- Session / state machine ---------- */
  let sessionId = 0;
  let pending = [];
  let cprInterval = null;
  let cprTickTimer = null;
  let breathsInterval = null;
  let compressionCount = 0;
  let compressionsInSet = 0;
  let cprSecondsLeft = 120;
  let deviceOn = false;
  let scenarioMode = 'random';
  let rescuerMode = 'single';
  let cycles = 0;
  let aedArrived = false; // AED is not yet on scene when a scenario starts — CPR begins first
  let trainingMode = 'sixty-second';
  let introStep = 0;
  const BREATHS_SECONDS = 5; // time given for 2 rescue breaths before compressions resume

  function clearAllTimers() {
    pending.forEach((id) => clearTimeout(id));
    pending = [];
    if (cprInterval) { clearInterval(cprInterval); cprInterval = null; }
    if (cprTickTimer) { clearInterval(cprTickTimer); cprTickTimer = null; }
    if (breathsInterval) { clearInterval(breathsInterval); breathsInterval = null; }
    if (speechSupported) speechSynthesis.cancel();
  }
  function after(ms, fn) {
    const mySession = sessionId;
    const id = setTimeout(() => { if (mySession === sessionId) fn(); }, ms);
    pending.push(id);
    return id;
  }

  function resetDeviceUI() {
    deviceOn = false;
    aedArrived = false;
    compressionCount = 0;
    compressionsInSet = 0;
    cprSecondsLeft = 120;
    cycles = 0;
    setLight(lightPower, null);
    setLight(lightShock, null);
    setLight(lightCpr, null);
    showPanel('off');
    if (panelOffLabelEl) panelOffLabelEl.textContent = 'Device is off';
    btnPower.classList.remove('active');
    btnPower.disabled = true; // re-enabled once the AED arrives on scene
    controlsHint.textContent = 'AED not yet on scene';
    btnShock.disabled = true;
    chargeBarFill.style.width = '0%';
    cprCountEl.textContent = '0';
    cprTimerEl.textContent = '2:00';
    captionBarText.textContent = 'Patient is unresponsive and not breathing normally.';
    showBreathsPhase(false);
  }

  function startTraining() {
    scenarioMode = document.querySelector('input[name="scenario"]:checked').value;
    rescuerMode = document.querySelector('input[name="rescuers"]:checked').value;
    trainingMode = 'sixty-second';
    resetDeviceUI();
    showScreen('device');
    goToCpr();
  }
function startRescueIntro() {
  scenarioMode = document.querySelector('input[name="scenario"]:checked').value;
  rescuerMode = document.querySelector('input[name="rescuers"]:checked').value;
  trainingMode = 'sixty-second';
  introStep = 0;

  resetDeviceUI();
  showScreen('intro');
  renderIntroStep();
}
function renderIntroStep() {
  if (introStep === 0) {
    introStepEl.textContent = '60-SECOND RESCUE · STEP 1 OF 4';
    introTitleEl.textContent = 'Is it safe to approach?';
    introMessageEl.textContent =
      'An adult has suddenly collapsed. Look around before you go closer.';

    btnIntroPrimary.textContent = 'YES — CHECK FOR A RESPONSE';
    btnIntroSecondary.textContent = 'NO — GET HELP / STAY SAFE';
    btnIntroSecondary.hidden = false;

    speak(
      'An adult has suddenly collapsed. First, make sure it is safe to approach.',
      { interrupt: true }
    );
  }

  if (introStep === 1) {
    introStepEl.textContent = '60-SECOND RESCUE · STEP 2 OF 4';
    introTitleEl.textContent = 'They do not respond.';
    introMessageEl.textContent =
      'Call 999 immediately. Put your phone on speaker.';

    btnIntroPrimary.textContent = 'CALL 999 NOW';
    btnIntroSecondary.hidden = true;

    speak(
      'They do not respond. Call 999 immediately and put your phone on speaker.',
      { interrupt: true }
    );
  }
    if (introStep === 2) {
  introStepEl.textContent = '60-SECOND RESCUE · STEP 3 OF 4';
  introTitleEl.textContent = 'The call is connecting.';
  introMessageEl.textContent =
    'Put your phone on speaker. While you wait, check whether they are breathing normally. The call handler can help you.';

  btnIntroPrimary.textContent = 'CHECK BREATHING NOW';
  btnIntroSecondary.hidden = true;

  speak(
    'The call is connecting. Put your phone on speaker. While you wait, check whether they are breathing normally. The ambulance service call handler can help you.',
    { interrupt: true }
  );
}

  if (introStep === 3) {
  introStepEl.textContent = '60-SECOND RESCUE · STEP 4 OF 4';
  introTitleEl.textContent = 'Is their breathing normal?';
  introMessageEl.textContent =
    'They are unresponsive and making occasional gasping or panting breaths. What should you do?';

  btnIntroPrimary.textContent = 'START CPR NOW';
  btnIntroSecondary.textContent = 'WAIT AND SEE IF BREATHING IMPROVES';
  btnIntroSecondary.hidden = false;

  speak(
    'They are unresponsive and making occasional gasping or panting breaths. Is this normal breathing? If you are unsure, start C. P. R. now.',
    { interrupt: true }
  );
}
}
  function endSession(spoken) {
    sessionId++; // invalidate all pending callbacks
    clearAllTimers();
    resetDeviceUI();
    document.getElementById('end-summary').textContent =
      spoken || 'You practised the full AED sequence. Great work — the more familiar this feels, the more useful you\'ll be in a real emergency.';
    showScreen('end');
  }

  function decideShockable() {
    if (scenarioMode === 'shockable') return true;
    if (scenarioMode === 'noshock') return false;
    return Math.random() < 0.5;
  }

  /* ---------- Flow steps ---------- */
function powerOn() {
  ensureAudio();

  deviceOn = true;
  btnPower.classList.add('active');
  controlsHint.textContent = 'AED is on — follow the instructions';
  setLight(lightPower, 'on');
  showPanel('poweron');

  speak(
    'A. E. D. switched on. Attach pads as shown.',
    { interrupt: true }
  );

  after(4500, goToPads);
}

function goToPads() {
  showPanel('pads');

  captionBarText.textContent =
    'Remove clothing from the chest. Follow the pictures on the pads and attach them as shown.';

  speak(
    'Remove clothing from the chest. Follow the pictures on the pads and attach them as shown.',
    { interrupt: true }
  );
}

  btnPadsDone.addEventListener('click', () => {
    if (!deviceOn) return;
    goToAnalysing();
  });
btnClearCorrect.addEventListener('click', () => {
  beginAnalysis();
});

btnClearContinue.addEventListener('click', () => {
  if (clearFeedbackEl) {
    clearFeedbackEl.textContent =
      'Stop CPR for AED analysis. Make sure nobody is touching the person, then say: “Stand clear!”';
  }

  speak(
    'Stop C. P. R. for A. E. D. analysis. Make sure nobody is touching the person. Say, stand clear.',
    { interrupt: true }
  );
});

btnClearPads.addEventListener('click', () => {
  if (clearFeedbackEl) {
    clearFeedbackEl.textContent =
      'Leave the pads attached. Make sure nobody is touching the person, then say: “Stand clear!”';
  }

  speak(
    'Leave the pads attached. Make sure nobody is touching the person. Say, stand clear.',
    { interrupt: true }
  );
});
function goToAnalysing() {
  showPanel('clear');

  if (clearFeedbackEl) {
    clearFeedbackEl.textContent = '';
  }

  captionBarText.textContent =
    'Stop CPR. Make sure nobody is touching the person. What do you say?';

  speak(
    'Stop C. P. R. Make sure nobody is touching the person. What do you say?',
    { interrupt: true }
  );
}
function beginAnalysis() {
  showPanel('analysing');

  captionBarText.textContent =
    'Analysing heart rhythm. Do not touch the person.';

  speak(
    'Analysing heart rhythm. Do not touch the person.',
    { interrupt: true }
  );

  after(5400, () => {
    cycles++;

    if (decideShockable()) {
      goToShock();
    } else {
      goToNoShock();
    }
  });
}
  function goToShock() {
    setLight(lightShock, 'alert');
    shockStatusCode.textContent = 'SHOCK ADVISED';
    captionShock.textContent = 'Charging. Stand clear of the patient.';
    showPanel('shock');
    chargeBarFill.style.width = '0%';
    btnShock.disabled = true;
    speak('Shock advised. Charging. Stand clear.', { interrupt: true });
    after(50, () => { chargeBarFill.style.width = '100%'; });
   after(4500, () => {
  captionShock.textContent =
    'Check everyone is clear. Then push the flashing orange button.';

  btnShock.disabled = false;

  speak(
    'Everyone stand clear. Check that nobody is touching the person. Push the flashing orange button now.',
    { interrupt: true }
  );
});
  }

btnShock.addEventListener('click', () => {
  if (btnShock.disabled) return;

  btnShock.disabled = true;
  setLight(lightShock, null);

  shockStatusCode.textContent = 'SHOCK DELIVERED';
  captionShock.textContent =
    'Resume CPR immediately. Start with chest compressions.';
  chargeBarFill.style.width = '0%';

  speak(
    'Shock delivered. Start CPR now.',
    { interrupt: true }
  );

  after(2800, goToCpr);
});
btnMainMenu.addEventListener('click', () => {
  window.location.reload();
});
function goToNoShock() {
  setLight(lightShock, null);

  showPanel('noshock');

  captionBarText.textContent =
    'No shock advised. Resume CPR immediately. Start with chest compressions.';

  captionNoShock.textContent =
    'Resume CPR immediately. Start with chest compressions.';

  speak(
    'No shock advised. Resume CPR immediately. Start with chest compressions.',
    { interrupt: true }
  );

  after(1800, goToCpr);
}
function goToHandover() {
  clearInterval(cprInterval);
  cprInterval = null;

  clearInterval(cprTickTimer);
  cprTickTimer = null;

  if (breathsInterval) {
    clearInterval(breathsInterval);
    breathsInterval = null;
  }

  showBreathsPhase(false);
  setLight(lightCpr, null);
  setLight(lightShock, null);

  showPanel('handover');

captionBarText.textContent =
  'Ambulance crew has taken over CPR. Scenario complete.';

speak(
  'Ambulance crew has taken over CPR. Scenario complete.',
  { interrupt: true }
);
}
  const BPM = 110;
  const BEAT_MS = Math.round(60000 / BPM);

  function showBreathsPhase(active) {
    breathsPhaseEl.hidden = !active;
    breathsPhaseEl.setAttribute('aria-hidden', active ? 'false' : 'true');
    cprCompressionsViewEl.hidden = active;
    captionCprEl.hidden = active;
    if (cprStatusCodeEl) cprStatusCodeEl.textContent = active ? 'GIVE 2 BREATHS' : 'CPR IN PROGRESS';
  }

  function startCompressionBeat() {
    cprInterval = setInterval(() => {
      beep();
      compressionCount++;
      compressionsInSet++;
      cprCountEl.textContent = String(compressionCount);
      [metronomeRingEl.querySelector('.metronome-core'), chestAnimationEl].forEach((el) => {
        if (!el) return;
        el.classList.remove('beat');
        void el.offsetWidth; // restart animation
        el.classList.add('beat');
      });
      if (rescuerMode === 'two' && compressionsInSet >= 30) {
        startBreathsPhase();
        return;
      }
      if (rescuerMode === 'single' && compressionCount % 15 === 0 && cprSecondsLeft > 5) {
        speak('Continue CPR.', { interrupt: true });
      }
    }, BEAT_MS);
  }

  function startBreathsPhase() {
    if (cprInterval) { clearInterval(cprInterval); cprInterval = null; }
    compressionsInSet = 0;
    showBreathsPhase(true);
    let breathsLeft = BREATHS_SECONDS;
    breathsCountdownEl.textContent = String(breathsLeft);
    speak('Give two breaths.', { interrupt: true });
    const mySession = sessionId;
    breathsInterval = setInterval(() => {
      if (mySession !== sessionId) { clearInterval(breathsInterval); breathsInterval = null; return; }
      breathsLeft--;
      if (breathsLeft <= 0) {
        clearInterval(breathsInterval); breathsInterval = null;
        showBreathsPhase(false);
        if (cprSecondsLeft > 0) {
          speak('Resume compressions.', { interrupt: true });
          startCompressionBeat();
        }
        return;
      }
      breathsCountdownEl.textContent = String(breathsLeft);
    }, 1000);
  }

  function goToCpr() {
  setLight(lightCpr, 'safe');
  showPanel('cpr');
  compressionCount = 0;
  compressionsInSet = 0;
  cprSecondsLeft = trainingMode === 'sixty-second' && !aedArrived ? 20 : 120;
  cprCountEl.textContent = '0';
  cprTimerEl.textContent = cprSecondsLeft === 20 ? '0:20' : '2:00';

  if (cprTimerLabelEl) {
    cprTimerLabelEl.textContent = aedArrived
      ? 'until re-analysis'
      : 'until AED arrives';
  }

  showBreathsPhase(false);

  const beatLine = rescuerMode === 'two'
    ? 'Push hard and fast in the centre of the chest. Thirty compressions, then two breaths.'
    : 'Push hard and fast. Follow the beat.';

  if (!aedArrived) {
    speak('Patient is unresponsive, not breathing normally. Start CPR now. ' + beatLine, { interrupt: true });
  } else {
    speak(beatLine, { interrupt: true });
  }

  startCompressionBeat();

  cprTickTimer = setInterval(() => {
    cprSecondsLeft--;

    if (cprSecondsLeft <= 0) {
      clearInterval(cprInterval);
      cprInterval = null;
      clearInterval(cprTickTimer);
      cprTickTimer = null;

      if (breathsInterval) {
        clearInterval(breathsInterval);
        breathsInterval = null;
      }

      showBreathsPhase(false);
      setLight(lightCpr, null);

     if (!aedArrived) {
  aedHasArrived();
} else {
  goToHandover();
}

      return;
    }

    const m = Math.floor(cprSecondsLeft / 60);
    const s = cprSecondsLeft % 60;
    cprTimerEl.textContent = m + ':' + String(s).padStart(2, '0');
  }, 1000);
}

function aedHasArrived() {
  aedArrived = true;

  showPanel('off');

  if (panelOffLabelEl) {
    panelOffLabelEl.textContent = 'AED has arrived — switch it on';
  }

  btnPower.disabled = false;
  controlsHint.textContent = 'Switch the AED on';

  captionBarText.textContent =
    'The AED has arrived. Keep CPR going while it is switched on and the pads are prepared.';

  speak(
    'The A. E. D. has arrived. Keep C. P. R. going while it is switched on and the pads are prepared. Switch the A. E. D. on now.',
    { interrupt: true }
  );
}
  /* ---------- Power button (also acts as re-analyse skip when held on CPR) ---------- */
  btnPower.addEventListener('click', () => {
    if (!deviceOn) {
      powerOn();
    }
  });

  /* ---------- Nav buttons ---------- */
  btnStart.addEventListener('click', () => {
    ensureAudio();
    sessionId++;
    clearAllTimers();
    startRescueIntro();
  });
 btnIntroPrimary.addEventListener('click', () => {
  ensureAudio();
  if (introStep < 3) {
    introStep++;
    renderIntroStep();
    return;
  }

  if (introStep === 3) {
    showScreen('device');
    goToCpr();
  }
});

btnIntroSecondary.addEventListener('click', () => {
  if (introStep === 0) {
    introMessageEl.textContent =
      'Do not put yourself in danger. Get help and wait until it is safe to approach.';

    speak(
      'Do not put yourself in danger. Get help and wait until it is safe to approach.',
      { interrupt: true }
    );
    return;
  }

  if (introStep === 3) {
    introMessageEl.textContent =
      'Do not wait. Gasping or panting can be abnormal breathing. If they are unresponsive and you are unsure, start CPR now. The call handler can help you.';

    btnIntroSecondary.hidden = true;

    speak(
      'Do not wait. Gasping or panting can be abnormal breathing. If they are unresponsive and you are unsure, start C. P. R. now. The call handler can help you.',
      { interrupt: true }
    );
  }
});

btnIntroRepeat.addEventListener('click', () => {
  renderIntroStep();
});

btnIntroExit.addEventListener('click', () => {
  sessionId++;
  clearAllTimers();
  showScreen('home');
});
  btnExit.addEventListener('click', () => {
    endSession();
  });

  btnRestart.addEventListener('click', () => {
    showScreen('home');
  });

  /* ---------- init ---------- */
  resetDeviceUI();
  showScreen('home');

  /* ---------- Service worker (installable / offline) ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }
})();

import './style.css';

// Rutas a los audios servidos desde public/audio
const audioUrls = {
	bocina: '/audio/bocina.mp3',
	alarma: '/audio/alarma.mp3',
	alarmaFuerte: '/audio/alarma_fuerte.mp3',
	multitud: '/audio/multitud.mp3',
};

// Prefetch de binarios para decodificar rápido al iniciar
const prefetchedAudio = {};
for (const [key, url] of Object.entries(audioUrls)) {
	fetch(url)
		.then(r => r.arrayBuffer())
		.then(buf => { prefetchedAudio[key] = buf; })
		.catch(() => { /* ignorar: podremos reintentar luego */ });
}

// Programación por hora (en segundos desde el inicio de cada hora)
const HOURLY_OFFSETS = [
	{ key: 'bocina', at: 57 * 60 },       // 57:00
	{ key: 'alarma', at: 58 * 60 },       // 58:00
	{ key: 'alarmaFuerte', at: 59 * 60 }, // 59:00
	{ key: 'multitud', at: 59 * 60 + 49 } // 59:49
];

// Estado del temporizador
let isRunning = false;
let perfStartMs = 0;                 // performance.now() al (re)inicio
let elapsedBeforePauseMs = 0;        // acumulado en pausas

// Estado de audio
let audioCtx = null;
let audioBuffers = null;             // { bocina, alarma, alarmaFuerte, multitud }
let schedulerIntervalId = null;
let scheduledKeys = new Set();       // evita duplicados: `${hourIndex}:${key}`
let audioCtxStartTime = 0;           // audioCtx.currentTime al (re)anclar
let elapsedAtAudioCtxStart = 0;      // segundos transcurridos cuando se ancló el audio
let lastPlayedTimes = new Map();     // Track last played times to prevent duplicates

// UI refs
const displayEl = document.getElementById('display');
const lapEl = document.getElementById('lap');
const lapsCompletedEl = document.getElementById('lapsCompleted');
const kmEl = document.getElementById('kilometers');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const testBtn = document.getElementById('testBtn');
const nextAlarmNameEl = document.getElementById('nextAlarmName');
const nextAlarmCountdownEl = document.getElementById('nextAlarmCountdown');

startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
resetBtn.addEventListener('click', resetAll);
testBtn.addEventListener('click', jumpTo56Minutes);

function getElapsedMs() {
	return isRunning
		? elapsedBeforePauseMs + (performance.now() - perfStartMs)
		: elapsedBeforePauseMs;
}

function formatHMS(totalMs) {
	const totalSec = Math.floor(totalMs / 1000);
	const hours = Math.floor(totalSec / 3600);
	const minutes = Math.floor((totalSec % 3600) / 60);
	const seconds = totalSec % 60;
	return [hours, minutes, seconds]
		.map((v) => String(v).padStart(2, '0'))
		.join(':');
}

function computeNextAlarm(nowElapsedSec) {
	const currentHourIndex = Math.floor(nowElapsedSec / 3600);
	const base = currentHourIndex * 3600;
	for (const { key, at } of HOURLY_OFFSETS) {
		const t = base + at;
		if (t >= nowElapsedSec - 1e-6) return { key, timeSec: t };
	}
	const nextBase = (currentHourIndex + 1) * 3600;
	const { key, at } = HOURLY_OFFSETS[0];
	return { key, timeSec: nextBase + at };
}

function getAlarmName(key) {
	switch (key) {
		case 'bocina': return 'Bocina (57:00)';
		case 'alarma': return 'Alarma (58:00)';
		case 'alarmaFuerte': return 'Alarma fuerte (59:00)';
		case 'multitud': return 'Multitud (59:49)';
		default: return '—';
	}
}

function updateUI() {
	const ms = getElapsedMs();
	displayEl.textContent = formatHMS(ms);

	const totalSec = Math.floor(ms / 1000);
	const completedLaps = Math.floor(totalSec / 3600);
	const currentLap = completedLaps + 1; // nunca se reinicia
	lapEl.textContent = String(currentLap);
	lapsCompletedEl.textContent = String(completedLaps);
	kmEl.textContent = (completedLaps * 6.7).toFixed(1);

	const nowSec = ms / 1000;
	const next = computeNextAlarm(nowSec);
	nextAlarmNameEl.textContent = getAlarmName(next.key);
	const diffMs = Math.max(0, (next.timeSec - nowSec) * 1000);
	nextAlarmCountdownEl.textContent = `en ${formatHMS(diffMs)}`;
}

(function frameLoop() {
	updateUI();
	requestAnimationFrame(frameLoop);
})();

async function ensureAudioReady() {
	if (audioCtx && audioBuffers) return;

	if (!audioCtx) {
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}

	const decode = async (key) => {
		const arrayBuffer = prefetchedAudio[key] || await fetch(audioUrls[key]).then(r => r.arrayBuffer());
		return new Promise((resolve, reject) => {
			audioCtx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
		});
	};

	const [bocinaBuf, alarmaBuf, alarmaFuerteBuf, multitudBuf] = await Promise.all([
		decode('bocina'),
		decode('alarma'),
		decode('alarmaFuerte'),
		decode('multitud'),
	]);

	audioBuffers = {
		bocina: bocinaBuf,
		alarma: alarmaBuf,
		alarmaFuerte: alarmaFuerteBuf,
		multitud: multitudBuf,
	};
}

function anchorAudioClock() {
	audioCtxStartTime = audioCtx.currentTime;
	elapsedAtAudioCtxStart = getElapsedMs() / 1000;
}

function ctxTimeForElapsed(targetElapsedSeconds) {
	return audioCtxStartTime + (targetElapsedSeconds - elapsedAtAudioCtxStart);
}

function scheduleInWindow() {
	if (!isRunning || !audioCtx || !audioBuffers) return;

	const lookaheadSec = 5.0;
	const nowElapsed = getElapsedMs() / 1000;
	const windowStart = nowElapsed;
	const windowEnd = nowElapsed + lookaheadSec;
	const currentHourIndexStart = Math.floor(windowStart / 3600);
	const lastHourIndex = Math.floor(windowEnd / 3600) + 1;

	for (let hourIdx = currentHourIndexStart; hourIdx <= lastHourIndex; hourIdx++) {
		const base = hourIdx * 3600;
		for (const { key, at } of HOURLY_OFFSETS) {
			const eventTime = base + at;
			if (eventTime < windowStart - 0.001 || eventTime > windowEnd + 0.001) continue;
			const schedKey = `${hourIdx}:${key}`;
			if (scheduledKeys.has(schedKey)) continue;

			const whenCtx = ctxTimeForElapsed(eventTime);
			const minLead = 0.03;
			if (whenCtx <= audioCtx.currentTime + minLead) continue;

			try {
				// Check if we've already played this sound recently (within 1 second)
				const lastPlayed = lastPlayedTimes.get(schedKey);
				if (lastPlayed && Math.abs(eventTime - lastPlayed) < 1) {
					continue;
				}

				const src = audioCtx.createBufferSource();
				src.buffer = audioBuffers[key];
				
				// Add gain node for better control
				const gainNode = audioCtx.createGain();
				gainNode.gain.value = 0.9; // Good volume level
				
				src.connect(gainNode);
				gainNode.connect(audioCtx.destination);
				
				// Add error handling and cleanup
				src.onended = () => {
					try {
						src.disconnect();
						gainNode.disconnect();
					} catch (e) {
						// Ignore disconnect errors
					}
				};
				
				// Handle scheduling errors
				src.onerror = (error) => {
					console.error(`Audio playback error for ${key}:`, error);
				};
				
				src.start(whenCtx);
				scheduledKeys.add(schedKey);
				lastPlayedTimes.set(schedKey, eventTime);
				
				console.log(`✓ Scheduled ${key} for hour ${hourIdx} at ${eventTime}s (ctx: ${whenCtx.toFixed(3)})`);
			} catch (error) {
				console.error(`Failed to schedule ${key}:`, error);
				// Try immediate fallback playback if scheduling fails
				try {
					const fallbackSrc = audioCtx.createBufferSource();
					fallbackSrc.buffer = audioBuffers[key];
					fallbackSrc.connect(audioCtx.destination);
					fallbackSrc.start();
					console.log(`🔄 Fallback immediate playback for ${key}`);
				} catch (fallbackError) {
					console.error(`Fallback also failed for ${key}:`, fallbackError);
				}
			}
		}
	}
}

function startScheduler() {
	if (schedulerIntervalId) return;
	// Reduce interval for more responsive scheduling
	schedulerIntervalId = setInterval(scheduleInWindow, 50);
}

function stopScheduler() {
	if (schedulerIntervalId) {
		clearInterval(schedulerIntervalId);
		schedulerIntervalId = null;
	}
}

async function start() {
	if (isRunning) return;
	await ensureAudioReady();

	isRunning = true;
	perfStartMs = performance.now();
	startBtn.disabled = true;
	stopBtn.disabled = false;

	// Ensure audio context is running
	if (audioCtx.state === 'suspended') {
		await audioCtx.resume();
	}
	
	// Clear any old scheduled keys when restarting
	scheduledKeys.clear();
	lastPlayedTimes.clear();
	
	anchorAudioClock();
	startScheduler();
}

async function stop() {
	if (!isRunning) return;
	const totalMs = elapsedBeforePauseMs + (performance.now() - perfStartMs);
	isRunning = false;
	elapsedBeforePauseMs = totalMs;
	startBtn.disabled = false;
	stopBtn.disabled = true;
	stopScheduler();
	if (audioCtx && audioCtx.state === 'running') {
		await audioCtx.suspend();
	}
}

async function resetAll() {
	isRunning = false;
	elapsedBeforePauseMs = 0;
	perfStartMs = 0;
	startBtn.disabled = false;
	stopBtn.disabled = true;
	stopScheduler();
	
	// Clear scheduled keys to allow sounds to replay
	scheduledKeys.clear();
	lastPlayedTimes.clear();
	
	if (audioCtx && audioCtx.state === 'running') {
		await audioCtx.suspend();
	}
}

async function jumpTo56Minutes() {
	// Set timer to 56:00 (56 minutes = 3360 seconds = 3,360,000 ms)
	const targetMs = 56 * 60 * 1000;
	
	if (isRunning) {
		// If running, adjust the start time to make elapsed time = 56:00
		const now = performance.now();
		perfStartMs = now - targetMs;
		elapsedBeforePauseMs = 0;
		
		// Clear and reschedule audio
		scheduledKeys.clear();
		lastPlayedTimes.clear();
		
		if (audioCtx) {
			anchorAudioClock();
		}
	} else {
		// If stopped, set the elapsed time directly
		elapsedBeforePauseMs = targetMs;
		perfStartMs = 0;
	}
	
	console.log('⏰ Timer jumped to 56:00 for testing');
}

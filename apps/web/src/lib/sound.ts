// slippylabs: lesson sounds and the Piper voice clips, via plain <audio>.
let muted = false;
try {
	muted = localStorage.getItem('lingo:v2/muted') === '1';
} catch {
	/* ignore */
}

export const isMuted = () => muted;
export function setMuted(m: boolean) {
	muted = m;
	try {
		localStorage.setItem('lingo:v2/muted', m ? '1' : '0');
	} catch {
		/* ignore */
	}
}

function play(src: string, rate = 1) {
	if (typeof Audio === 'undefined') return;
	const a = new Audio(src);
	a.playbackRate = rate;
	a.play().catch(() => {
		/* autoplay blocked until the first tap; the play button still works */
	});
	return a;
}

export const effect = (name: 'correct' | 'wrong' | 'fanfare') => {
	if (!muted) play(`/sound/${name}.mp3`);
};

export const voice = (audio: string | undefined, rate = 1) => {
	if (audio) play(`/voice/${audio}.mp3`, rate);
};

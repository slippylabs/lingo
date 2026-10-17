// slippylabs: the fork's PouchDB/CouchDB layer is disabled (every call site is
// commented out "until we have the db"), so no progress was ever saved. This
// is the minimal PouchDB-shaped store getSkillStats/savePractice need: async
// get() that throws when a doc is missing, and put(). Progress lives only in
// this browser's localStorage; nothing is sent anywhere.
//
// Skill ids are NOT unique across courses (the parallel Slavic courses share
// them), so callers key docs by `skills/<courseName>/<skillId>`.

const PREFIX = 'lingo:';
const listeners = new Set();

const storage = () => {
	try {
		return typeof window !== 'undefined' ? window.localStorage : null;
	} catch {
		return null;
	}
};

const localDb = {
	async get(id) {
		const raw = storage()?.getItem(PREFIX + id);
		if (raw == null) {
			const err = new Error('missing');
			err.status = 404;
			throw err;
		}
		return JSON.parse(raw);
	},
	async put(doc) {
		storage()?.setItem(PREFIX + doc._id, JSON.stringify(doc));
		listeners.forEach((fn) => fn());
	}
};

// Re-run `listener(db)` now and whenever progress changes, in this tab or another.
export const live = (listener) => {
	const run = () => listener(localDb);
	run();
	listeners.add(run);
	const onStorage = (e) => e.key?.startsWith(PREFIX) && run();
	if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
	return () => {
		listeners.delete(run);
		if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
	};
};

export const skillKey = (courseName, skillId) => `${courseName}/${skillId}`;

export default localDb;

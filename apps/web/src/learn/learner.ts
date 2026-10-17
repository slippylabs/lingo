// slippylabs: one learner's progress in one course, with the write rules in
// one place. Components hold a Learner and call these; nothing else writes.
import { dayNumber } from './dates';
import { grade, newState } from './srs';
import type { Graded } from './session';
import {
	loadProgress,
	saveDays,
	saveItems,
	saveLog,
	saveProfile,
	touchRecent,
	type CourseProgress
} from './store';
import type { ExType, Profile } from './types';

export class Learner {
	p: CourseProgress;
	today: number;

	constructor(course: string, now: number = Date.now()) {
		this.p = loadProgress(course);
		this.today = dayNumber(now);
	}

	get course() {
		return this.p.course;
	}
	get profile(): Profile | null {
		return this.p.profile;
	}
	get items() {
		return this.p.items;
	}

	setProfile(profile: Profile) {
		this.p.profile = profile;
		saveProfile(this.p);
		touchRecent(this.course);
	}

	noteSeen(skill: string) {
		if (!this.p.profile || this.p.profile.seenNotes.includes(skill)) return;
		this.p.profile.seenNotes.push(skill);
		saveProfile(this.p);
	}

	private day() {
		return (this.p.days[this.today] ??= { ex: 0, ok: 0, new: 0 });
	}

	/** Every answered exercise: the day's count (streak, goal) and the log (weak spots). */
	logAnswer(item: string, x: ExType, ok: boolean) {
		const d = this.day();
		d.ex++;
		if (ok) d.ok++;
		this.p.log.push({ d: this.today, i: item, x, ok: ok ? 1 : 0 });
		saveDays(this.p);
		saveLog(this.p);
		touchRecent(this.course);
	}

	/** An item settled by the session (once per session). */
	settle(g: Graded) {
		let st = this.p.items[g.id];
		if (!st) {
			st = newState(g.skill, this.today);
			this.day().new++;
			saveDays(this.p);
		}
		this.p.items[g.id] = grade(st, g.outcome, this.today, g.tier);
		saveItems(this.p);
	}

	save() {
		saveItems(this.p);
		saveProfile(this.p);
		saveDays(this.p);
	}
}

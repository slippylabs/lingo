<script lang="ts">
	// slippylabs: the handful of icons the app uses, inline (no icon font).
	let { name, size = 22, label = '' }: { name: string; size?: number; label?: string } = $props();
	const P: Record<string, string> = {
		speaker:
			'M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z',
		slow: 'M3 9v6h4l5 4V5L7 9H3zm11 1h7v2h-7zm0 4h5v2h-5z',
		close: 'M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3z',
		check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
		x: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
		flame:
			'M13.5.7s.7 2.6.7 4.8c0 2-1.3 3.7-3.4 3.7-2 0-3.6-1.7-3.6-3.7v-.3C5.3 7.6 4 10.6 4 14a8 8 0 0 0 16 0C20 8.6 17.4 3.8 13.5.7zM11.7 20c-1.8 0-3.2-1.4-3.2-3.1 0-1.6 1-2.8 2.8-3.1 1.8-.4 3.6-1.2 4.6-2.6.4 1.3.6 2.6.6 4A4.8 4.8 0 0 1 11.7 20z',
		book: 'M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',
		gear: 'M19.1 12.9a7 7 0 0 0 0-1.8l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.6-.9L14.8 3h-4l-.4 2.6a7 7 0 0 0-1.5.9l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 1.8l-2 1.6 2 3.4 2.4-1c.5.4 1 .7 1.5.9l.4 2.6h4l.4-2.6c.6-.2 1.1-.5 1.6-.9l2.4 1 2-3.4zM12.8 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
		list: 'M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zm-4 6h2v2H3zm4 0h14v2H7z',
		home: 'M12 3 2 12h3v8h6v-6h2v6h6v-8h3z',
		bulb: 'M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z',
		back: 'M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z',
		play: 'M8 5v14l11-7z',
		target:
			'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm0-6a2 2 0 1 0 2 2 2 2 0 0 0-2-2z',
		repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z'
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="currentColor"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label || undefined}
	style="flex:none"><path d={P[name] ?? ''} /></svg
>

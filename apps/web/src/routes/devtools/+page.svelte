<script lang="ts">
	import NavBar from "../../components/NavBar.svelte"
	import Content from "lluis/Content.svelte"

	export let data

	$: testSkills = data.testSkills ?? []
</script>

<svelte:head>
	<title>LibreLingo - Development</title>
</svelte:head>

<NavBar />

<section class="section">
	<div class="container">
		<Content>
			<h1 class="is-size-1">Development tools</h1>
			<h2 class="is-size-2">Test pages</h2>
			<ul>
				<li><a href="/course/test-1">Test course (English UI)</a></li>
				<li><a href="/course/test-2">Test course (Spanish UI)</a></li>
				{#each testSkills as testSkill}
					<li>
						<a
							target="_blank"
							href="/course/test-1/skill/{testSkill}"
							rel="noreferrer"
						>
							Test skill:
							<b>{testSkill}</b>
						</a>
					</li>
				{/each}
			</ul>
		</Content>
	</div>
</section>

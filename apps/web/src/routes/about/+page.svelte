<script lang="ts">
	import MarkDownPage from "../../components/MarkDownPage.svelte"
	import { _ } from "svelte-i18n"

	export let data

	$: readmeHTML = data.readmeHTML
</script>

<MarkDownPage
	{readmeHTML}
	title="About LibreLingo"
	description={$_("about.meta.description")}
/>

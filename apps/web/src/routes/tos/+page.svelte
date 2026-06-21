<script lang="ts">
	import MarkDownPage from "../../components/MarkDownPage.svelte"

	export let data

	$: readmeHTML = data.readmeHTML
</script>

<MarkDownPage {readmeHTML} title="Terms of Service" />

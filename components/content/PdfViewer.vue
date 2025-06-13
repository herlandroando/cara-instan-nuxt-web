<script setup lang="ts">
interface Props {
  url: string;
}
const props = defineProps<Props>();
</script>

<template>
<ClientOnly>
    <PdfViewerClient :url="props.url" />
</ClientOnly>
</template>
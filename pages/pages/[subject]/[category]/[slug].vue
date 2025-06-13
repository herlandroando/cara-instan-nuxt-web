<script setup lang="ts">
import type { PagesCollectionItem } from '@nuxt/content'

const route = useRoute()

const page = await useAsyncData(() => {
  try {
    return queryCollection('pages').path(`/pages/${route.params?.category}/${route.params?.slug}`).first()
  } catch (error) {
    console.error('Error fetching page data:', error)
    return new Promise<PagesCollectionItem>((resolve) => resolve({
      title: 'Not Found',
      description: 'The requested page could not be found.',
    } as PagesCollectionItem))
  }
})

const pageNotFound = ref(false)

useSeoMeta({
  title: page.data.value?.title,
  description: page.data.value?.description
})

watch(page.data, (newData) => {
  if (!newData) {
    pageNotFound.value = true
    useSeoMeta({
      title: 'Page Not Found',
      description: 'The requested page could not be found.'
    })
  }
}, { immediate: true })

</script>

<template>
  <div class="flex items-center justify-center py-5">
    <ContentRenderer class="px-4 prose lg:prose-lg lg:px-0" v-if="!pageNotFound && page.data.value" :value="page.data.value" />
    <div v-else class="text-center h-[90vh] flex flex-col justify-center items-center">
      <h1 class="text-2xl font-bold">Page Not Found</h1>
      <p>The requested page could not be found.</p>
    </div>
  </div>
</template>

<style></style>

<script setup lang="ts">
import type { PagesCollectionItem } from '@nuxt/content'

const route = useRoute()

const pages = await useAsyncData(() => {
  try {
    console.log('Fetching pages for category:', route.params?.category)
    return queryCollection('pages').where('path','LIKE','%/pages/ui-ux%').all()
  } catch (error) {
    console.error('Error fetching pages:', error)
    return new Promise<PagesCollectionItem[]>(resolve => resolve([]))
  }
})

watch(pages.data, (newData) => {
  console.log('Pages data updated:', newData)
  if (!newData || newData.length === 0) {
    useSeoMeta({
      title: 'No Pages Found',
      description: 'There are no pages available in this category.'
    })
  } else {
    useSeoMeta({
      title: `Category: ${route.params?.category}`,
      description: `Pages available in the ${route.params?.category} category.`
    })
  }
}, { immediate: true })

</script>

<template>
  <div class="flex flex-col items-center py-5">
    <h1 class="mb-4 text-2xl font-bold">Category: {{ route.params?.category }}</h1>
    <div v-if="pages.data?.value?.length != null && pages.data.value.length > 0" class="w-full max-w-4xl">
      <ul class="pl-5 list-disc">
        <li v-for="page in pages.data.value" :key="page.title" class="mb-2">
          <NuxtLink :to="page.path" class="text-blue-600 hover:underline">
            {{ page.title }}
          </NuxtLink>
          <p class="text-sm text-muted-foreground">{{ page.description }}</p>
        </li>
      </ul>
    </div>
    <div v-else class="text-center h-[90vh] flex flex-col justify-center items-center">
      <h2 class="text-xl font-semibold">No pages found in this category.</h2>
    </div>
  </div>
</template>
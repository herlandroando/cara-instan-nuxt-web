<script setup lang="ts">
import type { PagesCollectionItem } from '@nuxt/content'
import { capitalize } from 'vue'

const route = useRoute()

const titleSubject = computed(() => {
  return route.params?.subject ? capitalize(`${route.params.subject}`) : 'Default'
})

const pages = await useAsyncData(() => {
  try {
    const subject = route.params?.subject || 'default'
    if (!subject) {
      console.warn('No subject provided, defaulting to "default"')
    }
    return queryCollection('pages').where('path', 'LIKE', '%/pages/' + subject +'%').all()
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
      title: `Subject: ${route.params?.subject}`,
      description: `Pages available in the ${route.params?.subject} subject category.`
    })
  }
}, { immediate: true })

</script>

<template>
  <div class="flex flex-col items-center py-5">
    <h1 class="mb-4 text-2xl font-bold">Subject: {{ titleSubject }}</h1>
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
      <h2 class="text-xl font-semibold">No pages found in this subject.</h2>
    </div>
  </div>
</template>
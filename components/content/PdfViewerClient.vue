<script setup lang="ts">
import * as pdfJs from "pdfjs-dist";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api";

type Props = {
  url: string;
};

const props = defineProps<Props>();

// Set PDF.js worker path
pdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs`;

// State variables
const pdfDoc = ref<pdfJs.PDFDocumentProxy | null>(null);
const pageNum = ref(1);
const pageCount = ref(0);
const pageRendering = ref(false);
const pageNumPending = ref<number | null>(null);
const scale = ref(1.2);
const canvas = ref<HTMLCanvasElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Additional state variables
const containerRef = ref<HTMLDivElement | null>(null);
const pdfViewerRef = ref<HTMLDivElement | null>(null);
const isFullscreen = ref(false);

// Load PDF documentss
const loadPdf = async () => {
  loading.value = true;
  error.value = null;

  try {
    const loadingTask = pdfJs.getDocument(props.url);
    pdfDoc.value = await loadingTask.promise;
    pageCount.value = pdfDoc.value.numPages;
    console.log("PDF loaded",pdfDoc.value, "Page count:", pageCount.value);

    // Render first page
    renderPage(pageNum.value);
  } catch (err) {
    error.value = "Failed to load PDF document";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Render specific page
const renderPage = async (num: number) => {
  pageRendering.value = true;
  const pdfDocRaw = toRaw(pdfDoc.value); // Ensure pdfDoc is reactive

  if (pdfDocRaw === null) {
    error.value = "PDF document not loaded";
    pageRendering.value = false;
    return;
  }
  
  try {
    const page = await pdfDocRaw.getPage(num);
    
    // Get container dimensions if available
    let containerWidth = 0;
    if (containerRef.value) {
      containerWidth = containerRef.value.clientWidth - 40; // account for padding
    }
    
    // Calculate scale based on container width
    const viewport = page.getViewport({ scale: 1.0 });
    const scaleFactor = containerWidth > 0 ? containerWidth / viewport.width : scale.value;
    const scaledViewport = page.getViewport({ scale: scaleFactor });

    if (!canvas.value) return;

    const context = canvas.value.getContext('2d');
    canvas.value.height = scaledViewport.height;
    canvas.value.width = scaledViewport.width;

    if (!context) {
      error.value = "Failed to get canvas context";
      pageRendering.value = false;
      return;
    }

    const renderContext : RenderParameters = {
      canvasContext: context,
      viewport: scaledViewport,
    };

    await page.render(renderContext).promise;
    pageRendering.value = false;

    if (pageNumPending.value !== null) {
      renderPage(pageNumPending.value);
      pageNumPending.value = null;
    }
  } catch (err) {
    pageRendering.value = false;
    error.value = "Failed to render page";
    console.error(err);
  }
};

// Queue rendering of a page
const queueRenderPage = (num: number) => {
  if (pageRendering.value) {
    pageNumPending.value = num;
  } else {
    renderPage(num);
  }
};

// Go to previous page
const prevPage = () => {
  if (pageNum.value <= 1) return;
  pageNum.value--;
  queueRenderPage(pageNum.value);
};

// Go to next page
const nextPage = () => {
  if (pageNum.value >= pageCount.value) return;
  pageNum.value++;
  queueRenderPage(pageNum.value);
};

// Zoom controls
const zoomIn = () => {
  scale.value += 0.2;
  queueRenderPage(pageNum.value);
};

const zoomOut = () => {
  if (scale.value <= 0.4) return;
  scale.value -= 0.2;
  queueRenderPage(pageNum.value);
};

// Go to specific page
const goToPage = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const num = parseInt(target.value);
  
  if (num > 0 && num <= pageCount.value) {
    pageNum.value = num;
    queueRenderPage(pageNum.value);
  }
};

// Fullscreen controls
const toggleFullscreen = async () => {
  if (!pdfViewerRef.value) return;
  
  if (!isFullscreen.value) {
    try {
      if (pdfViewerRef.value.requestFullscreen) {
        await pdfViewerRef.value.requestFullscreen();
      } else if ((pdfViewerRef.value as any).webkitRequestFullscreen) {
        await (pdfViewerRef.value as any).webkitRequestFullscreen();
      } else if ((pdfViewerRef.value as any).msRequestFullscreen) {
        await (pdfViewerRef.value as any).msRequestFullscreen();
      }
      isFullscreen.value = true;
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
    }
  } else {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      isFullscreen.value = false;
    } catch (err) {
      console.error('Error attempting to exit fullscreen:', err);
    }
  }
};

// Handle fullscreen change events
const handleFullscreenChange = () => {
  isFullscreen.value = !!(document.fullscreenElement || 
                         (document as any).webkitFullscreenElement || 
                         (document as any).msFullscreenElement);
};

// Watch for URL changes
watch(() => props.url, loadPdf);

// Watch for container size changes
const updateOnResize = () => {
  if (pageNum.value > 0) {
    queueRenderPage(pageNum.value);
  }
};

onMounted(() => {
  loadPdf();
  window.addEventListener('resize', updateOnResize);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateOnResize);
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('msfullscreenchange', handleFullscreenChange);
});
</script>

<template>
  <div ref="pdfViewerRef" class="pdf-viewer flex flex-col w-full bg-white rounded-lg shadow-md overflow-hidden">
    <!-- PDF Viewer Header -->
    <div class="bg-gray-100 p-3 border-b border-gray-200 flex items-center justify-end">
      <!-- Fullscreen Button -->
      <button @click="toggleFullscreen" class="p-2 rounded-full hover:bg-gray-200 transition-colors" :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <!-- PDF Content -->
    <div ref="containerRef" class="flex-1 relative bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
      <!-- Loading Indicator -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Error Message -->
      <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-white">
        <div class="text-red-500 text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{{ error }}</p>
        </div>
      </div>
      
      <!-- Side Navigation Buttons -->
      <button 
        @click="prevPage" 
        :disabled="pageNum <= 1"
        :class="{'opacity-50 cursor-not-allowed': pageNum <= 1}"
        class="absolute left-6 z-10 p-3 rounded-full bg-gray-200 bg-opacity-70 hover:bg-opacity-100 transition-all transform hover:scale-105 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        @click="nextPage" 
        :disabled="pageNum >= pageCount"
        :class="{'opacity-50 cursor-not-allowed': pageNum >= pageCount}"
        class="absolute right-6 z-10 p-3 rounded-full bg-gray-200 bg-opacity-70 hover:bg-opacity-100 transition-all transform hover:scale-105 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <!-- PDF Canvas -->
      <div class="flex items-center justify-center h-full w-full">
        <canvas ref="canvas" class="shadow-lg"></canvas>
      </div>
    </div>

    <!-- PDF Controls -->
    <div class="bg-gray-100 p-3 border-t border-gray-200 flex items-center justify-between">
      <!-- Page Navigation -->
      <div class="flex items-center space-x-2">
        <div class="text-sm text-gray-600">
          <input 
            type="number" 
            :value="pageNum" 
            @change="goToPage" 
            min="1" 
            :max="pageCount" 
            class="w-12 text-center border border-gray-300 rounded p-1"
          />
          <span class="mx-1">of</span>
          <span>{{ pageCount }}</span>
        </div>
      </div>
      
      <!-- File Info -->
      <div class="text-xs text-gray-500">
        <span>{{ url.split('/').pop() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-viewer {
  max-height: 70vh;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

canvas {
  max-width: 100%;
  max-height: calc(70vh - 100px); /* Account for header and footer */
  object-fit: contain;
}

:fullscreen .pdf-viewer {
  max-height: 100vh;
  height: 100vh;
}

:fullscreen canvas {
  max-height: calc(100vh - 100px);
}

:-webkit-full-screen .pdf-viewer {
  max-height: 100vh;
  height: 100vh;
}

:-webkit-full-screen canvas {
  max-height: calc(100vh - 100px);
}

:-ms-fullscreen .pdf-viewer {
  max-height: 100vh;
  height: 100vh;
}

:-ms-fullscreen canvas {
  max-height: calc(100vh - 100px);
}

button:disabled {
  cursor: not-allowed;
}

@media (max-width: 640px) {
  button.absolute {
    padding: 0.5rem;
  }
  
  button.absolute svg {
    width: 1rem;
    height: 1rem;
  }
}
</style>
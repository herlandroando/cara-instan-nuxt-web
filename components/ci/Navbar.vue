<template>
  <header class="sticky p-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <!-- Logo -->
      <div class="mr-4 flex">
        <NuxtLink
          to="/"
          class="mr-6 flex items-center space-x-2"
        >
          <span class="font-bold text-xl">Cara Instan</span>
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex">
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <NuxtLink
            to="/about"
            class="transition-colors hover:text-foreground/80 text-muted-foreground"
          >
            About
          </NuxtLink>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="h-8 w-8 p-0">
                <span class="transition-colors hover:text-foreground/80 text-muted-foreground">
                  Services
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>
                <NuxtLink to="/services/service1">Service 1</NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NuxtLink to="/services/service2">Service 2</NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NuxtLink to="/services/service3">Service 3</NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NuxtLink
            to="/contact"
            class="transition-colors hover:text-foreground/80 text-muted-foreground"
          >
            Contact
          </NuxtLink>
        </nav>
      </div>

      <!-- Right Side Items -->
      <div class="flex flex-1 items-center justify-end space-x-4">
        <div class="hidden md:flex">
          <Button variant="outline" class="mr-2">Sign In</Button>
          <Button>Get Started</Button>
        </div>

        <!-- Mobile Menu Button -->
        <Sheet>
          <SheetTrigger class="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <MenuIcon class="h-5 w-5" />
              <span class="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="pr-0">
            <div class="px-7">
              <SheetHeader>
                <SheetTitle class="text-left">Cara Instan</SheetTitle>
                <SheetDescription class="text-left">
                  Navigation
                </SheetDescription>
              </SheetHeader>
              <nav class="flex flex-col gap-4 mt-8">
                <NuxtLink
                  to="/"
                  class="text-foreground text-sm"
                >
                  Home
                </NuxtLink>
                <NuxtLink
                  to="/about"
                  class="text-muted-foreground text-sm"
                >
                  About
                </NuxtLink>
                <div class="flex flex-col ml-4 gap-3 mt-2">
                  <NuxtLink
                    to="/services/service1"
                    class="text-muted-foreground text-sm"
                  >
                    Service 1
                  </NuxtLink>
                  <NuxtLink
                    to="/services/service2"
                    class="text-muted-foreground text-sm"
                  >
                    Service 2
                  </NuxtLink>
                  <NuxtLink
                    to="/services/service3"
                    class="text-muted-foreground text-sm"
                  >
                    Service 3
                  </NuxtLink>
                </div>
                <NuxtLink
                  to="/contact"
                  class="text-muted-foreground text-sm"
                >
                  Contact
                </NuxtLink>
              </nav>
              <div class="mt-8 flex flex-col gap-2">
                <Button variant="outline" class="w-full">Sign In</Button>
                <Button class="w-full">Get Started</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { MenuIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
</script>
<script lang="ts" setup>
import Button from '@/components/ui/button/Button.vue'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Hand, Plus, Trash2 } from 'lucide-vue-next'

const meta = ref<{ icon?: string; title?: string }>({});
const handleGetDocumentMeta = async () => {
  const [currentTab] = await browser.tabs.query({
    currentWindow: true,
    active: true
  });
  console.log(currentTab);
  
  meta.value = {
    icon: currentTab.favIconUrl,
    title: currentTab.title
  }
};

onMounted(() => {
  handleGetDocumentMeta();
});
</script>

<template>
  <div class="min-h-screen text-base px-4">
    <div class="py-3 flex items-center">
      <div class="text-2xl">AI浏览器爬虫</div>
    </div>
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Button class="size-5 p-0 rounded-full">1</Button>
          <h3 class="text-md font-semibold">配置数据源</h3>
        </div>
        <Tabs default-value="current">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="current">
              当前页面
            </TabsTrigger>
            <TabsTrigger value="password" :disabled="true">
              功能开发中
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <div class="py-2">
              <div class="flex items-center space-x-2">
                <img v-if="meta.icon" class="size-6" :src="meta.icon" alt="">
                <div class="font-medium text-sm text-gray-500 truncate">{{ meta.title }}</div>
              </div>
            </div>
            <Fieldset>
              <Field>
                <FieldLabel for="checkout-7j9-card-name-43j">
                  分页方式
                </FieldLabel>
                <Select default-value="none">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="选择分页机制" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不翻页</SelectItem>
                    <SelectItem value="click">点击翻页</SelectItem>
                    <SelectItem value="scroll_down">滚动翻页</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Fieldset>
            
          </TabsContent>
          <TabsContent value="password">
          </TabsContent>
        </Tabs>
      </div>
      <div class="space-y-2">
        <div class="flex items-center space-x-2">
          <Button class="size-5 p-0 rounded-full">2</Button>
          <h3 class="text-md font-semibold">选择爬虫模板</h3>
        </div>
        <div class="flex justify-end">
          <Button class="cursor-pointer" variant="ghost">
            <Plus class="size-5" />
            <span>新建爬虫模板</span>
          </Button>
        </div>
        <RadioGroup default-value="option-one">
          <Card class="p-2">
            <CardHeader class="p-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="option-one" value="option-one" />
                  <h3>新建模板1</h3>
                </div>
                <div class="flex items-center space-x-1">
                  <Button class="cursor-pointer" variant="ghost">
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </RadioGroup>
      </div>
    </div>
    
    <div class="fixed bottom-0 inset-x-0 p-4">
      <Button class="w-full cursor-pointer" @click="handleGetDocumentMeta">
        <Hand />
        <span>开始抓取</span>
      </Button>
    </div>
  </div>
</template>

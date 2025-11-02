<script lang="ts" setup>
import { sendMessage, onMessage } from "@/lib/messaging";
import Button from "@/components/ui/button/Button.vue";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Hand, Plus, Trash2, ALargeSmall, X } from "lucide-vue-next";

const pageTitle = ref<string>("正在获取页面信息...");
const pageIcon = ref<string>("");
const currentTabId = ref<number | undefined>(undefined);
const isCrawling = ref<boolean>(false);

const config = ref({
  pagination: {
    type: "none",
    nextPageSelector: "",
    scrollCount: 10,
    scrollInterval: 1000,
  },
  templates: [
    {
      name: "爬虫模板1",
      selected: true,
      fields: [
        { name: "", type: "text", selector: "", description: "" },
        { name: "", type: "text", selector: "", description: "" },
        { name: "", type: "text", selector: "", description: "" },
      ]
    }
  ]
});

watch(
  () => config.value.pagination.type,
  async (newVal) => {
    if (newVal === "click") {
      sendMessage(
        "startPaginationPicking",
        undefined,
        currentTabId.value
      );
    } else {
      config.value.pagination.nextPageSelector = "";
      sendMessage(
        "stopPaginationPicking",
        undefined,
        currentTabId.value
      );
    }
  }
);

const selectedTemplate = computed({
  get: () => {
    const selected = config.value.templates.find(t => t.selected);
    return selected ? selected.name : null;
  },
  set: (value: string) => {
    config.value.templates.forEach(t => {
      t.selected = (t.name === value);
    });
  }
});

const handleGetDocumentMeta = async () => {
  const [currentTab] = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  if (currentTab && currentTab.id) {
    currentTabId.value = currentTab.id; // 存储当前标签页ID
    pageTitle.value = currentTab.title || "无法访问此页面";
    pageIcon.value = currentTab.favIconUrl || "";
  }
};

const handleTabUpdate = (
  tabId: number,
  changeInfo: Browser.tabs.OnUpdatedInfo,
  tab: Browser.tabs.Tab
) => {
  // 确保是当前我们关注的标签页发生了变化
  if (tabId === currentTabId.value) {
    if (changeInfo.title) {
      pageTitle.value = changeInfo.title;
    }
    if (changeInfo.favIconUrl) {
      pageIcon.value = changeInfo.favIconUrl;
    }
    // 当页面加载完成时，标题和图标可能都已经最终确定，可以再更新一次
    if (changeInfo.status === "complete" && tab) {
      pageTitle.value = tab.title || "无法访问此页面";
      pageIcon.value = tab.favIconUrl || "";
    }
  }
};

const handleAddField = (templateIndex: number) => {
  config.value.templates[templateIndex].fields.push({ name: "", type: "text", selector: "", description: "" });
};

const handleRemoveField = (templateIndex: number, fieldIndex: number) => {
  const fields = config.value.templates[templateIndex].fields;
  if (fields.length === 1) {
    return;
  }

  fields.splice(fieldIndex, 1);
};

const handleStartCrawling = async () => {
  isCrawling.value = true;
  await storage.setItem('local:crawlConfig', config.value);
  await sendMessage("startCrawl");
  isCrawling.value = false;
};

onMounted(() => {
  handleGetDocumentMeta();
  browser.tabs.onUpdated.addListener(handleTabUpdate);

  onMessage("resetPaginationMethod", () => {
    config.value.pagination.type = "none";
    sendMessage("stopPaginationPicking", undefined, currentTabId.value);
  });

  onMessage("paginationSelectorPicked", ({ data: selector }) => {
    config.value.pagination.nextPageSelector = selector;
  });
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
						<TabsTrigger value="current"> 当前页面 </TabsTrigger>
						<TabsTrigger value="password" :disabled="true">
							功能开发中
						</TabsTrigger>
					</TabsList>
					<TabsContent value="current">
						<div class="py-2">
							<div class="flex items-center space-x-2">
								<img
									v-if="pageIcon"
									class="size-6"
									:src="pageIcon"
									alt=""
								/>
								<div
									class="font-medium text-sm text-gray-500 truncate"
								>
									{{ pageTitle }}
								</div>
							</div>
						</div>
						<Fieldset>
							<FieldGroup class="gap-4">
								<Field>
									<FieldLabel>分页方式</FieldLabel>
									<Select v-model="config.pagination.type">
										<SelectTrigger class="w-full">
											<SelectValue
												placeholder="选择分页机制"
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none"
												>不翻页</SelectItem
											>
											<SelectItem value="click"
												>点击翻页</SelectItem
											>
											<SelectItem value="scroll_down"
												>滚动翻页</SelectItem
											>
										</SelectContent>
									</Select>
								</Field>
								<Field
									v-if="
										config.pagination.type === 'click' &&
										config.pagination.nextPageSelector
									"
								>
									<FieldLabel>分页元素选择器</FieldLabel>
									<Badge
										class="max-w-56"
										variant="secondary"
										:title="
											config.pagination.nextPageSelector
										"
										><span class="truncate">{{
											config.pagination.nextPageSelector
										}}</span></Badge
									>
								</Field>
								<Field
									v-if="
										config.pagination.type === 'scroll_down'
									"
								>
									<FieldLabel>滚动次数</FieldLabel>
									<Input
										v-model="config.pagination.scrollCount"
										type="number"
										min="1"
									/>
								</Field>
								<Field
									v-if="
										config.pagination.type === 'scroll_down'
									"
								>
									<FieldLabel>滚动间隔 (毫秒)</FieldLabel>
									<Input
										v-model="
											config.pagination.scrollInterval
										"
										type="number"
										min="100"
									/>
								</Field>
							</FieldGroup>
						</Fieldset>
					</TabsContent>
					<TabsContent value="password"> </TabsContent>
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
				<RadioGroup v-bind:model-value="selectedTemplate">
					<Card v-for="template, templateIndex in config.templates" class="px-2 py-4 gap-4">
						<CardHeader class="px-2 py-0">
							<div
								class="flex items-center justify-between space-x-4"
							>
								<div class="flex items-center space-x-0.5">
									<RadioGroupItem
										:value="template.name"
									/>
									<Input
										class="hover:border-input border-transparent shadow-none"
										v-model="template.name"
									/>
								</div>
								<div class="flex items-center space-x-1">
									<Button
										class="cursor-pointer"
										variant="ghost"
									>
										<Trash2 />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent class="px-2 py-2">
							<div class="space-y-4">
                <div v-for="field, fieldIndex in template.fields" class="flex items-center space-x-0.5">
                  <div class="flex-auto">
                    <InputGroup>
                    <InputGroupInput placeholder="字段名称" v-model="field.name" />
                    <InputGroupAddon align="inline-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                          <InputGroupButton
                            variant="ghost"
                            title="文本"
                          >
                            <ALargeSmall />
                          </InputGroupButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          class="[--radius:0.95rem]"
                        >
                          <DropdownMenuItem
                            >Documentation</DropdownMenuItem
                          >
                          <DropdownMenuItem
                            >Blog
                            Posts</DropdownMenuItem
                          >
                          <DropdownMenuItem
                            >Changelog</DropdownMenuItem
                          >
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton variant="secondary"
                        >配置</InputGroupButton
                      >
                    </InputGroupAddon>
                  </InputGroup>
                  </div>
                  <div class="flex-none">
                    <Button class="px-2" variant="ghost" @click="handleRemoveField(templateIndex, fieldIndex)">
                      <X class="size-4" />
                    </Button>
                  </div>
                </div>
							</div>
						</CardContent>
						<CardFooter class="px-2 py-0">
							<Button class="cursor-pointer" variant="outline" @click="handleAddField(templateIndex)">
								<Plus class="size-5" />
								<span>添加字段</span>
							</Button>
						</CardFooter>
					</Card>
				</RadioGroup>
			</div>
		</div>

		<div class="fixed bottom-0 inset-x-0 p-4">
			<Button
				class="w-full cursor-pointer"
				@click="handleStartCrawling"
			>
        <Loader2 v-if="isCrawling" class="w-4 h-4 mr-2 animate-spin" />
				<Hand v-else />
				<span>{{ isCrawling ? "正在抓取..." : "开始抓取" }}</span>
			</Button>
		</div>
	</div>
</template>

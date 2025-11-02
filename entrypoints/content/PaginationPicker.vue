<template>
    <div class="fixed top-20 inset-x-0 flex justify-center">
        <Card>
            <CardHeader>
                <CardTitle>选择分页元素</CardTitle>
                <CardDescription>请点击页面上的元素以选择用于分页的“下一页”按钮。</CardDescription>
            </CardHeader>
            <CardContent>
                <p class="mt-2 text-sm text-gray-500">点击后，扩展将尝试识别并记录该按钮的选择器。</p>
            </CardContent>
            <CardFooter>
                <div class="w-full flex items-center justify-between">
                    <span>1 / 3</span>
                    <Button class="cursor-pointer" variant="outline" @click="handleCancel">取消</Button>
                </div>
            </CardFooter>
        </Card>
    </div>
</template>
<script lang="ts" setup>
import { sendMessage } from "@/lib/messaging";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const handleCancel = async () => {
  await sendMessage("resetPaginationMethod");
};

</script>
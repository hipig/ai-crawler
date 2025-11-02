import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
    startPaginationPicking(): void;
    stopPaginationPicking(): void;
    resetPaginationMethod(): void;
    paginationSelectorPicked(selector: string): void;

    startCrawl(): void;
    scrapeCurrentPage(fields: any): any[];
    clickNextPage(nextPageSelector: string): boolean;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
import { onMessage, sendMessage } from '@/lib/messaging'

export default defineBackground(() => {
  browser.action.onClicked.addListener(tab => browser.sidePanel.open({windowId: tab.windowId}));

  let allResults: any[] = [];
  let crawlConfig: any = null;

  const startCrawl = async () => {
    try {
      allResults = []; // 重置结果
      crawlConfig = await storage.getItem('local:crawlConfig');
      if (!crawlConfig) throw new Error('No crawl config found.');

      const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!currentTab || !currentTab.id) throw new Error('No active tab found.');

      await executeCrawling(currentTab.id);
    } catch (error) {
      console.error('Error starting crawl:', error);
    }
  };

  async function executeCrawling(tabId: number) {
    const { pagination, templates } = crawlConfig;
    console.log(pagination, templates);
    

    const selectedTemplate = templates.find((t: any) => t.selected);
    const fields = selectedTemplate.fields;
    
    const scrapeAndStore = async () => {
      const data = await sendMessage('scrapeCurrentPage', fields, tabId);
      if (data && data.length > 0) {
        allResults.push(...data);
      }
    };

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    switch (pagination.type) {
      case 'none':
        await scrapeAndStore();
        break;
      case 'scroll_down':
          for (let i = 0; i < pagination.scrollCount; i++) {
            await scrapeAndStore();
            await browser.scripting.executeScript({
              target: { tabId },
              func: () => window.scrollTo(0, document.body.scrollHeight),
            });
            await sleep(pagination.scrollInterval);
          }
        break;
      case 'click':
        let hasNextPage = true;

        while (hasNextPage) {
          await scrapeAndStore();

          const pageLoadPromise = new Promise(resolve => {
            const listener = (updatedTabId: number, changeInfo: Browser.tabs.OnUpdatedInfo) => {
                if (updatedTabId === tabId && changeInfo.status === 'complete') {
                    browser.tabs.onUpdated.removeListener(listener);
                    resolve(true);
                }
            };
            browser.tabs.onUpdated.addListener(listener);
          });

          const clicked = await sendMessage(
            'clickNextPage',
            pagination.nextPageSelector,
            tabId
          );

          if (clicked) {
              await Promise.race([pageLoadPromise, sleep(10000)]);
          } else {
            hasNextPage = false;
          }
        }
      break;
    }

  }

  onMessage('startCrawl', startCrawl);
});


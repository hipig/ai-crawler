import { onMessage, sendMessage } from "@/lib/messaging";
import { createApp } from "vue";
import PaginationPicker from "./PaginationPicker.vue";
import "@/assets/globals.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: 'ui',
  async main(ctx) {
    console.log('Hello content.');

    let isPicking: boolean = false;
    let overlayElement: HTMLDivElement | null = null;

    const ui = await createShadowRootUi(ctx, {
      name: 'pagination-picker',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = createApp(PaginationPicker);
        app.mount(container);
        return app;
      },
      onRemove: (app) => {
        // Unmount the app when the UI is removed
        app?.unmount();
      },
    });

    const handleMouseOver = (e: MouseEvent) => {
      if (!isPicking || !overlayElement) return;

      const target = e.target as Element;

      if (target === overlayElement) return;

      const rect = target.getBoundingClientRect();

      Object.assign(overlayElement.style, {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'block', // 显示覆盖层
      });
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (!isPicking) return;

      e.preventDefault();
      e.stopPropagation();
      const target = e.target as Element;

      if (target === overlayElement) return;

      const selector = getCssSelector(target);
      console.log(selector);

      sendMessage('paginationSelectorPicked', selector);
      stopPaginationPicking();
    };

    const startPaginationPicking = async () => {
      isPicking = true;

      ui.mount();

      if (overlayElement) {
        overlayElement.remove();
      }

      overlayElement = document.createElement('div');
      Object.assign(overlayElement.style, {
        position: 'absolute', // 使用 absolute 以便跟随页面滚动
        border: '1px solid rgb(88, 199, 255)',
        background: 'rgba(88, 199, 255, 0.2)',
        zIndex: '999999999',
        pointerEvents: 'none', // 关键！让鼠标事件穿透覆盖层
        display: 'none', // 初始时隐藏
      });
      document.body.appendChild(overlayElement);

      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('click', handleMouseClick, true);
    };

    const stopPaginationPicking = () => {
      isPicking = false;

      ui.remove();

      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('click', handleMouseClick, true);
      
      if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
      }
    };

    const scrapeCurrentPage = (fields: {name: string, selector: string}[]): any[] => {
      const results: Record<string, any>[] = [];
      const firstFieldElements = document.querySelectorAll(fields[0].selector);

      for (let i = 0; i < firstFieldElements.length; i++) {
        const item: Record<string, any> = {};
        for (const field of fields) {
          const elements = document.querySelectorAll(field.selector);
          if (elements[i]) {
            item[field.name] = (elements[i] as HTMLElement).innerText || elements[i].getAttribute('href');
          } else {
            item[field.name] = null;
          }
        }
        results.push(item);
      }
      
      return results;
    };

    const clickNextPage = (nextPageSelector: string): boolean => {
      const nextPageElement = document.querySelector(nextPageSelector) as HTMLElement;
      if (nextPageElement) {
        nextPageElement.click();
        return true;
      }
      return false;
    };

    onMessage('startPaginationPicking', () => startPaginationPicking());
    onMessage('stopPaginationPicking', () => stopPaginationPicking());
    onMessage('scrapeCurrentPage', ({data: fields}) => scrapeCurrentPage(fields));
    onMessage('clickNextPage', ({data: nextPageSelector}) => clickNextPage(nextPageSelector));

    function getCssSelector(el: Element): string {
      if (!(el instanceof Element)) return '';
      if (el.id) return `#${el.id}`;
      const path: string[] = [];
      while (el.parentElement) {
        let selector = el.tagName.toLowerCase();
        const siblings = Array.from(el.parentElement.children);
        const sameTagSiblings = siblings.filter(e => e.tagName === el.tagName);
        if (sameTagSiblings.length > 1) {
          const index = sameTagSiblings.indexOf(el) + 1;
          selector += `:nth-of-type(${index})`;
        }
        path.unshift(selector);
        el = el.parentElement;
        if (el.id) {
          path.unshift(`#${el.id}`);
          break;
        }
      }
      return path.join(' > ');
    }
  }
});

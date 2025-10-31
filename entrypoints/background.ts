
export default defineBackground(() => {
  browser.action.onClicked.addListener(tab => browser.sidePanel.open({windowId: tab.windowId}));
});

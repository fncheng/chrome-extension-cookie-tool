// 添加日志工具函数
function logInfo(message) {
  console.log(`[Cookie传输工具] ${message}`);
}

function logError(message, error) {
  console.error(`[Cookie传输工具] ${message}`, error);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action, info } = request;
  
  if (action === 'transferCookie') {
    logInfo('接收到传输请求');
    
    try {
      const { sourceUrl, targetUrl, cookieKey } = info;
      let title = info.title || '未命名配置';
      
      if (!sourceUrl || !targetUrl || !cookieKey) {
        logError('参数不完整', { sourceUrl, targetUrl, cookieKey });
        sendResponse({
          success: false,
          message: '参数不完整，请检查输入'
        });
        return true;
      }
      
      // 解析 URL
      let sourceUrlObj, targetUrlObj;
      try {
        sourceUrlObj = new URL(sourceUrl);
        targetUrlObj = new URL(targetUrl);
      } catch (error) {
        logError('URL 解析失败', error);
        sendResponse({
          success: false,
          message: 'URL 格式不正确，请检查输入'
        });
        return true;
      }

      let cookieKeyArr = cookieKey.split(',').map(key => key.trim()).filter(key => key);
      
      if (cookieKeyArr.length === 0) {
        logError('Cookie 键名为空');
        sendResponse({
          success: false,
          message: '请至少提供一个有效的 Cookie 键名'
        });
        return true;
      }
      
      logInfo(`开始处理配置: ${title}，共 ${cookieKeyArr.length} 个 Cookie`);

      let processedCount = 0;
      let successCount = 0;

      for (let key of cookieKeyArr) {
        logInfo(`正在获取 Cookie: ${key}`);
        
        // 获取源网址的 cookie
        chrome.cookies.get({
          url: sourceUrl,
          name: key
        }, function (cookie) {
          if (cookie) {
            const { value, secure, httpOnly, sameSite, expirationDate } = cookie;
            logInfo(`成功获取 Cookie: ${key}, 开始设置到目标网址`);
            
            // 设置目标网址的 cookie
            chrome.cookies.set({
              url: targetUrl,
              name: key,
              value: value,
              domain: targetUrlObj.hostname,
              path: '/',
              secure: secure,
              httpOnly: httpOnly,
              sameSite: sameSite,
              expirationDate: expirationDate
            }, function (newCookie) {
              processedCount++;
              
              if (newCookie) {
                successCount++;
                logInfo(`Cookie ${key} 设置成功`);
              } else {
                const error = chrome.runtime.lastError;
                logError(`Cookie ${key} 设置失败`, error);
              }

              // 当所有 cookie 都处理完毕时发送响应
              if (processedCount === cookieKeyArr.length) {
                const message = `处理了 ${processedCount} 个 cookie，成功 ${successCount} 个`;
                logInfo(message);
                sendResponse({
                  success: successCount > 0,
                  message: message
                });
              }
            });
          } else {
            const error = chrome.runtime.lastError;
            logError(`获取 Cookie ${key} 失败`, error);
            
            processedCount++;
            
            // 当所有 cookie 都处理完毕时发送响应
            if (processedCount === cookieKeyArr.length) {
              const message = `处理了 ${processedCount} 个 cookie，成功 ${successCount} 个`;
              logInfo(message);
              sendResponse({
                success: successCount > 0,
                message: message
              });
            }
          }
        });
      }
      
      return true; // 保持消息通道开启
    } catch (error) {
      logError('处理过程中发生错误', error);
      sendResponse({
        success: false,
        message: '传输过程中发生错误: ' + error.message
      });
      return true;
    }
  }
  
  return false;
});
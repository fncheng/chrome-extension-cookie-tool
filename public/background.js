// Logging helpers
function logInfo(message) {
  console.log(`[CookieTransfer] ${message}`);
}

function logError(message, error) {
  console.error(`[CookieTransfer] ${message}`, error);
}

// chrome.cookies.set only accepts these sameSite values; the "unspecified" value
// returned by get() would throw if passed through directly.
const VALID_SAME_SITE = ['no_restriction', 'lax', 'strict'];

function normalizeSameSite(sameSite) {
  return VALID_SAME_SITE.includes(sameSite) ? sameSite : undefined;
}

// Read one cookie from the source and write it to the target.
// Returns whether it succeeded; swallows errors internally so the Promise always resolves.
async function transferSingleCookie(key, sourceUrl, targetUrl, targetHostname) {
  try {
    logInfo(`Getting cookie: ${key}`);
    const cookie = await chrome.cookies.get({ url: sourceUrl, name: key });

    if (!cookie) {
      logError(`Cookie not found on source: ${key}`);
      return false;
    }

    const { value, secure, httpOnly, sameSite, expirationDate } = cookie;
    logInfo(`Got cookie: ${key}, writing to target`);

    const newCookie = await chrome.cookies.set({
      url: targetUrl,
      name: key,
      value,
      domain: targetHostname,
      path: '/',
      secure,
      httpOnly,
      sameSite: normalizeSameSite(sameSite),
      expirationDate,
    });

    if (newCookie) {
      logInfo(`Cookie ${key} set successfully`);
      return true;
    }

    logError(`Failed to set cookie ${key}`, chrome.runtime.lastError);
    return false;
  } catch (error) {
    logError(`Cookie ${key} transfer error`, error);
    return false;
  }
}

// Handle a full transfer request. Always resolves to a response object regardless of
// success/failure/exception, which is what prevents the popup from hanging on "loading".
async function handleTransfer(info) {
  const { sourceUrl, targetUrl, cookieKey } = info;
  const title = info.title || 'Untitled config';

  if (!sourceUrl || !targetUrl || !cookieKey) {
    logError('Incomplete parameters', { sourceUrl, targetUrl, cookieKey });
    return { success: false, message: 'Incomplete parameters, please check your input' };
  }

  let targetHostname;
  try {
    new URL(sourceUrl);
    targetHostname = new URL(targetUrl).hostname;
  } catch (error) {
    logError('URL parse failed', error);
    return { success: false, message: 'Invalid URL format, please check your input' };
  }

  const cookieKeyArr = cookieKey
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key);

  if (cookieKeyArr.length === 0) {
    logError('Empty cookie key');
    return { success: false, message: 'Please provide at least one valid cookie key' };
  }

  logInfo(`Processing config: ${title}, ${cookieKeyArr.length} cookie(s)`);

  const results = await Promise.all(
    cookieKeyArr.map((key) =>
      transferSingleCookie(key, sourceUrl, targetUrl, targetHostname)
    )
  );

  const successCount = results.filter(Boolean).length;
  const message = `Processed ${cookieKeyArr.length} cookie(s), ${successCount} succeeded`;
  logInfo(message);
  return { success: successCount > 0, message };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action !== 'transferCookie') {
    return false;
  }

  logInfo('Received transfer request');
  // Handle asynchronously, then respond once. The catch branch also responds,
  // so the message channel is never left hanging.
  handleTransfer(request.info)
    .then(sendResponse)
    .catch((error) => {
      logError('Uncaught error while processing', error);
      sendResponse({ success: false, message: 'Transfer failed: ' + error.message });
    });

  return true; // Keep the message channel open for the async sendResponse
});

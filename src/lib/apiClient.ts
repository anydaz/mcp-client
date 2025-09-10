type ApiFetchParams = {
  baseUrl?: string;
  endpoint: string;
  options?: RequestInit;
};

export const apiFetch = async <T>({
  baseUrl = "",
  endpoint,
  options,
  timeout = 10000,
}: ApiFetchParams & { timeout?: number }): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal, // Pass the abort signal to fetch
    });

    console.log(`API Fetch to ${url} responded with status ${response.status}`);

    clearTimeout(timeoutId); // Clear timeout if the response is received in time

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An error occurred");
    }

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("API Fetch Error: Request timed out");
      throw new Error("Request timed out. Please try again later.");
    } else {
      console.error("API Fetch Error:", error);
      throw error;
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

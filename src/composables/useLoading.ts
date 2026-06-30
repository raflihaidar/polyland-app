import { ref } from "vue";

export const useLoading = (initializedState = false) => {
  const isLoading = ref(initializedState);

  const startLoading = () => {
    isLoading.value = true;
  };

  const stopLoading = () => {
    isLoading.value = false;
  };

  const withLoading = (handler: () => Promise<void>) => async () => {
    if (isLoading.value) {
      return;
    }

    startLoading();

    await handler().catch((err) => console.error(err));

    stopLoading();
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

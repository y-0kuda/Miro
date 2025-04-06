// apiの機能とpendingの機能を合わせたhook
import { useState } from "react";
import { useMutation } from "convex/react";

// mutationFunctionはAPIそのもの
// eslint-disable-next-line
export const useApiMutation = (mutationFunction: any) => {
  const [pending, setPending] = useState(false);
  const apiMutation = useMutation(mutationFunction);

  // payloadはapiに必要なデータ
  // eslint-disable-next-line
  const mutate = (payload: any) => {
    setPending(true);
    return apiMutation(payload)
      .finally(() => setPending(false))
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      });
  };

  return { mutate, pending };
};

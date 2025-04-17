import { useMutation, useSelf } from "@/liveblocks.config";

export const useDeleteLayers = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(
    ({ storage, setMyPresence }) => {
      // layerを取得
      const liveLayers = storage.get("layers");
      // layerのidを取得
      const liveLayerIds = storage.get("layerIds");

      for (const id of selection) {
        // layerを削除
        liveLayers.delete(id);

        // layerが存在している場合、そのlayerのidを削除
        const index = liveLayerIds.indexOf(id);
        if (index !== -1) {
          liveLayerIds.delete(index);
        }
        setMyPresence({ selection: [] }, { addToHistory: true });
      }
    },
    [selection]
  );
};

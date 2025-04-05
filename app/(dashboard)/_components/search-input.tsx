"use client";

import qs from "query-string";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "usehooks-ts";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

export const SearchInput = () => {
  // URLを取得
  const router = useRouter();
  const [value, setValue] = useState("");
  // valueを少し遅らせてdebouncedValueに入れる
  // タイピングの途中ではなく、ある程度まとまって検索窓に表示させるため
  const debouncedValue = useDebounce(value, 500);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: {
          search: debouncedValue,
        },
      },
      // 検索窓に空文字やnullが入った際は無視する
      { skipEmptyString: true, skipNull: true }
    );
    // URLに追加する
    router.push(url);
  }, [debouncedValue, router]);

  return (
    <div className="w-full relative">
      {/* top1/2で親要素の縦半分を上端とする */}
      {/* 親要素の半分の位置と親要素の一番したが子の範囲となるがこれでは子がy軸に重要に寄らない */}
      {/* そこで下半分の半分を上にずらす（-translate-y-1/2）ことによって、子の要素が真ん中に寄せられる */}
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      {/* pl-9はSearchのアイコン用のスペース */}
      <Input
        className="w-full max-w-[516px] pl-9"
        placeholder="Search Boards"
        onChange={handleChange}
        value={value}
      />
    </div>
  );
};

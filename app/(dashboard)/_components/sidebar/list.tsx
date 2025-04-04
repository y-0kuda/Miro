"use client";

import { useOrganizationList } from "@clerk/nextjs";

import { Item } from "./item";

export const List = () => {
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      // 表示する要素数が多いときに、全てを一度に取得するのではなく、必要な分だけ段階的にデータを取得する
      infinite: true,
    },
  });

  if (!userMemberships.data?.length) return null;

  return (
    <ul className="space-y-4">
      {userMemberships.data?.map((mem) => (
        <Item
          key={mem.organization.id}
          id={mem.organization.id}
          name={mem.organization.name}
          imageUrl={mem.organization.imageUrl}
        />
      ))}
    </ul>
  );
};

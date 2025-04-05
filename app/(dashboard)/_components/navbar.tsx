"use client";

import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
} from "@clerk/nextjs";

import { SearchInput } from "./search-input";
import { InviteButton } from "./invite-button";

export const Navbar = () => {
  const { organization } = useOrganization();

  return (
    <div className="flex items-center gap-x-4 p-5 ">
      <div className="hidden lg:flex lg:flex-1 ">
        <SearchInput />
      </div>
      {/* このOrganizationSwitcherはモバイルモードで見える */}
      {/* このdivが横幅いっぱいに広がって、UserButtonを右に押し寄せる */}
      <div className="block lg:hidden flex-1">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: "376px",
              },
              organizationSwitcherTrigger: {
                // 要素内の外枠にゆとりを持たせ、文字を中に寄せるとともに枠自体を大きくする
                padding: "6px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                justifyContent: "space-between",
                backgroundColor: "white",
              },
            },
          }}
        />
      </div>
      {/* organizationが存在するときだけ、ボタンを表示する */}
      {organization && <InviteButton />}
      <UserButton />
    </div>
  );
};

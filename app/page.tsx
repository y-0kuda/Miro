import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <p>a screen for logged in users</p>
      <UserButton />
    </>
  );
}

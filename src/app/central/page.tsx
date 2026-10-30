import { Shell } from "@/components/Shell";
import { Central } from "./Central";

export const metadata = { title: "Central · PIRN" };

export default function Page() {
  return (
    <Shell atual="/central">
      <Central />
    </Shell>
  );
}

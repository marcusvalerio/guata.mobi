import { Shell } from "@/components/Shell";
import { Central } from "./Central";

export const metadata = { title: "Central · Guatá" };

export default function Page() {
  return (
    <Shell atual="/central">
      <Central />
    </Shell>
  );
}

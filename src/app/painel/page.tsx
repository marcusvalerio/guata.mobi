import { Shell } from "@/components/Shell";
import { Painel } from "./Painel";

export const metadata = { title: "Painel · Guatá" };

export default function Page() {
  return (
    <Shell atual="/painel">
      <Painel />
    </Shell>
  );
}

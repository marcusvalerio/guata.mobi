import { Shell } from "@/components/Shell";
import { PLATAFORMAS } from "@/lib/store";
import { Operacao } from "./Operacao";

export const metadata = { title: "Operação · Guatá" };

export default function Page() {
  return (
    <Shell atual="/operador">
      <Operacao plataformas={PLATAFORMAS} />
    </Shell>
  );
}
